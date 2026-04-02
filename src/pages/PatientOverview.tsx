import { 
  Activity, 
  Heart, 
  Zap, 
  Clock, 
  ChevronRight, 
  Calendar, 
  FileText, 
  Plus, 
  TrendingUp, 
  Droplets, 
  Wind, 
  Thermometer,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const biometricData = [
  { time: '08:00', heartRate: 0, bp: 0, oxygen: 0 },
  { time: '10:00', heartRate: 0, bp: 0, oxygen: 0 },
  { time: '12:00', heartRate: 0, bp: 0, oxygen: 0 },
  { time: '14:00', heartRate: 0, bp: 0, oxygen: 0 },
  { time: '16:00', heartRate: 0, bp: 0, oxygen: 0 },
  { time: '18:00', heartRate: 0, bp: 0, oxygen: 0 },
  { time: '20:00', heartRate: 0, bp: 0, oxygen: 0 },
];

export default function PatientOverview() {
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    { label: 'Heart Rate', value: '0', unit: 'BPM', icon: <Heart className="w-5 h-5" />, color: 'rose', trend: '0%' },
    { label: 'Blood Pressure', value: '0/0', unit: 'mmHg', icon: <Activity className="w-5 h-5" />, color: 'blue', trend: 'Stable' },
    { label: 'Blood Sugar', value: '0', unit: 'mg/dL', icon: <Droplets className="w-5 h-5" />, color: 'amber', trend: '0%' },
    { label: 'Oxygen Level', value: '0', unit: '%', icon: <Wind className="w-5 h-5" />, color: 'emerald', trend: 'Normal' },
  ];

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
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Log Vitals
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2">
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={biometricData}>
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
                    dataKey="heartRate" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorHeart)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Health Insights */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-xl shadow-blue-200 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">AI Health Insights</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
                  <h4 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Activity Recommendation
                  </h4>
                  <p className="text-blue-100 text-sm font-medium leading-relaxed">
                    Your heart rate variability is high today. Perfect time for a high-intensity workout or a long run.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
                  <h4 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Sleep Analysis
                  </h4>
                  <p className="text-blue-100 text-sm font-medium leading-relaxed">
                    You achieved 2.5 hours of deep sleep last night. Your recovery score is 94/100. Keep it up!
                  </p>
                </div>
              </div>
              <button className="mt-10 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                View Full Analysis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
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
                { name: 'Records', icon: <FileText />, color: 'bg-blue-600' },
                { name: 'Vitals', icon: <Activity />, color: 'bg-indigo-600' },
                { name: 'AI Chat', icon: <Sparkles />, color: 'bg-purple-600' },
                { name: 'Labs', icon: <Droplets />, color: 'bg-emerald-600' },
              ].map((action, i) => (
                <button key={i} className="p-6 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-all group text-left">
                  <div className={`w-12 h-12 ${action.color} text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
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
