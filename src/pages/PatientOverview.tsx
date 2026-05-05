import { 
  Heart, 
  Activity, 
  Droplets, 
  Wind, 
  Thermometer,
  Sparkles,
  ArrowRight,
  Shield,
  Target,
  Brain,
  Zap,
  TrendingUp,
  Clock,
  ChevronRight, 
  Calendar, 
  FileText, 
  Plus,
  Pill,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import PatientOnboarding from '../components/PatientOnboarding';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'sonner';
import { setAiSummary } from '../store/healthSlice';
import { useState, useEffect } from 'react';

export default function PatientOverview() {
  const { user, activeProfile } = useSelector((state: RootState) => state.auth);
  const { biometrics, aiSummary, prescriptions, diagnostics } = useSelector((state: RootState) => state.health);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check onboarding status
    const completed = localStorage.getItem(`onboarding_complete_${user?.id}`);
    if (!completed) {
      setShowOnboarding(true);
    }

    // Simulate initial data fetch
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [user]);

  const stats = [
    { label: 'Heart Rate', value: biometrics.heartRate && biometrics.heartRate.length > 0 ? biometrics.heartRate[biometrics.heartRate.length - 1].value : 0, unit: 'BPM', icon: <Heart className="w-5 h-5" />, color: 'rose', trend: '+2%' },
    { label: 'Blood Pressure', value: biometrics.bloodPressure, unit: 'mmHg', icon: <Activity className="w-5 h-5" />, color: 'blue', trend: 'Stable' },
    { label: 'Blood Sugar', value: biometrics.bloodSugar, unit: 'mg/dL', icon: <Droplets className="w-5 h-5" />, color: 'amber', trend: '-1%' },
    { label: 'Oxygen Level', value: biometrics.oxygen, unit: '%', icon: <Wind className="w-5 h-5" />, color: 'emerald', trend: 'Optimal' },
  ];

  const healthScoreData = [
    { name: 'Stability', value: 88, color: '#2563eb' },
    { name: 'Remaining', value: 12, color: '#f1f5f9' },
  ];

  const handleRegenerateAI = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Neural core analysis in progress...',
        success: () => {
          dispatch(setAiSummary('Strategic analysis complete: Your cardiovascular recovery rate has optimized by 12%. Metabolic pathways show high efficiency. Recommended: Increase magnesium intake and maintain current sleep hygiene.'));
          return 'AI Insight Regenerated';
        },
        error: 'Neural sync failed',
      }
    );
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      <AnimatePresence>
        {showOnboarding && (
          <PatientOnboarding onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem(`onboarding_complete_${user?.id}`, 'true');
          }} />
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
              Personal Health Hub
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Data Sync Active
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.name?.split(' ')[0] || 'Piyush'}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-lg">
            Your health metrics are looking <span className="text-emerald-600 font-bold italic">excellent</span> today.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-4">
          <button 
            onClick={() => navigate('/dashboard/records')}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Vitals
          </button>
          <button 
            onClick={() => navigate('/dashboard/appointments')}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Book Appointment
          </button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-500`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  <Activity className="w-3 h-3" />
                  Live
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="flex items-baseline gap-2 mb-4">
                <div className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.unit}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  stat.trend.startsWith('+') ? 'bg-rose-50 text-rose-600' : 
                  stat.trend === 'Stable' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${stat.trend.startsWith('-') && 'rotate-180'}`} />
                  {stat.trend}
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">vs yesterday</span>
              </div>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Health Score & Summary */}
          <motion.div 
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="relative w-48 h-48 mb-6">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthScoreData}
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={0}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        cornerRadius={10}
                      >
                        {healthScoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900 leading-none">88</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Stability</span>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Health Index: Optimal</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">
                Your biometric synchronization is performing at peak efficiency.
              </p>
            </div>

            <div className="grid md:grid-rows-2 gap-8">
              <div className="bg-slate-950 rounded-[3rem] p-8 text-white relative overflow-hidden group cursor-pointer" onClick={() => navigate('/dashboard/security')}>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Sync</span>
                  </div>
                  <h4 className="text-xl font-black mb-2">Vault Integration</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                    Records encrypted with multi-layer neural architecture.
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/dashboard/security'); }}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Manage Privacy
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
              
              <div className="bg-blue-600 rounded-[3rem] p-8 text-white relative overflow-hidden group shadow-lg shadow-blue-600/20 cursor-pointer" onClick={() => navigate('/dashboard/ai-chat')}>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-5 h-5 text-blue-100" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Neural Assist</span>
                  </div>
                  <h4 className="text-xl font-black mb-2">Personal Concierge</h4>
                  <p className="text-xs text-blue-100 font-medium leading-relaxed">
                    AI agent is analyzing your recent trends to optimize hydration.
                  </p>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            </div>
          </motion.div>

          {/* Health Trends Chart */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Health Trends</h3>
                <p className="text-sm text-slate-400 font-medium">Continuous monitoring of your vital signs</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {['24H', '7D', '30D'].map((period) => (
                  <button key={period} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    period === '24H' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}>
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={biometrics.heartRate}>
                    <defs>
                      <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '15px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorHeart)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-xl shadow-blue-200 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">AI Health Assistant</h3>
                </div>
                <button 
                  onClick={handleRegenerateAI}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                >
                  <Zap className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 mb-8">
                <p className="text-blue-50 text-lg font-medium leading-relaxed italic">
                  "{aiSummary}"
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
                  <h4 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Neural Active
                  </h4>
                  <p className="text-blue-100 text-sm font-medium leading-relaxed">
                    Analyzing real-time sensor streams to optimize metabolic synchronization.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
                  <h4 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Temporal Sync
                  </h4>
                  <p className="text-blue-100 text-sm font-medium leading-relaxed">
                     circadian rhythm alignment is currently at peak stability levels.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-10"
          >
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Pill className="w-6 h-6 text-blue-600" />
                  Medication Adherence
                </h3>
                <ArrowRight className="w-5 h-5 text-slate-300" />
              </div>
              <div className="space-y-4">
                {prescriptions.length > 0 ? prescriptions.map((px, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all">
                    <div>
                      <div className="text-xs font-black text-slate-900">{px.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{px.frequency}</div>
                    </div>
                    <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                      {px.remaining} left
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">No active prescriptions</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                  Recent AI Diagnostics
                </h3>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {diagnostics.length > 0 ? diagnostics.map((diag, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-black text-slate-900 uppercase tracking-tighter">{diag.classification}</div>
                      <div className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">
                        {Math.round(diag.confidence * 100)}% Match
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-3 line-clamp-2 italic">
                      "{diag.findings}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {diag.risk_factors.slice(0, 2).map((risk: string, idx: number) => (
                        <span key={idx} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-400">
                          {risk}
                        </span>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-40">
                    <History className="w-8 h-8 text-slate-300 mb-2" />
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Recent Analysis</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-10">
          {/* Upcoming Appointments */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900">Upcoming</h3>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="space-y-6">
              {[
                { doctor: 'Dr. Sarah Mitchell', specialty: 'Cardiologist', time: 'Tomorrow, 10:00 AM', color: 'blue' },
                { doctor: 'Dr. James Wilson', specialty: 'General Physician', time: 'Oct 15, 02:30 PM', color: 'emerald' },
              ].map((apt, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-${apt.color}-50 text-${apt.color}-600 flex items-center justify-center shrink-0`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">{apt.doctor}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{apt.specialty}</div>
                    <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{apt.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h3 className="text-xl font-black text-slate-900 mb-8">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Records', icon: <FileText />, color: 'bg-blue-600', path: '/dashboard/records' },
                  { name: 'Vitals', icon: <Activity />, color: 'bg-indigo-600', path: '/dashboard/records' },
                  { name: 'AI Chat', icon: <Sparkles />, color: 'bg-purple-600', path: '/dashboard/ai-chat' },
                  { name: 'Labs', icon: <Droplets />, color: 'bg-emerald-600', path: '/dashboard/records' },
                ].map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => navigate(action.path)}
                    className="p-6 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-all group text-left"
                  >
                    <div className={`w-12 h-12 ${action.color} text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/10`}>
                      {action.icon}
                    </div>
                    <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-tight">
                      {action.name}
                    </div>
                  </button>
                ))}
              </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
