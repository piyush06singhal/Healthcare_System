-- MEDIFLOW AI: MASTER CLINICAL SCHEMA
-- Unified and Hardened

-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. MASTER TABLES
-- ==========================================

-- USERS (Synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('patient', 'doctor', 'admin')) DEFAULT 'patient',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLINICAL STAFF
CREATE TABLE IF NOT EXISTS public.practitioners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('Active', 'On Leave', 'Emergency Only')) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.users(id) NOT NULL,
    doctor_id TEXT, 
    patient_name TEXT,
    doctor_name TEXT,
    appointment_date TIMESTAMPTZ DEFAULT NOW(),
    date TEXT, 
    time TEXT,
    type TEXT DEFAULT 'Video',
    status TEXT CHECK (status IN ('pending', 'accepted', 'cancelled', 'completed')) DEFAULT 'pending',
    reason TEXT,
    priority TEXT CHECK (priority IN ('normal', 'urgent', 'critical')) DEFAULT 'normal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BIOMETRICS
CREATE TABLE IF NOT EXISTS public.user_biometrics (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    heart_rate TEXT DEFAULT '72',
    blood_pressure TEXT DEFAULT '120/80',
    glucose TEXT DEFAULT '95',
    oxygen TEXT DEFAULT '98',
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.users(id) NOT NULL,
    doctor_id UUID REFERENCES public.users(id) NOT NULL,
    medication TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- FAMILY MEMBERS
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    avatar_url TEXT,
    health_score INTEGER DEFAULT 88,
    active_meds INTEGER DEFAULT 0,
    blood_group TEXT,
    last_checkup TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REFILL REQUESTS
CREATE TABLE IF NOT EXISTS public.refill_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    priority TEXT CHECK (priority IN ('normal', 'urgent', 'life-critical')) DEFAULT 'normal',
    status TEXT CHECK (status IN ('pending', 'approved', 'declined', 'dispatched')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. SECURITY (RLS)
-- ==========================================

DO $$
BEGIN
    -- Enable RLS on all tables
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_biometrics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.refill_requests ENABLE ROW LEVEL SECURITY;

    -- Drop legacy policies
    DROP POLICY IF EXISTS "Users access own family members" ON public.family_members;
    DROP POLICY IF EXISTS "Users view own profile" ON public.users;
    DROP POLICY IF EXISTS "Message access" ON public.messages;
    -- ... and so on

    -- Create Clean Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users access own profile') THEN
        CREATE POLICY "Users access own profile" ON public.users FOR ALL USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users access own appointments') THEN
        CREATE POLICY "Users access own appointments" ON public.appointments FOR ALL USING (auth.uid() = patient_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users access own family members') THEN
        CREATE POLICY "Users access own family members" ON public.family_members FOR ALL USING (auth.uid() = user_id);
    END IF;

END $$;

-- ==========================================
-- 4. AUTH TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
