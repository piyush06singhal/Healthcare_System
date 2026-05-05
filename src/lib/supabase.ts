import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Local-only mode active.");
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
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
