import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User, ArrowRight, Loader2, Stethoscope } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { setCredentials } from '../store/authSlice';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [authStep, setAuthStep] = useState<'input' | 'biometric' | 'verifying'>('input');
  const [scanProgress, setScanProgress] = useState(0);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'doctor' && authStep === 'input') {
      setAuthStep('biometric');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
            identity_role: role // Extra flag for trigger reliability
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      if (authError) throw authError;

      // If email confirmation is required, session will be null
      if (authData.user && !authData.session) {
        toast.success('Registration Initiated', {
          description: 'A verification link has been sent to your terminal. Please confirm your email to activate your neural identity.',
          duration: 10000,
        });
        navigate('/login');
        return;
      }

      // If auto-logged in (email verification disabled in Supabase), we sync locally
      if (authData.user && authData.session) {
        // Wait a small moment for the trigger to fire, or fallback to metadata
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        const finalRole = profile?.role || role;
        const finalName = profile?.name || name;

        dispatch(setCredentials({
          user: {
            id: authData.user.id,
            name: finalName,
            email: authData.user.email || email,
            role: finalRole as any
          },
          token: authData.session.access_token
        }));
        
        toast.success('Neural Link Established', {
          description: `Welcome back, ${finalName}. Your clinical terminal is online.`
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
      setAuthStep('input');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStep === 'biometric') {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setAuthStep('verifying');
            setTimeout(() => {
              handleRegister({ preventDefault: () => {} } as any);
            }, 1500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [authStep]);

  if (role === 'doctor' && authStep !== 'input') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
        {/* Advanced Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center space-y-10 backdrop-blur-2xl relative z-10 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {authStep === 'biometric' ? (
              <motion.div 
                key="biometric"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-white/5"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * scanProgress) / 100}
                      className="text-blue-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/40 to-transparent animate-scan"></div>
                      <Stethoscope className="w-12 h-12 text-blue-400 relative z-10" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Identity Verification</h2>
                  <p className="text-slate-400 font-medium tracking-wide">Initializing Neural Biometric Scan...</p>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  <span>Scanning...</span>
                  <span>{scanProgress}%</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10 py-10"
              >
                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Loader2 className="w-12 h-12 animate-spin" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Finalizing Credentials</h2>
                  <p className="text-slate-400 font-medium tracking-wide">Establishing Secure Clinical Access...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthLayout 
      title={role === 'doctor' ? "Doctor Registration" : "Patient Registration"} 
      subtitle={role === 'doctor' ? "Join our network of elite medical professionals." : "Start your journey towards better health management."}
    >
      <div className={`flex p-1 rounded-2xl mb-8 transition-colors ${role === 'doctor' ? 'bg-slate-900' : 'bg-slate-100'}`}>
        <button
          type="button"
          onClick={() => setRole('patient')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <User className="w-4 h-4" />
          Patient
        </button>
        <button
          type="button"
          onClick={() => setRole('doctor')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            role === 'doctor' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Doctor
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest border border-red-100 rounded-xl"
          >
            Error: {error}
          </motion.div>
        )}
        
        <div className="space-y-2">
          <label className={`text-xs font-black uppercase tracking-widest ml-1 ${role === 'doctor' ? 'text-slate-500' : 'text-slate-400'}`}>Full Name</label>
          <div className="relative group">
            <User className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${role === 'doctor' ? 'text-slate-600 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
            <input 
              type="text" 
              required
              className={`input-field pl-14 ${role === 'doctor' ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-700' : ''}`} 
              placeholder={role === 'doctor' ? "Dr. John Doe" : "John Doe"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`text-xs font-black uppercase tracking-widest ml-1 ${role === 'doctor' ? 'text-slate-500' : 'text-slate-400'}`}>Email Address</label>
          <div className="relative group">
            <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${role === 'doctor' ? 'text-slate-600 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
            <input 
              type="email" 
              required
              className={`input-field pl-14 ${role === 'doctor' ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-700' : ''}`} 
              placeholder={role === 'doctor' ? "doctor@mediflow.com" : "patient@mediflow.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`text-xs font-black uppercase tracking-widest ml-1 ${role === 'doctor' ? 'text-slate-500' : 'text-slate-400'}`}>Password</label>
          <div className="relative group">
            <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${role === 'doctor' ? 'text-slate-600 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
            <input 
              type="password" 
              required
              className={`input-field pl-14 ${role === 'doctor' ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-700' : ''}`} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`btn-primary w-full flex items-center justify-center gap-3 py-5 text-lg group mt-4 ${
            role === 'doctor' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : ''
          }`}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              {role === 'doctor' ? 'Initialize Registration' : 'Register as Patient'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-500 font-medium">
            Already have an account? <Link to="/login" className="text-blue-600 font-black hover:text-blue-700 transition-colors">Sign In</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
