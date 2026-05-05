import { supabase, subscribeToChannel } from '../lib/supabase';
import { 
  setPractitioners, 
  setAppointments, 
  addMessage,
  addNotification 
} from '../store/healthSlice';
import { AppDispatch } from '../store';
import { toast } from 'sonner';

/**
 * MediFlow Real-Time Data Synchronization Engine
 * Handles bi-directional sync between Supabase and Redux store
 */
export const initializeRealTimeSync = (dispatch: AppDispatch, userId: string, role: string) => {
  if (!userId) return;

  const isDoctor = role === 'doctor';

  // 1. Fetch & Sync Practitioners
  const syncPractitioners = async () => {
    const { data, error } = await supabase.from('practitioners').select('*');
    if (!error && data) {
      dispatch(setPractitioners(data));
    }
  };

  // 2. Fetch & Sync Appointments
  const syncAppointments = async () => {
    try {
      const query = supabase.from('appointments').select('*');
      if (isDoctor) {
        query.eq('doctor_id', userId);
      } else {
        query.eq('patient_id', userId);
      }
      
      const { data, error } = await query
        .order('appointment_date', { ascending: true });
      
      if (!error && data) {
        dispatch(setAppointments(data));
      }
    } catch (err) {
      console.error("Sync Appointments Error:", err);
    }
  };

  // 3. Fetch & Sync Notifications
  const syncNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (!error && data) {
      // Assuming you have a setNotifications action, if not we'll use addNotification logic
      data.forEach(n => dispatch(addNotification(n)));
    }
  };

  // 4. Set up Real-time Listeners
  const msgChannel = subscribeToChannel('messages-channel', 'messages', (payload) => {
    if (payload.new && payload.new.receiver_id === userId) {
      dispatch(addMessage({
        id: payload.new.id,
        text: payload.new.content,
        sender: payload.new.sender_id === userId ? (isDoctor ? 'doctor' : 'patient') : (isDoctor ? 'patient' : 'doctor'),
        timestamp: payload.new.created_at
      }));
      
      if (payload.new.sender_id !== userId) {
        const title = isDoctor ? 'New Patient Inquiry' : 'New Clinical Message';
        toast.info(title, {
          description: payload.new.content.substring(0, 50) + (payload.new.content.length > 50 ? '...' : '')
        });
      }
    }
  });

  const aptChannel = subscribeToChannel('appointments-channel', 'appointments', (payload) => {
    const isTarget = isDoctor ? payload.new?.doctor_id === userId : payload.new?.patient_id === userId;
    
    if (payload.new && isTarget) {
      syncAppointments(); 
      
      if (payload.eventType === 'UPDATE' && payload.new.status === 'accepted' && !isDoctor) {
        toast.success(`Sequential slot confirmed by your practitioner.`);
      }
      if (payload.eventType === 'INSERT' && isDoctor) {
        toast.success(`New patient slotted in the clinical queue.`);
      }
    }
  });

  const notifChannel = subscribeToChannel('notif-channel', 'notifications', (payload) => {
    if (payload.new && payload.new.user_id === userId) {
      dispatch(addNotification(payload.new));
      if (payload.eventType === 'INSERT') {
        toast(payload.new.title, { description: payload.new.message });
      }
    }
  });

  // Initial fetch
  syncPractitioners();
  syncAppointments();
  syncNotifications();

  return () => {
    supabase.removeChannel(msgChannel);
    supabase.removeChannel(aptChannel);
    supabase.removeChannel(notifChannel);
  };
};

export const dbService = {
  async bookAppointment(appointment: any) {
    const { error } = await supabase.from('appointments').insert([appointment]);
    if (error) throw error;
  },

  async sendMessage(msg: { sender_id: string; receiver_id: string; content: string }) {
    const { error } = await supabase.from('messages').insert([msg]);
    if (error) throw error;
  },

  async updateBiometrics(userId: string, data: any) {
    const { error } = await supabase
      .from('user_biometrics')
      .upsert({ user_id: userId, ...data });
    if (error) throw error;
  }
};
