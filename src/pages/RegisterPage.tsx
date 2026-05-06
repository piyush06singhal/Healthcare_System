import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User, ArrowRight, Loader2, Stethoscope, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { setCredentials } from '../store/authSlice';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) throw authError;

      // If email confirmation is required, session will be null
      if (authData.user && !authData.session) {
        toast.success('Registration Successful', {
          description: 'A verification link has been sent to your email. Please confirm your email to activate your account.',
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
        
        toast.success('Welcome to MediFlow', {
          description: `Account created successfully. Welcome, ${finalName}.`
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={role === 'doctor' ? "Doctor Registration" : "Patient Registration"} 
      subtitle={role === 'doctor' ? "Join our network of healthcare professionals." : "Access personalized healthcare services and insights."}
    >
      <div className="flex p-1 rounded-2xl mb-8 transition-colors bg-slate-100">
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
            role === 'doctor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-400'
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
          <label className="text-xs font-black uppercase tracking-widest ml-1 text-slate-400">Full Name</label>
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-slate-400 group-focus-within:text-blue-600" />
            <input 
              type="text" 
              required
              className="input-field pl-14" 
              placeholder={role === 'doctor' ? "Dr. John Doe" : "John Doe"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest ml-1 text-slate-400">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-slate-400 group-focus-within:text-blue-600" />
            <input 
              type="email" 
              required
              className="input-field pl-14" 
              placeholder={role === 'doctor' ? "doctor@mediflow.com" : "patient@mediflow.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest ml-1 text-slate-400">Password</label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-slate-400 group-focus-within:text-blue-600" />
            <input 
              type={showPassword ? "text" : "password"} 
              required
              className="input-field pl-14 pr-12" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-3 py-5 text-lg group mt-4"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              {role === 'doctor' ? 'Create Doctor Account' : 'Register as Patient'}
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
