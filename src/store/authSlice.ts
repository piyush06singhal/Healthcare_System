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
}

interface AuthState {
  user: User | null;
  activeProfile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
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
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, switchProfile } = authSlice.actions;
export default authSlice.reducer;
