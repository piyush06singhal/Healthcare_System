import { useState } from 'react';
import { 
  Brain, 
  MessageSquare, 
  Activity, 
  Zap, 
  Sparkles,
  Shield,
  Search,
  Cpu,
  Microscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DoctorAIChat from './DoctorAIChat';
import DoctorDiagnostics from './DoctorDiagnostics';

type WorkbenchTab = 'chat' | 'diagnostics';

export default function DoctorAIWorkbench() {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('chat');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20 px-4 lg:px-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-950 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-[0.25em] shadow-xl border border-white/5">
            <Cpu className="w-3 h-3" />
            AI Processing V4.2
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black text-slate-900 tracking-tighter leading-none">Clinical Workbench</h1>
          <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">Your integrated AI engine for clinical decision support and medical diagnostics.</p>
        </div>

        <div className="flex bg-white p-2 rounded-[2rem] shadow-2xl border border-slate-100">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-8 py-4 rounded-3xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
              activeTab === 'chat' ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Clinical Chat
          </button>
          <button 
            onClick={() => setActiveTab('diagnostics')}
            className={`px-8 py-4 rounded-3xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
              activeTab === 'diagnostics' ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Microscope className="w-4 h-4" />
            Diagnostics
          </button>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-[700px]"
            >
              <DoctorAIChat />
            </motion.div>
          ) : (
            <motion.div
              key="diagnostics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-[700px]"
            >
              <DoctorDiagnostics />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared Workbench Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Uptime', val: '99.99%', icon: <Zap className="w-4 h-4" />, color: 'emerald' },
          { label: 'Processing', val: '80.2 TFLOPS', icon: <Cpu className="w-4 h-4" />, color: 'blue' },
          { label: 'Data Sync', val: 'Real-time', icon: <Activity className="w-4 h-4" />, color: 'indigo' },
          { label: 'Security', val: 'Level 4', icon: <Shield className="w-4 h-4" />, color: 'slate' },
        ].map((m, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className="p-6 bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center gap-5"
          >
            <div className={`w-12 h-12 bg-${m.color}-50 text-${m.color}-600 rounded-2xl flex items-center justify-center`}>
              {m.icon}
            </div>
            <div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{m.label}</div>
              <div className="text-xl font-black text-slate-900">{m.val}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
