import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Local-only mode active.");
}

export const supabase = createClient(
  supabaseUrl || 'https://ktzrsqcmonleyddrqdkz.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0enJzcWNtb25sZXlkZHJxZGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjQ3NzEsImV4cCI6MjA5MzU0MDc3MX0.O_-iFNtj0q7Lcf_NPj5LWT59FAY4tsrvK9zlTpXEsV4'
);

// Real-time synchronization helper
export const subscribeToChannel = (channelName: string, table: string, callback: (payload: any) => void) => {
  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      callback
    )
    .subscribe();
};
