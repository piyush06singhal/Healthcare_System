-- MEDIFLOW AI: DOCTOR PORTAL ENHANCEMENTS v1.1
-- Robust version to handle existing publication members

-- 1. CLINICAL TASKS TABLE
CREATE TABLE IF NOT EXISTS public.clinical_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    text TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    priority TEXT CHECK (priority IN ('low', 'medium', 'urgent', 'critical')) DEFAULT 'medium',
    due_date TEXT DEFAULT 'Today',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clinical_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own tasks" ON public.clinical_tasks;
CREATE POLICY "Users manage own tasks" ON public.clinical_tasks 
FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 2. PERMISSION HARDENING
DROP POLICY IF EXISTS "Enable manage for authenticated users" ON public.practitioners;
CREATE POLICY "Enable manage for authenticated users" ON public.practitioners 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Doctors can update appointments" ON public.appointments;
CREATE POLICY "Doctors can update appointments" ON public.appointments 
FOR UPDATE TO authenticated USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

DROP POLICY IF EXISTS "Messages insert for authenticated" ON public.messages;
CREATE POLICY "Messages insert for authenticated" ON public.messages 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Prescriptions management for doctors" ON public.prescriptions;
CREATE POLICY "Prescriptions management for doctors" ON public.prescriptions 
FOR ALL TO authenticated USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

-- 3. SAFE REAL-TIME ENABLEMENT
DO $$
DECLARE
    t text;
    tables_to_add text[] := ARRAY['practitioners', 'appointments', 'messages', 'user_biometrics', 'notifications', 'prescriptions', 'clinical_tasks'];
BEGIN
    FOREACH t IN ARRAY tables_to_add
    LOOP
        -- Check if table exists first
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            -- Check if already in publication
            IF NOT EXISTS (
                SELECT 1 
                FROM pg_publication_tables 
                WHERE pubname = 'supabase_realtime' 
                AND schemaname = 'public' 
                AND tablename = t
            ) THEN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
            END IF;
        END IF;
    END LOOP;
END $$;
