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
  const [authStep, setAuthStep] = useState<'input' | 'clinical-id' | 'biometric' | 'verifying'>('input');
  const [clinicalId, setClinicalId] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (authStep === 'biometric') {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setAuthStep('verifying'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [authStep]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'doctor') {
      setAuthStep('clinical-id');
      return;
    }

    executeLogin();
  };

  const handleClinicalIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalId.trim()) {
      toast.error('Please enter your Clinical ID');
      return;
    }
    setAuthStep('biometric');
  };

  const executeLogin = async () => {
    setLoading(true);
    try {
      // Mock credentials for testing
      if (
        (email === 'doctor@mediflow.ai' || email === 'doctor@mediflow.com' || email === 'doctor@example.com') && 
        password === 'password123' && 
        role === 'doctor'
      ) {
        dispatch(setCredentials({
          user: {
            id: 'f6f6f6f6-f6f6-4f6f-bf6f-f6f6f6f6f6f6',
            name: 'Dr. Piyush Singhal',
            email: email,
            role: 'doctor'
          },
          token: 'mock-jwt-token'
        }));
        toast.success(`Neural Link Established. Welcome, Dr. Singhal`, {
          description: 'Systems synchronized. Accessing Clinical Portal...',
          duration: 3000,
        });
        navigate('/dashboard');
        return;
      }

      if (
        (email === 'patient@mediflow.com' || email === 'patient@example.com') && 
        password === 'password123' && 
        role === 'patient'
      ) {
        dispatch(setCredentials({
          user: {
            id: 'mock-patient-id',
            name: 'John Doe',
            email: email,
            role: 'patient'
          },
          token: 'mock-jwt-token'
        }));
        toast.success(`Welcome back, John`, {
          description: 'Accessing your personal health portal...',
          duration: 3000,
        });
        navigate('/dashboard');
        return;
      }

      const { data, error: authError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', role)
        .single();

      if (authError || !data) {
        throw new Error(`Invalid ${role} credentials`);
      }

      dispatch(setCredentials({
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role
        },
        token: 'mock-jwt-token'
      }));

      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to login. Please check your credentials.');
      setAuthStep('input');
      setScanProgress(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStep === 'verifying') {
      executeLogin();
    }
  }, [authStep]);

  return (
    <AuthLayout 
      title={role === 'doctor' ? "Clinical Portal Access" : "Patient Portal"} 
      subtitle={role === 'doctor' ? "Secure neural-link authentication for medical professionals." : "Manage your health and connect with specialists."}
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

      <AnimatePresence mode="wait">
        {authStep === 'input' ? (
          <motion.form 
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
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
                <Link to="/forgot-password" title="Forgot password?" className="text-xs font-bold text-blue-600 hover:text-blue-700">Recovery</Link>
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
                  {role === 'doctor' ? 'Initiate Neural Link' : 'Secure Sign In'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium">
                Don't have an account? <Link to="/register" className="text-blue-600 font-black hover:text-blue-700 transition-colors">Create account</Link>
              </p>
            </div>
          </motion.form>
        ) : authStep === 'clinical-id' ? (
          <motion.form
            key="clinical-id"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleClinicalIdSubmit}
            className="space-y-6"
          >
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Shield className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Identity Verification</span>
              </div>
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Please enter your unique Clinical Practitioner ID to proceed with biometric sync.
              </p>
            </div>

            <div className="relative group">
              <Cpu className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Clinical ID (e.g. MD-9921)"
                value={clinicalId}
                onChange={(e) => setClinicalId(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-mono text-sm uppercase"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-slate-900 text-blue-400 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all"
            >
              Verify Identity
            </button>
          </motion.form>
        ) : authStep === 'biometric' ? (
          <motion.div 
            key="biometric"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center py-12 space-y-8"
          >
            <div className="relative">
              <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden shadow-2xl shadow-blue-500/20">
                <Fingerprint className="w-16 h-16 text-blue-400 relative z-10" />
                <motion.div 
                  className="absolute inset-x-0 h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] z-20"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 bg-blue-400/5" />
              </div>
              <motion.div 
                className="absolute -inset-4 border-2 border-blue-400/20 rounded-[3rem]"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Biometric Scan</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Identity Signature...</p>
            </div>

            <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
              />
            </div>

            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3" />
                Encrypted
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Secure
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-6"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Access Granted</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Clinical Environment...</p>
            </div>
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
