import { 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  FileText,
  Search,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const clinicalInsights = [
  { 
    title: 'Epidemic Alert', 
    desc: '15% increase in seasonal influenza cases in your region. Recommend proactive screening for respiratory symptoms.', 
    type: 'warning', 
    icon: <AlertCircle className="w-6 h-6" />,
    date: '10m ago',
    priority: 'High'
  },
  { 
    title: 'Patient Outcome', 
    desc: 'Recovery rate for post-op patients improved by 8% this month. Protocol changes are showing positive results.', 
    type: 'success', 
    icon: <TrendingUp className="w-6 h-6" />,
    date: '2h ago',
    priority: 'Medium'
  },
  { 
    title: 'Research Update', 
    desc: 'New guidelines for hypertension management released by the AHA. Review recommended for current patient protocols.', 
    type: 'info', 
    icon: <FileText className="w-6 h-6" />,
    date: '5h ago',
    priority: 'Low'
  },
  { 
    title: 'System Optimization', 
    desc: 'AI diagnostics accuracy improved to 98.4% with the latest model update.', 
    type: 'success', 
    icon: <Zap className="w-6 h-6" />,
    date: '1d ago',
    priority: 'Low'
  },
];

export default function DoctorInsights() {
  const [search, setSearch] = useState('');

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
      className="space-y-16 pb-24 px-4 lg:px-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Clinical Insights</h1>
          <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">AI-driven analytics and medical intelligence for your practice. Stay informed with real-time epidemic alerts and research updates.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search insights..." 
            className="pl-14 pr-8 py-5 rounded-[2rem] bg-white border border-slate-100 text-base focus:outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 transition-all w-full lg:w-96 text-slate-900 shadow-2xl shadow-slate-200/60 font-medium"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {clinicalInsights.map((insight, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ x: 10 }}
              className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 group relative overflow-hidden"
            >
              <div className="flex items-start gap-8">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 ${
                  insight.type === 'warning' ? 'bg-rose-50 text-rose-600 shadow-lg shadow-rose-100' :
                  insight.type === 'success' ? 'bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100' :
                  'bg-blue-50 text-blue-600 shadow-lg shadow-blue-100'
                }`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{insight.title}</h3>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        insight.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        insight.priority === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {insight.priority} Priority
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{insight.date}</span>
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed text-lg mb-8">
                    {insight.desc}
                  </p>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Read Full Report
                    </button>
                    <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-5 rounded-full blur-3xl ${
                insight.type === 'warning' ? 'bg-rose-500' :
                insight.type === 'success' ? 'bg-emerald-500' :
                'bg-blue-500'
              }`} />
            </motion.div>
          ))}
        </div>

        <div className="space-y-10">
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-xl shadow-blue-200 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">AI Diagnostic Assistant</h3>
              <p className="text-blue-100 font-medium leading-relaxed mb-10">
                Leverage our advanced neural networks to analyze complex patient data and identify subtle patterns.
              </p>
              <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-blue-900/20">
                Launch AI Analysis
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Status</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Encryption</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HIPAA Compliance</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Logs</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Audit Ready</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
