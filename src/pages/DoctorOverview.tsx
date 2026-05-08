import { 
  Users, 
  Calendar, 
  AlertCircle, 
  ArrowRight, 
  Activity, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Brain,
  Video,
  Shield,
  Zap,
  Sparkles,
  Bell,
  Search,
  Settings,
  MoreVertical,
  Stethoscope,
  PieChart as PieChartIcon,
  CheckCircle2,
  Circle,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
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

const clinicalActivityData = [
  { time: '08:00', patients: 12, complexity: 45 },
  { time: '10:00', patients: 25, complexity: 78 },
  { time: '12:00', patients: 20, complexity: 60 },
  { time: '14:00', patients: 35, complexity: 90 },
  { time: '16:00', patients: 28, complexity: 65 },
  { time: '18:00', patients: 15, complexity: 40 },
  { time: '20:00', patients: 8, complexity: 30 },
];

const diagnosticDistribution = [
  { name: 'Cardiology', value: 35, color: '#3b82f6' },
  { name: 'Neurology', value: 25, color: '#8b5cf6' },
  { name: 'Oncology', value: 20, color: '#ec4899' },
  { name: 'General', value: 20, color: '#10b981' },
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
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

export default function DoctorOverview() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { biometrics, appointments: reduxAppointments, practitioners, tasks } = useSelector((state: RootState) => state.health);
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [networkPatientCount, setNetworkPatientCount] = useState<string>('...');
  const [practitionerData, setPractitionerData] = useState<any>(null);

  useEffect(() => {
    const fetchContext = async () => {
      // Fetch Patient Count
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient');
      if (count !== null) setNetworkPatientCount(count.toLocaleString());

      // Check if current user is a registered practitioner
      if (user?.id) {
        const { data } = await supabase
          .from('practitioners')
          .select('*')
          .eq('email', user.email)
          .single();
        setPractitionerData(data);
      }
    };
    fetchContext();
  }, [user]);

  const hasRealData = reduxAppointments.length > 0;
  
  // Dynamic Chart Data
  const dynamicCaseDistribution = [
    { name: 'Active', value: reduxAppointments.filter(a => a.status === 'accepted').length, color: '#3b82f6' },
    { name: 'Pending', value: reduxAppointments.filter(a => a.status === 'pending').length, color: '#8b5cf6' },
    { name: 'Urgent', value: reduxAppointments.filter(a => a.priority === 'urgent' || a.priority === 'critical').length, color: '#ec4899' },
    { name: 'Complete', value: reduxAppointments.filter(a => a.status === 'completed').length, color: '#10b981' },
  ];

  const latestNotifications = notifications.slice(0, 3);
  const displayFeed = latestNotifications.length > 0 ? latestNotifications.map(n => ({
    type: n.type === 'urgent' ? 'critical' : n.type === 'success' ? 'success' : 'info',
    title: n.title,
    desc: n.message,
    meta: n.time
  })) : [
    { type: 'critical', title: 'Critical Lab Alert', desc: 'Patient Sarah Jenkins: Elevated Troponin levels detected. Immediate review required.', meta: '2m ago' },
    { type: 'info', title: 'Test Results Available', desc: 'Metabolic panel results for John Doe are ready for clinical review.', meta: '15m ago' },
    { type: 'success', title: 'Profile Updated', desc: 'Your medical credentials have been successfully updated in the directory.', meta: '1h ago' }
  ];

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('clinical_tasks')
        .update({ completed: !completed })
        .eq('id', id);
      
      if (error) throw error;

      if (!completed) {
        toast.success('Task synchronized to clinical history', {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        });
      }
    } catch (err: any) {
      toast.error('Failed to update task');
    }
  };

  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [taskSort, setTaskSort] = useState<'priority' | 'newest'>('priority');

  const filteredTasks = tasks
    .filter(t => {
      if (taskFilter === 'pending') return !t.completed;
      if (taskFilter === 'completed') return t.completed;
      return true;
    })
    .sort((a, b) => {
      if (taskSort === 'priority') {
        const order: Record<string, number> = { critical: 0, urgent: 1, medium: 2, low: 3 };
        return (order[a.priority as string] ?? 2) - (order[b.priority as string] ?? 2);
      }
      return b.id.localeCompare(a.id);
    });

  const pendingAppointments = reduxAppointments.filter(a => a.status === 'pending');
  const criticalAppointments = reduxAppointments.filter(a => a.priority === 'urgent' || a.priority === 'critical');

  const stats = [
    { label: 'Patient Network', value: networkPatientCount, icon: <Users className="w-6 h-6" />, trend: '+12%', status: 'nominal', color: 'blue' },
    { label: 'Appointments Today', value: reduxAppointments.length.toString(), icon: <Calendar className="w-6 h-6" />, trend: `+${pendingAppointments.length}`, status: 'priority', color: 'purple' },
    { label: 'Critical Alerts', value: criticalAppointments.length.toString().padStart(2, '0'), icon: <AlertCircle className="w-6 h-6" />, trend: '-2', status: 'urgent', color: 'rose' },
    { label: 'System Status', value: 'Live', icon: <Activity className="w-6 h-6" />, trend: 'Optimal', status: 'nominal', color: 'emerald' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20"
    >
      {/* Notification Banner for Unregistered Practitioners */}
      <AnimatePresence>
        {!practitionerData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 mb-8 border border-white/10 group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                  <Stethoscope className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-black tracking-tight">Professional Profile Not Set</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Complete your medical profile to start receiving appointments</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/dashboard/staff')}
                className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-3 whitespace-nowrap"
              >
                Create Medical Profile
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b border-slate-200/60 pb-12">
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-4 py-1.5 bg-slate-950 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-[0.25em] shadow-xl border border-white/5">
              Doctor Control Center
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-4 py-1.5 rounded-full border border-emerald-500/10">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
              Network Primary Sync
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display font-black text-slate-950 tracking-tighter leading-[0.85]">
            Hello, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Dr. {user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed">
            Your dashboard is ready for <span className="text-slate-950 font-bold underline decoration-blue-500/30 underline-offset-4">{format(new Date(), 'EEEE, MMMM do')}</span>. 
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
           <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Privacy Lab</div>
                <div className="text-sm font-black text-slate-950">Level 4 Secure</div>
              </div>
           </div>
           <div className="p-8 bg-slate-950 rounded-[2.5rem] shadow-xl border border-white/5 flex flex-col gap-4">
              <div className="w-12 h-12 bg-white/10 text-blue-400 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Latency</div>
                <div className="text-sm font-black text-white">0.02ms Sync</div>
              </div>
           </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-100 hover:border-blue-500/20 transition-all duration-500"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-slate-50 text-slate-900 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 flex items-center justify-center shadow-sm`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  stat.status === 'urgent' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                  stat.status === 'priority' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                  'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {stat.status}
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">{stat.label}</div>
                <div className="text-5xl font-display font-black text-slate-950 tracking-tighter mb-4">{stat.value}</div>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                    stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {stat.trend}
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active Shift</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task Center & Real-time Reminders */}
      <motion.div variants={itemVariants} className="bg-slate-950 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 grid lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-3xl font-display font-black text-white tracking-tight">Clinical Task Center</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em]">Workflow persistence engine</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  {(['all', 'pending', 'completed'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                        taskFilter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => toast.info('Accessing clinical task constructor...')}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all border border-white/10"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <motion.div 
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={`group p-6 rounded-[2.5rem] border transition-all cursor-pointer flex items-center justify-between gap-6 ${
                      task.completed 
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' 
                        : 'bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`transition-all ${task.completed ? 'text-emerald-500 scale-110' : 'text-slate-500 group-hover:text-blue-500 group-hover:scale-110'}`}>
                        {task.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <div className={`text-sm font-black transition-all ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                            {task.text}
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter ${
                            task.priority === 'critical' ? 'bg-rose-500 text-white' : 
                            task.priority === 'urgent' ? 'bg-orange-500 text-white' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            <Plus className="w-2 h-2 text-blue-500" />
                            {task.category}
                          </div>
                          <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            <Calendar className="w-2 h-2 text-indigo-500" />
                            {task.dueDate}
                          </div>
                        </div>
                      </div>
                    </div>
                    {task.completed ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-blue-600/20">
                        <ArrowRight className="w-4 h-4 text-blue-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">AI Reminders</h3>
            </div>
            
            <div className="grid gap-6">
              {[
                { title: 'Follow-up Consultation', patient: 'Sarah Jenkins', time: '14:30', desc: 'Vital sign data indicates possible arrhythmia. Review diagnostic trends.' },
                { title: 'Prescription Sync', patient: 'Unit 07', time: '16:00', desc: 'Automated metabolic sequence complete. Validate prescription adjustments.' }
              ].map((reminder, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/10 backdrop-blur-3xl relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">
                        AI Suggestion
                      </div>
                      <div className="text-lg font-black text-white">{reminder.time}</div>
                    </div>
                    <div>
                      <div className="text-xl font-display font-black text-white mb-1">{reminder.title}</div>
                      <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-4">Patient: {reminder.patient}</div>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">{reminder.desc}</p>
                    </div>
                    <button className="py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl">
                      Handle Now
                    </button>
                  </div>
                  <Sparkles className="absolute -right-4 -top-4 w-32 h-32 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent pointer-events-none" />
      </motion.div>

      {/* Main Feature Cards */}
      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-[3.5rem] bg-white p-12 shadow-xl border border-slate-100 relative overflow-hidden flex flex-col">
          <div className="relative z-10 space-y-10 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-3xl font-display font-black text-slate-950 tracking-tight">Clinical Throughput</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">Synthesized patient diagnostics & vital signs</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-[8px] font-black text-slate-400 uppercase">Patients</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-[8px] font-black text-slate-400 uppercase">Complexity</span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clinicalActivityData}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorComplexity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="patients" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPatients)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="complexity" 
                    stroke="#8b5cf6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorComplexity)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-8">
           <div className="rounded-[3rem] bg-white p-10 shadow-xl border border-slate-100 relative overflow-hidden flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-slate-950 uppercase tracking-tight">Active Case Load</h3>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Roster Status</p>
                </div>
                <PieChartIcon className="w-5 h-5 text-slate-400" />
              </div>
              
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicCaseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {dynamicCaseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 700 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-2xl font-black text-slate-950">{reduxAppointments.length}</div>
                  <div className="text-[8px] font-black text-slate-400 uppercase">Active Cases</div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {dynamicCaseDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </div>
                    <span>{item.value || 0}</span>
                  </div>
                ))}
              </div>
           </div>

           <div className="rounded-[3rem] bg-gradient-to-br from-indigo-700 to-purple-900 p-10 text-white shadow-2xl relative overflow-hidden group h-[280px]">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                  <Video className="w-7 h-7" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-display font-black tracking-tight leading-none">Virtual Consultation</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/20">
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="" />
                    </div>
                    <div>
                      <div className="text-sm font-black">Alex Rivera</div>
                      <div className="text-[10px] font-bold text-white/60 uppercase">Starting T-12m</div>
                    </div>
                  </div>
                </div>
              </div>
              <Sparkles className="absolute -right-4 -top-4 w-32 h-32 text-white/5 rotate-12" />
           </div>
        </motion.div>
      </div>

      {/* Notifications & Triage */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="card p-10 space-y-8 bg-white border border-slate-100 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 shadow-lg shadow-blue-600/30" />
              </div>
              <h3 className="text-xl font-display font-black text-slate-950 uppercase tracking-tight">Live Vitals: Patient #001</h3>
            </div>
            <div className="flex items-center gap-2 text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               Real-time Sync
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Heart Rate', value: (biometrics.heartRate && biometrics.heartRate.length > 0) ? biometrics.heartRate[biometrics.heartRate.length - 1].value : 0, unit: 'BPM', color: 'rose' },
              { label: 'BP', value: biometrics.bloodPressure, unit: 'mmHg', color: 'blue' },
              { label: 'Sugar', value: biometrics.bloodSugar, unit: 'mg/dL', color: 'amber' },
              { label: 'Oxygen', value: biometrics.oxygen, unit: '%', color: 'emerald' },
            ].map((v, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{v.label}</div>
                <div className={`text-xl font-black tracking-tight ${
                  v.color === 'rose' ? 'text-rose-600' :
                  v.color === 'blue' ? 'text-blue-600' :
                  v.color === 'amber' ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>{v.value} <span className="text-[10px] text-slate-400">{v.unit}</span></div>
              </div>
            ))}
          </div>

          <div className="h-48 w-full bg-slate-50 rounded-3xl p-4 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={biometrics.heartRate}>
                <defs>
                  <linearGradient id="liveHeart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#liveHeart)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-10 bg-slate-950 text-white space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Medical Diagnostics</h3>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Processing
            </div>
          </div>

          <div className="space-y-6">
            <div 
              onClick={() => navigate('/dashboard/ai-workbench')}
              className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6 cursor-pointer hover:bg-white/10 transition-colors group/queue"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Queue Status</div>
                  <div className="text-2xl font-display font-black text-white">4 Pending Analysis</div>
                </div>
                <button className="p-3 bg-white/10 rounded-xl group-hover/queue:bg-blue-600 transition-all">
                  <ArrowRight className="w-5 h-5 text-blue-400 group-hover/queue:text-white" />
                </button>
              </div>
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-2xl border-4 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
                <div className="text-2xl font-display font-black text-blue-400">99.2%</div>
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Consistency</div>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
                <div className="text-2xl font-display font-black text-indigo-400">1.2s</div>
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Avg Response</div>
              </div>
            </div>

            <button 
              onClick={() => {
                toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                  loading: 'Running health system check...',
                  success: 'System integrity verified: 100%',
                  error: 'Calibration error detected',
                });
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20"
            >
              System Health Check
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
