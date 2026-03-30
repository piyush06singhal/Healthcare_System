import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { setCredentials } from '../store/authSlice';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock credentials for testing
      if (email === 'doctor@mediflow.com' && password === 'password123') {
        dispatch(setCredentials({
          user: {
            id: 'mock-doctor-id',
            name: 'Dr. Smith',
            email: 'doctor@mediflow.com',
            role: 'doctor'
          },
          token: 'mock-jwt-token'
        }));
        navigate('/doctor-dashboard');
        return;
      }

      if (email === 'patient@mediflow.com' && password === 'password123') {
        dispatch(setCredentials({
          user: {
            id: 'mock-patient-id',
            name: 'John Doe',
            email: 'patient@mediflow.com',
            role: 'patient'
          },
          token: 'mock-jwt-token'
        }));
        navigate('/patient-dashboard');
        return;
      }

      const { data, error: authError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (authError || !data) {
        throw new Error('Invalid email or password');
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

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your MediFlow account to access your personalized health dashboard."
    >
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest border border-red-100 rounded-xl">
            Error: {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="email" 
              required
              className="input-field pl-14" 
              placeholder="name@example.com"
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
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="password" 
              required
              className="input-field pl-14" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-3 py-5 text-lg group"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-500 font-medium">
            Don't have an account? <Link to="/register" className="text-blue-600 font-black hover:text-blue-700 transition-colors">Create account</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
