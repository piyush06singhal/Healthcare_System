import { 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  FileText,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  Video,
  Pill,
  Brain,
  Bell
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'motion/react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Link } from 'react-router-dom';

const throughputData = [
  { name: 'Mon', count: 0, urgent: 0 },
  { name: 'Tue', count: 0, urgent: 0 },
  { name: 'Wed', count: 0, urgent: 0 },
  { name: 'Thu', count: 0, urgent: 0 },
  { name: 'Fri', count: 0, urgent: 0 },
  { name: 'Sat', count: 0, urgent: 0 },
  { name: 'Sun', count: 0, urgent: 0 },
];

const priorityDistribution = [
  { name: 'High', value: 0, color: '#f43f5e' },
  { name: 'Medium', value: 0, color: '#3b82f6' },
  { name: 'Low', value: 0, color: '#10b981' },
];

const clinicalInsights = [
  { title: 'Epidemic Alert', desc: '15% increase in seasonal influenza cases in your region.', type: 'warning', icon: <AlertCircle className="w-4 h-4" /> },
  { title: 'Patient Outcome', desc: 'Recovery rate for post-op patients improved by 8% this month.', type: 'success', icon: <TrendingUp className="w-4 h-4" /> },
  { title: 'Research Update', desc: 'New guidelines for hypertension management released.', type: 'info', icon: <FileText className="w-4 h-4" /> },
];

export default function DoctorOverview() {
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    { label: 'Active Patients', value: '0', icon: <Users className="w-5 h-5" />, trend: '0%', status: 'nominal', color: 'blue' },
    { label: 'Today\'s Appointments', value: '0', icon: <Calendar className="w-5 h-5" />, trend: '0%', status: 'nominal', color: 'purple' },
    { label: 'Critical Alerts', value: '0', icon: <AlertCircle className="w-5 h-5" />, trend: '0%', status: 'nominal', color: 'rose' },
    { label: 'Consultations Done', value: '0', icon: <CheckCircle className="w-5 h-5" />, trend: '0%', status: 'nominal', color: 'emerald' },
  ];

  const quickActions = [
    { 
      title: 'AI Video Gen', 
      desc: 'Create medical educational content', 
      icon: <Sparkles className="w-6 h-6" />, 
      path: '/dashboard/video-gen',
      color: 'from-blue-600/90 to-indigo-600/90',
      shadow: 'shadow-blue-500/20',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400'
    },
    { 
      title: 'AI Assistant', 
      desc: 'Clinical synthesis & analysis', 
      icon: <MessageSquare className="w-6 h-6" />, 
      path: '/dashboard/ai-chat',
      color: 'from-purple-600/90 to-pink-600/90',
      shadow: 'shadow-purple-500/20',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400'
    },
    { 
      title: 'Patient Records', 
      desc: 'Access secure medical history', 
      icon: <FileText className="w-6 h-6" />, 
      path: '/dashboard/patients',
      color: 'from-emerald-600/90 to-teal-600/90',
      shadow: 'shadow-emerald-500/20',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400'
    },
    { 
      title: 'Video Call', 
      desc: 'Virtual patient consultation', 
      icon: <Video className="w-6 h-6" />, 
      path: '/dashboard/video-consultation',
      color: 'from-rose-600/90 to-pink-600/90',
      shadow: 'shadow-rose-500/20',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400'
    },
    { 
      title: 'Prescriptions', 
      desc: 'Digital pharmacy management', 
      icon: <Pill className="w-6 h-6" />, 
      path: '/dashboard/prescriptions',
      color: 'from-amber-600/90 to-orange-600/90',
      shadow: 'shadow-amber-500/20',
      image: 'https://images.unsplash.com/photo-1587854680352-936b22b91030?auto=format&fit=crop&q=80&w=400'
    },
    { 
      title: 'Diagnostics', 
      desc: 'AI-powered neural analysis', 
      icon: <Brain className="w-6 h-6" />, 
      path: '/dashboard/diagnostics',
      color: 'from-indigo-600/90 to-blue-600/90',
      shadow: 'shadow-indigo-500/20',
      image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=400'
    },
    { 
      title: 'Alerts', 
      desc: 'Real-time clinical telemetry', 
      icon: <Bell className="w-6 h-6" />, 
      path: '/dashboard/notifications',
      color: 'from-rose-600/90 to-orange-600/90',
      shadow: 'shadow-rose-500/20',
      image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=400'
    },
    { 
      title: 'Schedule', 
      desc: 'Manage your clinical hours', 
      icon: <Clock className="w-6 h-6" />, 
      path: '/dashboard/schedule',
      color: 'from-slate-600/90 to-slate-800/90',
      shadow: 'shadow-slate-500/20',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=400'
    },
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
      className="space-y-16 pb-16 px-0"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-5 py-2 bg-slate-900 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-blue-500/20 border border-blue-500/30">
              Clinical Command Center v2.5
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
              Neural Link Active
            </div>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Welcome, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Dr. {user?.name?.split(' ')[0] || 'Mitchell'}</span>
          </h1>
          <p className="text-slate-500 font-medium text-xl max-w-2xl leading-relaxed">
            Your clinical ecosystem is optimized for <span className="text-slate-900 font-bold underline decoration-blue-500/30 underline-offset-4">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>. All systems are operating within nominal parameters.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-6">
          <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 flex items-center gap-5 hover:scale-105 transition-transform duration-500">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Security Status</div>
              <div className="text-base font-black text-slate-900">HIPAA Compliant</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Grid - NEW & PRO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {quickActions.map((action, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -12, scale: 1.03 }}
            className="group"
          >
            <Link to={action.path} className="block h-full">
              <div className={`h-full p-10 rounded-[3rem] ${action.shadow} text-white relative overflow-hidden transition-all duration-700 border border-white/10 shadow-2xl`}>
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={action.image} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} mix-blend-multiply opacity-90 transition-opacity duration-500 group-hover:opacity-100`} />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/20 shadow-xl">
                    {action.icon}
                  </div>
                  <h3 className="text-3xl font-black mb-3 tracking-tight leading-tight">{action.title}</h3>
                  <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.15em] leading-relaxed mb-8">{action.desc}</p>
                  <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase tracking-widest group-hover:gap-5 transition-all">
                    Launch Module <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative overflow-hidden rounded-[3rem] bg-white p-10 shadow-2xl shadow-slate-200/60 border border-slate-100"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className={`p-5 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  stat.status === 'critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  <Activity className="w-3.5 h-3.5" />
                  {stat.status}
                </div>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
              <div className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">{stat.value}</div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                  stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  <TrendingUp className={`w-3.5 h-3.5 ${stat.trend.startsWith('-') && 'rotate-180'}`} />
                  {stat.trend}
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">vs last shift</span>
              </div>
            </div>
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000`} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-12">
          {/* Throughput Chart */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3.5rem] bg-white p-12 shadow-2xl shadow-slate-200/60 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Throughput</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Patient volume & urgency distribution</p>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              </div>
            </div>
            
            <div className="h-[400px] w-full flex items-center justify-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 group hover:border-blue-500/30 transition-colors duration-500">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <Activity className="w-10 h-10 text-blue-500 animate-pulse" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Waiting for Clinical Data Sync...</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-12">
          {/* Patient Outcome Chart */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3.5rem] bg-white p-12 shadow-2xl shadow-slate-200/60 border border-slate-100"
          >
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Patient Outcomes</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-10">Recovery Distribution</p>
            
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '24px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                      padding: '16px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-3xl font-black text-slate-900">0%</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Efficiency</div>
              </div>
            </div>

            <div className="space-y-4 mt-10">
              {priorityDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name} Priority</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Clinical Insights */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3.5rem] bg-white p-12 shadow-2xl shadow-slate-200/60 border border-slate-100"
          >
            <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Clinical Insights</h3>
            <div className="space-y-8">
              {clinicalInsights.map((insight, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    insight.type === 'warning' ? 'bg-rose-50 text-rose-600' :
                    insight.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-black text-slate-900 uppercase tracking-widest">{insight.title}</div>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
