-- MEDIFLOW AI: MASTER CLINICAL SCHEMA v2.0
-- Implementation: Full-Stack Real-Time Healthcare Synchronization
-- This contains ALL tables for Patient Portal, Doctor Portal, and System Auth.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. MASTER USERS (Synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('patient', 'doctor', 'admin')) DEFAULT 'patient',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLINICAL STAFF (PRACTITIONERS)
CREATE TABLE IF NOT EXISTS public.practitioners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('Active', 'On Leave', 'Emergency Only')) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APPOINTMENTS (REAL-TIME QUEUE)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.users(id) NOT NULL,
    doctor_id UUID REFERENCES auth.users(id), -- Specific staff user
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'cancelled', 'completed')) DEFAULT 'pending',
    reason TEXT,
    priority TEXT CHECK (priority IN ('normal', 'urgent', 'critical')) DEFAULT 'normal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SECURE MESSAGING (CHAT)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BIOMETRIC TELEMETRY
CREATE TABLE IF NOT EXISTS public.user_biometrics (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    heart_rate TEXT DEFAULT '72',
    blood_pressure TEXT DEFAULT '120/80',
    glucose TEXT DEFAULT '95',
    oxygen TEXT DEFAULT '98',
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.users(id) NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) NOT NULL,
    medication TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies (Defensive: Drop then Create)
DROP POLICY IF EXISTS "Users view own profile" ON public.users;
CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public staff directory" ON public.practitioners;
CREATE POLICY "Public staff directory" ON public.practitioners FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Appointment access" ON public.appointments;
CREATE POLICY "Appointment access" ON public.appointments FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Booking access" ON public.appointments;
CREATE POLICY "Booking access" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Message access" ON public.messages;
CREATE POLICY "Message access" ON public.messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Biometric access" ON public.user_biometrics;
CREATE POLICY "Biometric access" ON public.user_biometrics FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Prescription access" ON public.prescriptions;
CREATE POLICY "Prescription access" ON public.prescriptions FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Notification access" ON public.notifications;
CREATE POLICY "Notification access" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- 10. REAL-TIME REPLICATION
-- NOTE: If these error because the table is already a member, run them individually
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.user_biometrics;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;

-- 11. AUTH SYNC TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
    new.email, 
    COALESCE(
      new.raw_user_meta_data->>'role', 
      new.raw_user_meta_data->>'identity_role',
      new.raw_user_meta_data->>'display_role',
      'patient'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent "already exists" error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
