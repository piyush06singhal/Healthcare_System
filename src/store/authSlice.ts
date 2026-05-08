import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  name: string;
  role: 'patient' | 'doctor';
  avatar?: string;
  relation?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  profiles?: UserProfile[];
  phone?: string;
  address?: string;
  bio?: string;
  gender?: string;
  blood_group?: string;
  dob?: string;
  specialty?: string;
  education?: string;
  experience?: string;
  certifications?: string;
}

interface AuthState {
  user: User | null;
  activeProfile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  activeProfile: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.activeProfile = {
        id: action.payload.user.id,
        name: action.payload.user.name,
        role: action.payload.user.role as 'patient' | 'doctor',
      };
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    setUser: (state, action: PayloadAction<User>) => {
      // Ensure we merge and keep strings consistent
      const mergedUser = { ...state.user, ...action.payload };
      state.user = mergedUser;
      localStorage.setItem('user', JSON.stringify(mergedUser));
    },
    switchProfile: (state, action: PayloadAction<UserProfile>) => {
      state.activeProfile = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.activeProfile = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, switchProfile, setUser } = authSlice.actions;
export default authSlice.reducer;
