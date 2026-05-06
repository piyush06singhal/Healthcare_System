import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for session - Supabase automatically handles the hash/access_token
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session immediately, give it a tiny bit of time for the hash to be processed
        setTimeout(async () => {
          const { data: { secondSession } } = await supabase.auth.getSession() as any;
          if (!secondSession) {
            toast.error('Invalid or expired reset link.');
            navigate('/login');
          }
        }, 500);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success('Password updated successfully!', {
        description: 'You can now sign in with your new password.'
      });
      navigate('/login');
    } catch (err: any) {
      console.error('Update password error:', err);
      toast.error(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create New Password" 
      subtitle="Your identity has been verified. Please choose a strong new password."
    >
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8">
        <ShieldCheck className="w-8 h-8 text-emerald-600" />
      </div>

      <form onSubmit={handleReset} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
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

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-slate-400 group-focus-within:text-blue-600" />
            <input 
              type={showPassword ? "text" : "password"} 
              required
              className="input-field pl-14 pr-12" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-3 py-5 text-lg group shadow-xl active:scale-[0.98] transition-all"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              Update Password
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
