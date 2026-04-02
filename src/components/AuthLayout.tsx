import { Activity, ArrowLeft, Shield, Lock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-slate-900/90"></div>
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1631217816660-ad353559869e?auto=format&fit=crop&q=80&w=1200" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Healthcare"
          referrerPolicy="no-referrer"
        />
        
        <div className="relative z-20 p-20 flex flex-col justify-between h-full text-white">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <span className="text-3xl font-black tracking-tight">MediFlow</span>
          </Link>

          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-white/10"
            >
              <Star className="w-3 h-3 fill-current text-yellow-400" />
              Trusted by 50,000+ Patients
            </motion.div>
            <h2 className="text-6xl font-black leading-tight mb-8 tracking-tight">
              Welcome back to the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Future of Care.</span>
            </h2>
            <p className="text-xl text-white/70 max-w-md font-medium leading-relaxed">
              Log in to access your secure medical records, AI diagnostics, and personalized health insights.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex -space-x-4">
              {[1, 2, 3].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i + 20}`} className="w-12 h-12 rounded-full border-4 border-slate-900" alt="User" />
              ))}
            </div>
            <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Join our growing community</div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-10 glass-card p-6 rounded-3xl z-20 hidden xl:block"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-xs font-black text-slate-900 uppercase tracking-widest">Secure Access</div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full flex items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-8 hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{title}</h1>
            <p className="text-slate-500 font-medium">{subtitle}</p>
          </div>

          <div className="card p-10">
            {children}
          </div>

          <div className="mt-12 flex justify-center gap-8">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-3 h-3" />
              HIPAA Compliant
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3 h-3" />
              SSL Encrypted
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
