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

interface HealthState {
  biometrics: BiometricData;
  practitioners: Practitioner[];
  treatments: Treatment[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  messages: Message[];
  notifications: Notification[];
  aiSummary: string;
  diagnostics: any[];
}

const initialState: HealthState = {
  biometrics: {
    heartRate: [
      { time: '08:00', value: 72 },
      { time: '10:00', value: 75 },
      { time: '12:00', value: 82 },
      { time: '14:00', value: 78 },
      { time: '16:00', value: 74 },
      { time: '18:00', value: 70 },
      { time: '20:00', value: 68 },
    ],
    bloodPressure: '118/76',
    bloodSugar: '98',
    oxygen: '99',
    lastUpdated: new Date().toISOString(),
  },
  practitioners: [
    { id: 'd1', name: 'Dr. Sarah Mitchell', specialty: 'Cardiologist', status: 'Active', email: 's.mitchell@mediflow.ai' },
    { id: 'd2', name: 'Dr. James Wilson', specialty: 'General Physician', status: 'Active', email: 'j.wilson@mediflow.ai' },
    { id: 'd3', name: 'Dr. Elena Rossi', specialty: 'Neurologist', status: 'On Leave', email: 'e.rossi@mediflow.ai' },
  ],
  prescriptions: [
    { id: 'RX-771', name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', remaining: 4, total: 10, doctor: 'Dr. Sarah Mitchell', status: 'Active', category: 'Antibiotic' },
    { id: 'RX-102', name: 'Vitamin D3', dosage: '5000 IU', frequency: 'Once daily', remaining: 22, total: 30, doctor: 'Dr. James Wilson', status: 'Active', category: 'Supplement' },
  ],
  treatments: [
    { id: 'T1', condition: 'Laryngitis (Recovered)', date: '2026-03-12', doctor: 'Dr. Sarah Mitchell', status: 'Completed', notes: 'Full recovery achieved after 5-day antibiotic course.' },
    { id: 'T2', condition: 'Vitamin D Protocol', date: '2026-04-15', doctor: 'Dr. James Wilson', status: 'Ongoing', notes: 'Supplementing 5000 IU daily. Stability monitoring in progress.' },
  ],
  appointments: [
    { id: 'apt1', doctor: { id: 'd1', name: 'Dr. Sarah Mitchell', specialty: 'Cardiologist' }, appointment_date: new Date(Date.now() + 86400000).toISOString(), status: 'accepted', reason: 'Post-recovery checkup' }
  ],
  messages: [
    { id: 'm1', sender: 'doctor', text: 'How are you feeling after the new medication?', timestamp: '2026-05-04T09:00:00Z' },
    { id: 'm2', sender: 'patient', text: 'Much better, the congestion is almost gone.', timestamp: '2026-05-04T10:30:00Z' },
  ],
  notifications: [
    { id: 'n1', title: 'Biometric Alert', message: 'Heart rate slightly elevated during morning session.', type: 'alert', timestamp: new Date().toISOString(), read: false },
    { id: 'n2', title: 'System Synced', message: 'Clinical data successfully transmitted to Dr. Mitchell.', type: 'success', timestamp: new Date().toISOString(), read: true },
  ],
  aiSummary: 'Neural analysis of your recent biometrics indicates a 15% improvement in heart rate variability. Your lipid profiles are stabilizing, and consistent hydration is contributing to a high metabolic efficiency score of 88/100.',
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
      state.messages.push(action.payload);
    },
    addTreatment: (state, action: PayloadAction<Treatment>) => {
      state.treatments.unshift(action.payload);
    },
    setAiSummary: (state, action: PayloadAction<string>) => {
      state.aiSummary = action.payload;
    },
    addPrescription: (state, action: PayloadAction<Prescription>) => {
      state.prescriptions.unshift(action.payload);
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
      state.appointments.unshift(action.payload);
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const n = state.notifications.find(notif => notif.id === action.payload);
      if (n) n.read = true;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    addPractitioner: (state, action: PayloadAction<Practitioner>) => {
      state.practitioners.push(action.payload);
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
  addDiagnostic,
  addAppointment,
  markNotificationRead,
  addNotification,
  addPractitioner,
  updatePractitioner,
  deletePractitioner,
  setPractitioners,
  setAppointments
} = healthSlice.actions;
export default healthSlice.reducer;
