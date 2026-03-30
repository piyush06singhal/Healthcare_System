import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { setCredentials } from '../store/authSlice';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([{ name, email, password, role }])
        .select()
        .single();

      if (insertError) throw insertError;

      if (role === 'patient') {
        await supabase.from('patient_profiles').insert([{ user_id: data.id }]);
      } else {
        await supabase.from('doctor_profiles').insert([{ user_id: data.id }]);
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
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join MediFlow to experience the next generation of personalized healthcare management."
    >
      <form onSubmit={handleRegister} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest border border-red-100 rounded-xl">
            Error: {error}
          </div>
        )}

        <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl transition-all ${role === 'patient' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-500 font-bold hover:text-slate-700'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest">Patient</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl transition-all ${role === 'doctor' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-500 font-bold hover:text-slate-700'}`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest">Doctor</span>
          </button>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              required
              className="input-field pl-14" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

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
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
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
          className="btn-primary w-full flex items-center justify-center gap-3 py-5 text-lg group mt-4"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              Create Account
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
