import { supabase, subscribeToChannel } from '../lib/supabase';
import { 
  setPractitioners, 
  setAppointments, 
  setMessages,
  addMessage,
  setNotifications,
  addNotification,
  setPrescriptions,
  setAdherenceLogs,
  addAdherenceLog,
  updateBiometrics,
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  setDiagnostics,
  addDiagnostic
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
      dispatch(setNotifications(data.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type as any,
        timestamp: n.timestamp,
        read: n.read
      }))));
    }
  };

  // 4. Fetch & Sync Prescriptions
  const syncPrescriptions = async () => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq(isDoctor ? 'doctor_id' : 'patient_id', userId);
    
    if (!error && data) {
      dispatch(setPrescriptions(data.map(p => ({
        id: p.id,
        medication: p.medication,
        dosage: p.dosage,
        frequency: p.frequency,
        doctor_id: p.doctor_id,
        patient_id: p.patient_id,
        status: (p.status || 'Active') as any,
        adherence_rate: p.adherence_rate || 100,
        last_dose_taken: p.last_dose_taken,
        created_at: p.created_at
      }))));
    }
  };

  // 8. Fetch & Sync Adherence Logs
  const syncAdherence = async () => {
    const { data, error } = await supabase
      .from('medication_adherence')
      .select('*')
      .eq('patient_id', userId)
      .order('taken_at', { ascending: false });
    
    if (!error && data) {
      dispatch(setAdherenceLogs(data));
    }
  };

  // 5. Fetch & Sync Biometrics
  const syncBiometrics = async () => {
    const { data, error } = await supabase
      .from('user_biometrics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!error && data) {
      dispatch(updateBiometrics({
        heartRate: data.heart_rate ? [{ time: 'Recent', value: parseInt(data.heart_rate) || 72 }] : [],
        bloodPressure: data.blood_pressure,
        bloodSugar: data.glucose,
        oxygen: data.oxygen,
        lastUpdated: data.last_updated
      }));
    }
  };

  // 6. Fetch & Sync Diagnostics
  const syncDiagnostics = async () => {
    const { data, error } = await supabase
      .from('diagnostics')
      .select('*')
      .eq(isDoctor ? 'doctor_id' : 'patient_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      dispatch(setDiagnostics(data));
    }
  };

  // 7. Fetch & Sync Tasks
  const syncTasks = async () => {
    const { data, error } = await supabase
      .from('clinical_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      dispatch(setTasks(data.map(t => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        priority: t.priority as any,
        category: t.category,
        dueDate: t.due_date
      }))));
    }
  };

  // 7. Set up Real-time Listeners
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

  const taskChannel = subscribeToChannel('tasks-channel', 'clinical_tasks', (payload) => {
    if (payload.new && payload.new.user_id === userId) {
      if (payload.eventType === 'INSERT') {
        dispatch(addTask({
          id: payload.new.id,
          text: payload.new.text,
          completed: payload.new.completed,
          priority: payload.new.priority,
          category: payload.new.category,
          dueDate: payload.new.due_date
        }));
      } else if (payload.eventType === 'UPDATE') {
        dispatch(updateTask({
          id: payload.new.id,
          text: payload.new.text,
          completed: payload.new.completed,
          priority: payload.new.priority,
          category: payload.new.category,
          dueDate: payload.new.due_date
        }));
      } else if (payload.eventType === 'DELETE') {
        dispatch(deleteTask(payload.old.id));
      }
    }
  });

  const biometricChannel = subscribeToChannel('biometrics-channel', 'user_biometrics', (payload) => {
    if (payload.new && payload.new.user_id === userId) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      dispatch(updateBiometrics({
        heartRate: payload.new.heart_rate ? [{ time: timeStr, value: parseInt(payload.new.heart_rate) || 72 }] : [],
        bloodPressure: payload.new.blood_pressure,
        bloodSugar: payload.new.glucose,
        oxygen: payload.new.oxygen,
        lastUpdated: payload.new.last_updated
      }));
    }
  });

  const prescriptionChannel = subscribeToChannel('prescriptions-channel', 'prescriptions', (payload) => {
    const isTarget = isDoctor ? payload.new?.doctor_id === userId : payload.new?.patient_id === userId;
    if (payload.new && isTarget) {
      syncPrescriptions();
      if (payload.eventType === 'INSERT' && !isDoctor) {
        toast.info("New Prescription Added", {
          description: `Your practitioner has added ${payload.new.medication} to your regimen.`
        });
      }
    }
  });

  const diagnosticChannel = subscribeToChannel('diagnostics-channel', 'diagnostics', (payload) => {
    const isTarget = isDoctor ? payload.new?.doctor_id === userId : payload.new?.patient_id === userId;
    if (payload.new && isTarget) {
      if (payload.eventType === 'INSERT') {
        dispatch(addDiagnostic(payload.new));
        if (!isDoctor) {
          toast.success("New Diagnostic Entry", {
            description: `A new ${payload.new.type} record is ready for review.`
          });
        }
      } else {
        syncDiagnostics();
      }
    }
  });

  const adherenceChannel = subscribeToChannel('adherence-channel', 'medication_adherence', (payload: any) => {
    if (payload.new && (payload.new.patient_id === userId || isDoctor)) {
      syncAdherence();
      syncPrescriptions();
      
      if (payload.eventType === 'INSERT' && isDoctor) {
        toast.info("Patient Adherence Update", {
          description: "A patient has logged their medication dose."
        });
      }
    }
  });

  // Initial fetch
  syncPractitioners();
  syncAppointments();
  syncNotifications();
  syncPrescriptions();
  syncBiometrics();
  syncTasks();
  syncDiagnostics();
  syncAdherence();

  return () => {
    supabase.removeChannel(msgChannel);
    supabase.removeChannel(aptChannel);
    supabase.removeChannel(notifChannel);
    supabase.removeChannel(taskChannel);
    supabase.removeChannel(biometricChannel);
    supabase.removeChannel(prescriptionChannel);
    supabase.removeChannel(diagnosticChannel);
    supabase.removeChannel(adherenceChannel);
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
