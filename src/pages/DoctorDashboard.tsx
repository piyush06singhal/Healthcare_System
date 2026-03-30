import { 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  FileText,
  Activity,
  Search,
  MoreVertical,
  Clock,
  ChevronRight,
  Zap,
  Shield,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  Video,
  Plus,
  ChevronLeft,
  Settings,
  Save,
  Trash2,
  Bell,
  X
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
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addDays,
  parseISO
} from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const throughputData = [
  { name: 'Mon', count: 12, urgent: 4 },
  { name: 'Tue', count: 15, urgent: 6 },
  { name: 'Wed', count: 8, urgent: 2 },
  { name: 'Thu', count: 18, urgent: 8 },
  { name: 'Fri', count: 14, urgent: 5 },
  { name: 'Sat', count: 5, urgent: 1 },
  { name: 'Sun', count: 2, urgent: 0 },
];

const patientPriority = [
  { id: 'P-1024', name: 'Alice Johnson', age: 42, condition: 'Post-Op Recovery', priority: 'High', time: '10m ago', status: 'Waiting' },
  { id: 'P-1025', name: 'Robert Smith', age: 65, condition: 'Hypertension', priority: 'Medium', time: '25m ago', status: 'In-Room' },
  { id: 'P-1026', name: 'Elena Rodriguez', age: 28, condition: 'Acute Migraine', priority: 'High', time: '5m ago', status: 'Urgent' },
  { id: 'P-1027', name: 'James Wilson', age: 54, condition: 'Routine Checkup', priority: 'Low', time: '45m ago', status: 'Scheduled' },
];

const clinicalInsights = [
  { title: 'Epidemic Alert', desc: '15% increase in seasonal influenza cases in your region.', type: 'warning', icon: <AlertCircle className="w-4 h-4" /> },
  { title: 'Patient Outcome', desc: 'Recovery rate for post-op patients improved by 8% this month.', type: 'success', icon: <TrendingUp className="w-4 h-4" /> },
  { title: 'Research Update', desc: 'New guidelines for hypertension management released.', type: 'info', icon: <FileText className="w-4 h-4" /> },
];

const priorityDistribution = [
  { name: 'High', value: 35, color: '#f43f5e' },
  { name: 'Medium', value: 45, color: '#3b82f6' },
  { name: 'Low', value: 20, color: '#10b981' },
];

export default function DoctorDashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState('all');
  const [statusUpdateAppointment, setStatusUpdateAppointment] = useState<{ id: string, patientName: string, status: string } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const { user } = useSelector((state: RootState) => state.auth);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAvailability();
      fetchAppointments();
    }
  }, [user?.id]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users!patient_id(id, name, email)
        `)
        .eq('doctor_id', user?.id)
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Appointment status updated to ${status}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', user?.id);
      
      if (error) throw error;
      
      const availabilityMap: Record<string, string[]> = {};
      data?.forEach(item => {
        availabilityMap[item.date] = item.slots;
      });
      setAvailability(availabilityMap);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleSaveSchedule = async () => {
    if (!user?.id) return;
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slots = availability[dateStr] || [];
      
      const { error } = await supabase
        .from('doctor_availability')
        .upsert({
          doctor_id: user.id,
          date: dateStr,
          slots: slots
        }, { onConflict: 'doctor_id,date' });

      if (error) throw error;

      toast.success('Schedule saved successfully', {
        description: `Your availability for ${format(selectedDate, 'MMMM d')} has been updated.`,
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    }
  };

  const stats = [
    { label: 'Active Patients', value: '1,284', icon: <Users className="w-5 h-5" />, trend: '+12%', status: 'active', color: 'blue' },
    { label: 'Today\'s Appointments', value: '42', icon: <Calendar className="w-5 h-5" />, trend: '+5%', status: 'active', color: 'purple' },
    { label: 'Critical Alerts', value: '08', icon: <AlertCircle className="w-5 h-5" />, trend: '-2%', status: 'critical', color: 'rose' },
    { label: 'Consultations Done', value: '34', icon: <CheckCircle className="w-5 h-5" />, trend: '+8%', status: 'nominal', color: 'emerald' },
  ];

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const toggleSlot = (dateStr: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[dateStr] || [];
      if (daySlots.includes(slot)) {
        return { ...prev, [dateStr]: daySlots.filter(s => s !== slot) };
      } else {
        return { ...prev, [dateStr]: [...daySlots, slot].sort() };
      }
    });
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
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

  const filteredQueue = useMemo(() => {
    return appointments.filter(apt => {
      const name = apt.patient?.name || '';
      const matchesSearch = name.toLowerCase().includes(queueSearch.toLowerCase()) || apt.id.toLowerCase().includes(queueSearch.toLowerCase());
      const matchesFilter = queueFilter === 'all' || apt.status.toLowerCase() === queueFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [appointments, queueSearch, queueFilter]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Parallax Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          style={{ y: y1, rotate }}
          className="absolute top-40 -right-20 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2, rotate: -rotate }}
          className="absolute bottom-20 -left-20 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-emerald-50/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-10 pb-10"
      >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <motion.div variants={itemVariants} className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200" 
                className="w-full h-full object-cover"
                alt="Dr. Mitchell"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
                Clinical Command Center
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                System Online
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dr. Mitchell</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1 text-lg">
              Your clinical overview for <span className="text-slate-900 font-bold">Monday, Oct 12, 2026</span>
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Daily Rounds
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Consultation
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
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  stat.status === 'critical' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <Activity className="w-3 h-3" />
                  {stat.status}
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${stat.trend.startsWith('-') && 'rotate-180'}`} />
                  {stat.trend}
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">vs last shift</span>
              </div>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Throughput Chart */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Throughput</h3>
                <p className="text-sm text-slate-400 font-medium">Patient volume & urgency distribution</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {['7D', '30D', '90D'].map((period) => (
                  <button key={period} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    period === '7D' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}>
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
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
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '20px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '15px'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
                  <Bar dataKey="urgent" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Priority Distribution Chart */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Priority Distribution</h3>
                <p className="text-sm text-slate-400 font-medium">Current patient load by triage priority</p>
              </div>
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '15px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {priorityDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Patient Priority Queue */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
          >
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Priority Queue</h3>
                <p className="text-sm text-slate-400 font-medium">Real-time patient triage & status</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {['all', 'High', 'Medium', 'Low'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setQueueFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        queueFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={queueSearch}
                    onChange={(e) => setQueueSearch(e.target.value)}
                    placeholder="Search queue..." 
                    className="pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64 text-slate-900"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Identity</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Condition</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredQueue.map((apt, i) => (
                    <motion.tr 
                      key={apt.id} 
                      className="group hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={`https://picsum.photos/seed/${apt.patient?.id}/100/100`} 
                            className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform" 
                            alt="Patient" 
                            referrerPolicy="no-referrer" 
                          />
                          <div>
                            <div className="text-sm font-black text-slate-900">{apt.patient?.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{apt.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-xs font-bold text-slate-600">{apt.reason}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(apt.appointment_date), 'MMM d, h:mm a')}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          apt.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          apt.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {apt.status === 'accepted' ? 'High' : 'Normal'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            apt.status === 'accepted' ? 'bg-emerald-500' :
                            apt.status === 'pending' ? 'bg-orange-500 animate-pulse' :
                            'bg-slate-300'
                          }`} />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{apt.status}</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          {apt.status === 'pending' && (
                            <button 
                              onClick={() => setStatusUpdateAppointment({ id: apt.id, patientName: apt.patient?.name, status: 'accepted' })}
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:text-white hover:bg-emerald-500 transition-all"
                              title="Accept Appointment"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedAppointment(apt)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Availability & Schedule Management */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
          >
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Availability & Schedule</h3>
                <p className="text-sm text-slate-400 font-medium">Manage your consultation slots and working hours</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <div className="text-xs font-black text-slate-900 uppercase tracking-widest px-4">
                  {format(currentMonth, 'MMMM yyyy')}
                </div>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-10 grid lg:grid-cols-2 gap-12">
              {/* Calendar Grid */}
              <div className="space-y-6">
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const hasSlots = availability[dateStr]?.length > 0;

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all border ${
                          !isCurrentMonth ? 'opacity-20' : 'opacity-100'
                        } ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' 
                            : 'bg-white text-slate-900 border-slate-100 hover:border-blue-200 hover:bg-blue-50/50'
                        }`}
                      >
                        <span className="text-sm font-black tracking-tight">{format(day, 'd')}</span>
                        {hasSlots && !isSelected && (
                          <div className="absolute bottom-2 w-1 h-1 bg-blue-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    Selected
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Available Slots
                  </div>
                </div>
              </div>

              {/* Slot Management */}
              <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                      {format(selectedDate, 'EEEE')}
                    </div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const dateStr = format(selectedDate, 'yyyy-MM-dd');
                        setAvailability(prev => ({ ...prev, [dateStr]: ['09:00', '10:00', '11:00', '12:00'] }));
                      }}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                    >
                      Morning
                    </button>
                    <button 
                      onClick={() => {
                        const dateStr = format(selectedDate, 'yyyy-MM-dd');
                        setAvailability(prev => ({ ...prev, [dateStr]: ['13:00', '14:00', '15:00', '16:00', '17:00'] }));
                      }}
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                    >
                      Afternoon
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {timeSlots.map((slot) => {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const isActive = availability[dateStr]?.includes(slot);

                    return (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(dateStr, slot)}
                        className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                          isActive 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleSaveSchedule}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
                  >
                    <Save className="w-4 h-4" />
                    Save Schedule
                  </button>
                  <button className="p-4 bg-white border border-slate-200 text-rose-600 rounded-2xl hover:bg-rose-50 hover:border-rose-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-10">
          {/* Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h3 className="text-xl font-black text-slate-900 mb-8">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Teleconsult', icon: <Video />, color: 'bg-blue-600', path: '/dashboard/video-gen' },
                { name: 'AI Insights', icon: <Search />, color: 'bg-indigo-600', path: '/dashboard/insights' },
                { name: 'Prescription', icon: <FileText />, color: 'bg-purple-600', path: '/dashboard/records' },
                { name: 'Lab Results', icon: <FlaskConical />, color: 'bg-emerald-600', path: '/dashboard/records' },
                { name: 'Referral', icon: <ArrowUpRight />, color: 'bg-amber-600', path: '/dashboard/doctors' },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => action.path && navigate(action.path)}
                  className="p-6 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-all group text-left"
                >
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

          {/* Clinical Insights */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3rem] bg-slate-900 p-10 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
              <Zap className="w-6 h-6 text-blue-400" />
              Clinical Insights
            </h3>
            <div className="space-y-6 relative z-10">
              {clinicalInsights.map((insight, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 bg-white/5 text-white group-hover:bg-white/10 transition-all`}>
                    {insight.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{insight.title}</div>
                    <p className="text-slate-400 text-[11px] font-medium leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              Full Intelligence Report
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* System Security */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[3rem] bg-emerald-900 p-10 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">System Security</div>
                <div className="text-lg font-black text-white">HIPAA Compliant</div>
              </div>
            </div>
            <p className="text-emerald-100/60 text-xs font-medium leading-relaxed relative z-10">
              All clinical data is end-to-end encrypted. Your session is monitored for unauthorized access.
            </p>
          </motion.div>
        </div>
      </div>
      {/* Confirmation Dialog for Appointment Status Update */}
      <AnimatePresence>
        {statusUpdateAppointment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusUpdateAppointment(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                  <Activity className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Update Appointment Status?</h3>
                  <p className="text-slate-500 font-medium">
                    Are you sure you want to update <span className="text-slate-900 font-bold">{statusUpdateAppointment.patientName}</span>'s appointment status to <span className="text-blue-600 font-bold">{statusUpdateAppointment.status}</span>?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => setStatusUpdateAppointment(null)}
                    className="py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (statusUpdateAppointment) {
                        updateAppointmentStatus(statusUpdateAppointment.id, statusUpdateAppointment.status);
                        setStatusUpdateAppointment(null);
                      }
                    }}
                    className="py-4 px-6 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppointment(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Details</h3>
                      <p className="text-sm text-slate-400 font-medium uppercase tracking-widest">ID: {selectedAppointment.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedAppointment(null)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient Information</div>
                      <div className="flex items-center gap-4">
                        <img 
                          src={`https://picsum.photos/seed/${selectedAppointment.patient?.id}/100/100`} 
                          className="w-12 h-12 rounded-xl object-cover" 
                          alt="Patient" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-sm font-black text-slate-900">{selectedAppointment.patient?.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Patient ID: {selectedAppointment.patient?.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Schedule</div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-600">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold">{format(new Date(selectedAppointment.appointment_date), 'EEEE, MMMM do, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold">{format(new Date(selectedAppointment.appointment_date), 'h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Clinical Reason</div>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed">
                        {selectedAppointment.reason}
                      </p>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Status</div>
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          selectedAppointment.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          selectedAppointment.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {selectedAppointment.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  {selectedAppointment.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, 'accepted');
                          setSelectedAppointment(null);
                        }}
                        className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
                      >
                        Accept Appointment
                      </button>
                      <button 
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, 'rejected');
                          setSelectedAppointment(null);
                        }}
                        className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedAppointment.status === 'accepted' && (
                    <button 
                      onClick={() => setSelectedAppointment(null)}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
                    >
                      Close Details
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
    </div>
  );
}
