import { 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  FileText,
  Search,
  Sparkles,
  Shield,
  Zap,
  Brain,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const recoveryRateData = [
  { month: 'Jan', rate: 78, expected: 75, load: 45 },
  { month: 'Feb', rate: 82, expected: 78, load: 52 },
  { month: 'Mar', rate: 80, expected: 82, load: 48 },
  { month: 'Apr', rate: 85, expected: 84, load: 60 },
  { month: 'May', rate: 88, expected: 86, load: 65 },
  { month: 'Jun', rate: 92, expected: 90, load: 70 },
  { month: 'Jul', rate: 94, expected: 93, load: 72 },
];

const treatmentEfficacyData = [
  { name: 'Protocol A', value: 85, color: '#3b82f6' },
  { name: 'Protocol B', value: 72, color: '#8b5cf6' },
  { name: 'AI Hybrid', value: 94, color: '#10b981' },
  { name: 'Standard', value: 65, color: '#f59e0b' },
];

const diagnosticAccuracyData = [
  { day: '01', accuracy: 94.2 },
  { day: '02', accuracy: 94.8 },
  { day: '03', accuracy: 95.1 },
  { day: '04', accuracy: 95.9 },
  { day: '05', accuracy: 96.5 },
  { day: '06', accuracy: 97.2 },
  { day: '07', accuracy: 98.4 },
];

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
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-950 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-[0.25em] shadow-xl border border-white/5">
            <Brain className="w-3 h-3" />
            Neural Analytics Engine
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black text-slate-900 tracking-tighter leading-none">Clinical Insights</h1>
          <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">AI-driven analytics and medical intelligence for your practice.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search intelligence..." 
            className="pl-14 pr-8 py-5 rounded-[2rem] bg-white border border-slate-100 text-base focus:outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 transition-all w-full lg:w-96 text-slate-900 shadow-2xl shadow-slate-200/60 font-medium"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column: Alerts & Feed */}
        <div className="lg:col-span-2 space-y-12">
          {/* Enhanced Neural Insight Panel */}
          <motion.div variants={itemVariants} className="card p-12 bg-slate-950 text-white shadow-3xl relative overflow-hidden group">
            <div className="relative z-10 grid lg:grid-cols-2 gap-16">
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-black tracking-tight">Neural Performance</h2>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.25em]">Predictive Clinical Efficiency v9.0</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-sm font-bold">Diagnostic Throughput</span>
                    </div>
                    <span className="text-2xl font-display font-black text-emerald-400">+14.2%</span>
                  </div>
                  <div className="flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-sm font-bold">Accuracy Convergence</span>
                    </div>
                    <span className="text-2xl font-display font-black text-blue-400">99.8%</span>
                  </div>
                </div>

                <button className="w-full py-6 bg-white text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4">
                  Run Full Simulation
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>

              <div className="h-[400px] w-full relative">
                <div className="absolute top-0 right-0 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Real-time Neural Sync
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recoveryRateData}>
                    <defs>
                      <linearGradient id="neuralGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                      cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      fill="url(#neuralGradient)"
                      animationDuration={2000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expected" 
                      stroke="#6366f1" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      fill="transparent"
                      animationDuration={2500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Main Charts Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="card p-10 space-y-8 bg-white shadow-2xl shadow-slate-200/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">Recovery Trend</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Post-operative success rate</p>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recoveryRateData}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontSize: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRate)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-10 space-y-8 bg-white shadow-2xl shadow-slate-200/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">Diagnostic Flow</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase">AI vs Manual Accuracy</p>
                </div>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={treatmentEfficacyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {treatmentEfficacyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
              Critical Alerts
              <span className="w-6 h-6 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">3</span>
            </h2>
            {clinicalInsights.map((insight, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ x: 10 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 group relative overflow-hidden"
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
                      <button className="px-6 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Analyze Full Data
                      </button>
                      <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                        Archive Feed
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Metrics */}
        <div className="space-y-10">
          <motion.div 
            variants={itemVariants}
            className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                  V4.0 Neural Link
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl font-display font-black mb-4 tracking-tighter">AI Accuracy Matrix</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={diagnosticAccuracyData}>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }} />
                      <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={4} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</span>
                  <span className="text-lg font-black text-white">Top 0.1%</span>
                </div>
                <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20">
                  Optimize Neural Engine
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="card p-10 space-y-8 bg-white border border-slate-100 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Clinical Compliance</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Standards Status</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Privacy Protocol</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Level A+</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Sovereignty</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Verified</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Trail</span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Secured</span>
              </div>
            </div>

            <button className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
              Download Compliance Report
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
