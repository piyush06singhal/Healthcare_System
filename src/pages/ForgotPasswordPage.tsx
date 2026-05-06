import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Reset link sent!', {
        description: 'Please check your email for instructions to reset your password.'
      });
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast.error(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout 
        title="Check Your Email" 
        subtitle="We've sent a password reset link to your email address."
      >
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div className="space-y-4 mb-10">
            <p className="text-slate-600 font-medium">
              Didn't receive the email? Check your spam folder or try again with a different email address.
            </p>
          </div>

          <button 
            onClick={() => setSubmitted(false)}
            className="text-blue-600 font-black hover:text-blue-700 transition-colors uppercase tracking-widest text-xs"
          >
            Try another email
          </button>
        </div>

        <div className="pt-8 border-t border-slate-100 text-center">
          <Link to="/login" className="text-slate-500 font-medium hover:text-blue-600 transition-colors">
            Return to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Forgot Password?" 
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8">
        <KeyRound className="w-8 h-8 text-blue-600" />
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-slate-400 group-focus-within:text-blue-600" />
            <input 
              type="email" 
              required
              className="input-field pl-14" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Send Reset Link
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-500 font-medium">
            Remembered your password? <Link to="/login" className="text-blue-600 font-black hover:text-blue-700 transition-colors">Sign In</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
