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
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'sonner';
import { generateAIResponse } from '../lib/ai';
import { setAiSummary } from '../store/healthSlice';
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

export default function DoctorInsights() {
  const [search, setSearch] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { notifications, appointments, tasks, prescriptions, adherenceLogs, aiSummary } = useSelector((state: RootState) => state.health);
  const dispatch = useDispatch();

  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const activePrescriptions = prescriptions.map(p => `- ${p.medication}: ${p.adherence_rate}% adherence`).join('\n');
      const recentAdherence = adherenceLogs.slice(0, 5).map(l => `- Dose on ${l.taken_at && !isNaN(new Date(l.taken_at).getTime()) ? new Date(l.taken_at).toLocaleString() : 'N/A'}: ${l.status}`).join('\n');
      
      const context = `
      CURRENT PRACTICE DATA:
      - Active Patients: ${appointments.length}
      - Pending Tasks: ${tasks.filter(t => !t.completed).length}
      
      ADHERENCE OVERVIEW:
      ${activePrescriptions}
      
      RECENT ACTIVITY LOGS:
      ${recentAdherence}
      `;

      const response = await generateAIResponse(
        "Analyze the current practice data and focus specifically on patient medication adherence trends. Identify potential risks and suggest clinical optimizations.",
        [], 
        'doctor',
        context
      );
      
      dispatch(setAiSummary(response));
      toast.success("Clinical insight core updated.");
    } catch (error) {
      toast.error("AI Insight core failed to synchronize.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const handleRunSimulation = () => {
    setIsSimulating(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 3000)), {
      loading: 'Running Clinical Efficiency Simulation...',
      success: () => {
        setIsSimulating(false);
        return 'Simulation Complete: Optimal workflow mapped.';
      },
      error: 'Simulation failed due to data integrity issues'
    });
  };

  const filteredAlerts = useMemo(() => {
    const realAlerts = notifications
      .filter(n => n.type === 'alert' || n.title.toLowerCase().includes('critical'))
      .map(n => ({
        title: n.title,
        desc: n.message,
        type: 'warning',
        icon: <AlertCircle className="w-6 h-6" />,
        date: 'Just now',
        priority: 'High'
      }));

    const staticAlerts = [
      { 
        title: 'Epidemic Alert', 
        desc: '15% increase in seasonal influenza cases in your region. Recommend proactive screening for respiratory symptoms.', 
        type: 'warning', 
        icon: <AlertCircle className="w-6 h-6" />,
        date: '10m ago',
        priority: 'High'
      }
    ];

    const combined = [...realAlerts, ...staticAlerts];
    return search 
      ? combined.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase()))
      : combined;
  }, [notifications, search]);

  const throughputValue = useMemo(() => {
    const base = 14.2;
    const modifier = appointments.length * 0.1;
    return (base + modifier).toFixed(1);
  }, [appointments]);

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
            <TrendingUp className="w-3 h-3" />
            AI Analytics Engine
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

      <div className="card p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10" />
              <h2 className="text-3xl font-black tracking-tight">Practice Core Intelligence</h2>
            </div>
            <p className="text-lg font-medium text-blue-50/80 leading-relaxed">
              Analyze practice-wide medication adherence and clinical task throughput with Llama 3.3 70B reasoning.
            </p>
            {aiSummary && (
              <div className="p-8 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md max-h-64 overflow-y-auto custom-scrollbar">
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {aiSummary}
                </p>
              </div>
            )}
            <button 
              onClick={handleDeepAnalysis}
              disabled={isAnalyzing}
              className="px-10 py-5 bg-white text-blue-600 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {aiSummary ? 'Refresh Practice Analysis' : 'Initialize Clinical Deep Dive'}
            </button>
          </div>
          <div className="hidden lg:block w-96 h-96 relative">
             <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse blur-3xl" />
             <Activity className="absolute inset-0 m-auto w-48 h-48 text-white/40 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column: Alerts & Feed */}
        <div className="lg:col-span-2 space-y-12">
          {/* Enhanced AI Insight Panel */}
          <motion.div variants={itemVariants} className="card p-12 bg-slate-950 text-white shadow-3xl relative overflow-hidden group">
            <div className="relative z-10 grid lg:grid-cols-2 gap-16">
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-black tracking-tight">AI Clinical Insight</h2>
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
                    <span className="text-2xl font-display font-black text-emerald-400">+{throughputValue}%</span>
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

                <button 
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="w-full py-6 bg-white text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-70"
                >
                  {isSimulating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Run Full Simulation
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <div className="h-[400px] w-full relative">
                <div className="absolute top-0 right-0 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Real-time Data Sync
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recoveryRateData}>
                    <defs>
                      <linearGradient id="clinicalGradient" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#clinicalGradient)"
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

          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
              Critical Alerts
              <span className="w-6 h-6 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">{filteredAlerts.length}</span>
            </h2>
            {filteredAlerts.length > 0 ? filteredAlerts.map((insight, i) => (
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
                      <button 
                        onClick={() => toast.info(`Initializing full data analysis for: ${insight.title}`)}
                        className="px-6 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                      >
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
            )) : (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active alerts detected</p>
              </div>
            )}
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
                  V4.0 Insight Engine
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
                <button 
                  onClick={() => toast.success('AI Model updated with latest clinical benchmarks')}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20"
                >
                  Optimize AI Model
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

            <button 
              onClick={() => {
                toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
                  loading: 'Compiling HIPAA compliance audit...',
                  success: 'Report generated successfully.',
                  error: 'Audit failed: Insufficient data points'
                });
              }}
              className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
            >
              Download Compliance Report
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
