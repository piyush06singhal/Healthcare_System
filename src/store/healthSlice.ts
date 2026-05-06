import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HeartRate {
  time: string;
  value: number;
}

interface BiometricData {
  heartRate: HeartRate[];
  bloodPressure: string;
  bloodSugar: string;
  oxygen: string;
  lastUpdated: string;
}

interface Treatment {
  id: string;
  condition: string;
  date: string;
  doctor: string;
  status: 'Completed' | 'Ongoing' | 'Scheduled';
  notes: string;
}

interface Message {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
}

interface Appointment {
  id: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
  patient?: {
    id: string;
    name: string;
  };
  patient_id?: string;
  doctor_id?: string;
  appointment_date: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  reason: string;
  priority?: 'low' | 'medium' | 'urgent' | 'critical';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  timestamp: string;
  read: boolean;
}

interface Prescription {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  remaining: number;
  total: number;
  doctor: string;
  status: 'Active' | 'Paused' | 'Completed';
  category: string;
}

interface Practitioner {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  status: 'Active' | 'On Leave' | 'Emergency Only';
  email: string;
}

export interface ClinicalTask {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'urgent' | 'critical';
  category: string;
  dueDate: string;
}

interface HealthState {
  biometrics: BiometricData;
  practitioners: Practitioner[];
  treatments: Treatment[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  messages: Message[];
  notifications: Notification[];
  tasks: ClinicalTask[];
  aiSummary: string;
  diagnostics: any[];
}

const initialState: HealthState = {
  biometrics: {
    heartRate: [],
    bloodPressure: '--/--',
    bloodSugar: '--',
    oxygen: '--',
    lastUpdated: new Date().toISOString(),
  },
  practitioners: [],
  prescriptions: [],
  treatments: [],
  appointments: [],
  messages: [],
  notifications: [],
  tasks: [],
  aiSummary: 'MediFlow AI is initializing...',
  diagnostics: [],
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    updateBiometrics: (state, action: PayloadAction<Partial<BiometricData>>) => {
      state.biometrics = { ...state.biometrics, ...action.payload, lastUpdated: new Date().toISOString() };
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Prevent duplicates
      if (!state.messages.find(m => m.id === action.payload.id)) {
        state.messages.push(action.payload);
      }
    },
    addTreatment: (state, action: PayloadAction<Treatment>) => {
      state.treatments.unshift(action.payload);
    },
    setAiSummary: (state, action: PayloadAction<string>) => {
      state.aiSummary = action.payload;
    },
    addPrescription: (state, action: PayloadAction<Prescription>) => {
      if (!state.prescriptions.find(p => p.id === action.payload.id)) {
        state.prescriptions.unshift(action.payload);
      }
    },
    setPrescriptions: (state, action: PayloadAction<Prescription[]>) => {
      state.prescriptions = action.payload;
    },
    takeDose: (state, action: PayloadAction<string>) => {
      const rx = state.prescriptions.find(p => p.id === action.payload);
      if (rx && rx.remaining > 0) {
        rx.remaining -= 1;
      }
    },
    addDiagnostic: (state, action: PayloadAction<any>) => {
      state.diagnostics.unshift(action.payload);
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      if (!state.appointments.find(a => a.id === action.payload.id)) {
        state.appointments.unshift(action.payload);
      }
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const n = state.notifications.find(notif => notif.id === action.payload);
      if (n) n.read = true;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      if (!state.notifications.find(n => n.id === action.payload.id)) {
        state.notifications.unshift(action.payload);
      }
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },
    addPractitioner: (state, action: PayloadAction<Practitioner>) => {
      if (!state.practitioners.find(p => p.id === action.payload.id)) {
        state.practitioners.push(action.payload);
      }
    },
    updatePractitioner: (state, action: PayloadAction<Practitioner>) => {
      const index = state.practitioners.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.practitioners[index] = action.payload;
      }
    },
    deletePractitioner: (state, action: PayloadAction<string>) => {
      state.practitioners = state.practitioners.filter(p => p.id !== action.payload);
    },
    setPractitioners: (state, action: PayloadAction<Practitioner[]>) => {
      state.practitioners = action.payload;
    },
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    setTasks: (state, action: PayloadAction<ClinicalTask[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<ClinicalTask>) => {
      if (!state.tasks.find(t => t.id === action.payload.id)) {
        state.tasks.unshift(action.payload);
      }
    },
    updateTask: (state, action: PayloadAction<ClinicalTask>) => {
      const idx = state.tasks.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.tasks[idx] = action.payload;
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    }
  },
});

export const { 
  updateBiometrics, 
  addMessage, 
  addTreatment, 
  setAiSummary, 
  takeDose, 
  addPrescription, 
  setPrescriptions,
  addDiagnostic,
  addAppointment,
  markNotificationRead,
  addNotification,
  setNotifications,
  addPractitioner,
  updatePractitioner,
  deletePractitioner,
  setPractitioners,
  setAppointments,
  setMessages,
  setTasks,
  addTask,
  updateTask,
  deleteTask
} = healthSlice.actions;
export default healthSlice.reducer;
