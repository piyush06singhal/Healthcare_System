import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  User, 
  Stethoscope, 
  Fingerprint, 
  Shield, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { setCredentials } from '../store/authSlice';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Authentication failed.');

      // 1.5 CHECK EMAIL CONFIRMATION
      if (authData.user.identities && authData.user.identities.length > 0 && !authData.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('Email not verified. Please check your inbox for the activation link.');
      }

      // 2. Fetch profile from our public users table
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      // Reliable Role Detection: Check profile table, then Auth metadata
      const userRole = profile?.role || (authData.user.user_metadata?.role as any) || (authData.user.user_metadata?.identity_role as any) || 'patient';
      const userName = profile?.name || authData.user.user_metadata?.full_name || email.split('@')[0];

      dispatch(setCredentials({
        user: {
          id: authData.user.id,
          name: userName,
          email: email,
          role: userRole
        },
        token: authData.session?.access_token || 'active-session'
      }));

      toast.success(`Welcome back, ${userName}`, {
        description: `Logged in as ${userRole.toUpperCase()}.`
      });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={role === 'doctor' ? "Doctor Portal" : "Patient Portal"} 
      subtitle={role === 'doctor' ? "Access your clinical dashboard and patient records." : "Manage your health records and appointments."}
    >
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 relative z-10">
        <button
          onClick={() => setRole('patient')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          Patient
        </button>
        <button
          onClick={() => setRole('doctor')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            role === 'doctor' ? 'bg-slate-900 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Doctor
        </button>
      </div>

      <form 
        onSubmit={handleLogin} 
        className="space-y-6"
      >
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${role === 'doctor' ? 'text-slate-400 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
            <input 
              type="email" 
              required
              className={`input-field pl-14 ${role === 'doctor' ? 'focus:border-slate-900' : ''}`} 
              placeholder={role === 'doctor' ? "doctor@mediflow.ai" : "patient@mediflow.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
            <Link to="/forgot-password" title="Forgot password?" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot Password?</Link>
          </div>
          <div className="relative group">
            <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${role === 'doctor' ? 'text-slate-400 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
            <input 
              type="password" 
              required
              className={`input-field pl-14 ${role === 'doctor' ? 'focus:border-slate-900' : ''}`} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`btn-primary w-full flex items-center justify-center gap-3 py-5 text-lg group shadow-xl active:scale-[0.98] transition-all ${
            role === 'doctor' ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 text-blue-400' : ''
          }`}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              {role === 'doctor' ? 'Doctor Login' : 'Secure Sign In'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="pt-8 border-t border-slate-100 italic">
          <p className="text-slate-500 font-medium text-center">
            Don't have an account? <Link to="/register" className="text-blue-600 font-black hover:text-blue-700 transition-colors">Create account</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
