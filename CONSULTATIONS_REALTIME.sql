
-- CONSULTATIONS TABLE (EHR VAULT)
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id),
    doctor_id UUID REFERENCES public.users(id) NOT NULL,
    patient_id UUID REFERENCES public.users(id) NOT NULL,
    notes TEXT NOT NULL,
    transcription TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own consultations" ON public.consultations;
CREATE POLICY "Users can view their own consultations" ON public.consultations 
FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

DROP POLICY IF EXISTS "Doctors can create consultations" ON public.consultations;
CREATE POLICY "Doctors can create consultations" ON public.consultations 
FOR INSERT WITH CHECK (auth.uid() = doctor_id);

-- Enable Real-time
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'consultations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
    END IF;
END $$;
