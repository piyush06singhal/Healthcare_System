import { 
  Activity, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Shield, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Sparkles, 
  Brain,
  Heart,
  Droplets,
  Thermometer,
  Wind,
  MessageSquare,
  Search,
  Filter,
  Download,
  Share2,
  MoreVertical,
  Zap,
  Pill,
  Target,
  Users,
  Bell,
  Video,
  Calculator,
  Layout,
  Phone,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import HealthCorrelationViz from '../components/HealthCorrelationViz';

const biometricData = [
  { time: '00:00', heartRate: 68, bloodOxygen: 98, sleep: 0 },
  { time: '04:00', heartRate: 62, bloodOxygen: 99, sleep: 100 },
  { time: '08:00', heartRate: 75, bloodOxygen: 97, sleep: 20 },
  { time: '12:00', heartRate: 82, bloodOxygen: 98, sleep: 0 },
  { time: '16:00', heartRate: 78, bloodOxygen: 98, sleep: 0 },
  { time: '20:00', heartRate: 72, bloodOxygen: 99, sleep: 0 },
  { time: '23:59', heartRate: 65, bloodOxygen: 98, sleep: 80 },
];

const activityData = [
  { day: 'Mon', steps: 8400, goal: 10000 },
  { day: 'Tue', steps: 12500, goal: 10000 },
  { day: 'Wed', steps: 9100, goal: 10000 },
  { day: 'Thu', steps: 11200, goal: 10000 },
  { day: 'Fri', steps: 7800, goal: 10000 },
  { day: 'Sat', steps: 15400, goal: 10000 },
  { day: 'Sun', steps: 6200, goal: 10000 },
];

const healthInsights = [
  {
    title: "Heart Rate Variability",
    desc: "Your HRV is 15% higher than last week, indicating improved recovery.",
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    color: "bg-rose-50",
    trend: "up"
  },
  {
    title: "Sleep Quality",
    desc: "Deep sleep cycles are consistent. Aim for 30 more minutes of rest.",
    icon: <Sparkles className="w-5 h-5 text-purple-500" />,
    color: "bg-purple-50",
    trend: "stable"
  },
  {
    title: "Activity Level",
    desc: "You've hit your step goal 5 days this week. Keep up the momentum!",
    icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
    color: "bg-emerald-50",
    trend: "up"
  }
];

const medications = [
  { name: 'Lisinopril', dose: '10mg', time: '08:00 AM', status: 'Taken', color: 'blue' },
  { name: 'Metformin', dose: '500mg', time: '01:00 PM', status: 'Upcoming', color: 'purple' },
  { name: 'Atorvastatin', dose: '20mg', time: '09:00 PM', status: 'Pending', color: 'emerald' },
];

const healthGoals = [
  { name: 'Weight Loss', current: 82, target: 75, unit: 'kg', progress: 65 },
  { name: 'Daily Steps', current: 9371, target: 10000, unit: 'steps', progress: 93 },
  { name: 'Water Intake', current: 1.8, target: 2.5, unit: 'L', progress: 72 },
];

const weightTrendData = [
  { month: 'Jan', weight: 85.5 },
  { month: 'Feb', weight: 84.8 },
  { month: 'Mar', weight: 84.2 },
  { month: 'Apr', weight: 83.5 },
  { month: 'May', weight: 82.8 },
  { month: 'Jun', weight: 82.0 },
];

const healthDistribution = [
  { name: 'Cardio', value: 40, color: '#2563eb' },
  { name: 'Strength', value: 30, color: '#7c3aed' },
  { name: 'Flexibility', value: 20, color: '#10b981' },
  { name: 'Rest', value: 10, color: '#f59e0b' },
];

const quickActions = [
  { name: 'Book Appointment', icon: <Calendar className="w-5 h-5" />, path: '/dashboard/appointments', color: 'bg-blue-600' },
  { name: 'AI Medical Insights', icon: <Search className="w-5 h-5" />, path: '/dashboard/insights', color: 'bg-indigo-600' },
  { name: 'AI Video Gen', icon: <Zap className="w-5 h-5" />, path: '/dashboard/video-gen', color: 'bg-rose-600' },
  { name: 'AI Symptom Checker', icon: <Brain className="w-5 h-5" />, path: '/dashboard/ai-chat', color: 'bg-purple-600' },
  { name: 'View Records', icon: <FileText className="w-5 h-5" />, path: '/dashboard/records', color: 'bg-emerald-600' },
  { name: 'Health Calculators', icon: <Sparkles className="w-5 h-5" />, path: '/dashboard/calculators', color: 'bg-amber-600' },
];

export default function PatientDashboard() {
  const { user, activeProfile } = useSelector((state: RootState) => state.auth);
  const { biometrics, treatments, aiSummary, prescriptions } = useSelector((state: RootState) => state.health);
  const [activeTab, setActiveTab] = useState('overview');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch real appointments
      const { data: aptData, error: aptError } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:users!doctor_id(name, specialty)
        `)
        .eq('patient_id', user?.id)
        .order('appointment_date', { ascending: true })
        .limit(3);

      if (aptError) throw aptError;
      setAppointments(aptData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

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

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const healthTips = [
    { 
      title: "Stay Hydrated", 
      desc: "Drinking enough water is essential for maintaining focus and mental clarity throughout your day.",
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400"
    },
    { 
      title: "Sleep Quality", 
      desc: "Aim for 7-9 hours of quality sleep to allow your body to repair and your mind to consolidate memories.",
      icon: <Clock className="w-4 h-4 text-blue-400" />,
      image: "https://images.unsplash.com/photo-1511295742364-9119143661c1?auto=format&fit=crop&q=80&w=400"
    },
    { 
      title: "Mindful Eating", 
      desc: "Pay attention to your hunger cues and savor each bite to improve digestion and prevent overeating.",
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const suggestedActions = [
    { id: 'video-calls', label: 'Add Video Calls', icon: <Phone className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50', action: () => navigate('/dashboard/video-consultation') },
    { id: 'doctor-profiles', label: 'Enhance Doctor Profiles', icon: <Users className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-50', action: () => navigate('/doctors') },
    { id: 'find-near-me', label: 'Add "Find Near Me"', icon: <MapPin className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => navigate('/doctors') },
    { id: 'availability', label: 'Implement Doctor Availability Calendar', icon: <Calendar className="w-4 h-4" />, color: 'text-rose-600', bg: 'bg-rose-50', action: () => navigate('/doctors') },
    { id: 'search-filter', label: 'Improve Search Filtering', icon: <Search className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50', action: () => navigate('/doctors') },
    { id: 'prescription', label: 'Add Prescription', icon: <FileText className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50', action: () => setIsPrescriptionModalOpen(true) },
    { id: 'video', label: 'Generate AI Video', icon: <Video className="w-4 h-4" />, color: 'text-rose-600', bg: 'bg-rose-50', action: () => navigate('/dashboard/video-gen') },
    { id: 'calculators', label: 'Health Calculators', icon: <Calculator className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50', action: () => navigate('/dashboard/calculators') },
    { id: 'chat', label: 'AI Symptom Checker', icon: <Activity className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => navigate('/dashboard/ai-chat') },
    { id: 'viz', label: 'View Analytics', icon: <TrendingUp className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50', action: () => document.getElementById('biometric-telemetry')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'reminder', label: 'Set Med Reminder', icon: <Bell className="w-4 h-4" />, color: 'text-cyan-600', bg: 'bg-cyan-50', action: () => setIsReminderModalOpen(true) },
  ];

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Simulate sync when profile changes
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 2000);
    return () => clearTimeout(timer);
  }, [activeProfile?.id]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Sync Overlay */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center pointer-events-none"
          >
            <div className="text-center space-y-8">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                  filter: ["blur(0px)", "blur(10px)", "blur(0px)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(37,99,235,0.5)] border border-white/20"
              >
                <Activity className="w-16 h-16 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Synchronizing Profile</h2>
                <p className="text-blue-400 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Accessing {activeProfile?.name || 'Primary'} Records</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Parallax Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          style={{ y: y1, rotate }}
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2, rotate: -rotate }}
          className="absolute bottom-40 -right-20 w-[500px] h-[500px] bg-purple-100/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-12 pb-16"
      >
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-4">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <Zap className="w-3 h-3" />
              Patient Portal
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Live Monitoring Active
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.name || 'Piyush'}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Your health score is <span className="text-blue-600 font-black">88/100</span> today.
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Heart Rate', value: biometrics.heartRate[biometrics.heartRate.length - 1].value, unit: 'bpm', icon: <Heart className="w-6 h-6" />, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+2%', status: 'Normal' },
          { label: 'Blood Oxygen', value: biometrics.oxygen, unit: '%', icon: <Droplets className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Stable', status: 'Optimal' },
          { label: 'BP Status', value: biometrics.bloodPressure, unit: 'mmHg', icon: <Activity className="w-6 h-6" />, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Regulated', status: 'Optimal' },
          { label: 'Glucose Level', value: biometrics.bloodSugar, unit: 'mg/dL', icon: <Pill className="w-6 h-6" />, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Synced', status: 'Controlled' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform`}>
                {stat.icon}
              </div>
              <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                {stat.trend}
              </div>
            </div>
            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
                <span className="text-sm font-bold text-slate-400">{stat.unit}</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">{stat.status}</span>
              </div>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} opacity-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-12">
          {/* Digital Health Wallet Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div>
                  <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 inline-flex items-center gap-2 mb-4">
                    <Shield className="w-3 h-3" />
                    Biometric Identity
                  </div>
                  <h2 className="text-4xl font-black tracking-tight leading-tight">Digital Health Wallet</h2>
                  <p className="text-slate-400 font-medium max-w-md mt-4">
                    Instant access to your specialized clinical credentials, insurance protocols, and emergency medical ID.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsWalletOpen(true)}
                    className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10"
                  >
                    View ID Card
                  </button>
                  <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Sync Insurance
                  </button>
                </div>
              </div>

              {/* Holographic Card Preview */}
              <motion.div 
                whileHover={{ rotateY: 15, rotateX: -10 }}
                className="w-full max-w-[400px] aspect-[1.6/1] bg-gradient-to-br from-blue-500/20 via-indigo-600/20 to-purple-700/20 backdrop-blur-3xl rounded-3xl border border-white/20 p-8 relative overflow-hidden shadow-2xl shadow-blue-500/30 group/card"
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                      <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Mediflow AI</div>
                      <div className="text-xs font-black text-white italic">Clinical Pass</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Patient Primary Identity</div>
                    <div className="text-xl font-bold tracking-widest mb-1">{user?.name?.toUpperCase() || 'PIYUSH SINGHAL'}</div>
                    <div className="text-[10px] font-mono text-blue-400 tracking-wider">ID: MF-882-901-VX</div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none group-hover/card:translate-x-full transition-transform duration-1000" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />
              </motion.div>
            </div>
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl opacity-50" />
          </motion.div>
          {/* Suggested Actions Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden relative group/suggest"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  System Recommendations
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Medical Optimized
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {suggestedActions.slice(0, 6).map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`flex items-center gap-4 p-5 ${action.bg} ${action.color} rounded-[2.5rem] font-black text-[11px] uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-sm border border-transparent hover:border-current hover:shadow-lg`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-md flex items-center justify-center shadow-sm">
                      {action.icon}
                    </div>
                    <span className="flex-1 text-left leading-tight">{action.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none group-hover/suggest:scale-110 transition-transform duration-1000" />
          </motion.div>

          {/* Biometric Chart */}
          <motion.div 
            variants={itemVariants}
            id="biometric-telemetry"
            className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Biometric Telemetry</h2>
                <p className="text-sm font-medium text-slate-500">Real-time health monitoring over the last 24 hours</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {['24h', '7d', '30d'].map((t) => (
                  <button 
                    key={t}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      t === '24h' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[400px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={biometricData}>
                    <defs>
                      <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '20px', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        padding: '15px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#2563eb" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorHeart)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Activity & Insights */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Activity Chart */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100"
            >
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                Activity Progress
              </h3>
              <div className="h-[250px] w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                      />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="steps" radius={[10, 10, 0, 0]}>
                        {activityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.steps >= entry.goal ? '#10b981' : '#e2e8f0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs font-bold text-slate-500">Weekly Average: <span className="text-slate-900 font-black">9,371 steps</span></div>
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Goal Reached: 4/7</div>
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div 
              variants={itemVariants}
              className="bg-slate-900 p-12 rounded-[3.5rem] shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
                <Sparkles className="w-6 h-6 text-blue-400" />
                Health Insights
              </h3>
              <div className="space-y-6 relative z-10">
                {healthInsights.map((insight, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className={`w-12 h-12 rounded-2xl ${insight.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      {insight.icon}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-widest mb-1">{insight.title}</div>
                      <p className="text-slate-400 text-xs font-medium leading-relaxed">{insight.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                View All Insights
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>

          {/* Health Goals */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100"
          >
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-600" />
              Health Goals
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {healthGoals.map((goal, i) => (
                <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{goal.name}</div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-black text-slate-900">{goal.current}</span>
                    <span className="text-[10px] font-bold text-slate-400">/ {goal.target} {goal.unit}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full bg-blue-600"
                    />
                  </div>
                  <div className="mt-2 text-right text-[10px] font-black text-blue-600">{goal.progress}%</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Health Trends Section */}
          <div className="grid md:grid-cols-2 gap-12">
            <HealthCorrelationViz />
            
            {/* Health Distribution Pie Chart */}
            <motion.div 
              variants={itemVariants}
              id="health-distribution-chart"
              className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100"
            >
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Activity className="w-6 h-6 text-purple-600" />
                Activity Distribution
              </h3>
              <div className="h-[250px] w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {healthDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '20px', 
                          border: 'none', 
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                          padding: '15px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {healthDistribution.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Appointments */}
        <div className="space-y-12">
          {/* Health Tip of the Day */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-slate-900 to-slate-800 p-12 rounded-[3.5rem] shadow-xl text-white relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentTipIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest mb-6">
                  {healthTips[currentTipIndex].icon}
                  Health Tip
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{healthTips[currentTipIndex].title}</h3>
                <p className="text-slate-300 text-xs font-medium leading-relaxed mb-8">
                  {healthTips[currentTipIndex].desc}
                </p>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all shadow-lg shadow-blue-600/20">
                  Learn More
                </button>
              </motion.div>
            </AnimatePresence>
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentTipIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0 }}
                  src={healthTips[currentTipIndex].image} 
                  className="w-full h-full object-cover" 
                  alt="Health Tip"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Medication Tracker */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100"
          >
            <div className="flex items-center justify-between mb-8 cursor-pointer" onClick={() => navigate('/dashboard/prescriptions')}>
              <h3 className="text-xl font-black text-slate-900">Active Meds</h3>
              <Pill className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="space-y-4">
              {prescriptions.slice(0, 3).map((med, i) => (
                <div key={med.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => navigate('/dashboard/prescriptions')}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{med.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.dosage} • {med.frequency}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/dashboard/prescriptions')}
              className="w-full mt-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all font-bold"
            >
              Log Daily Dosage
            </button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100"
          >
            <h3 className="text-xl font-black text-slate-900 mb-8">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
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

          {/* Upcoming Appointments & Reminders */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900">Appointments</h3>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
                  {appointments.length} Active
                </div>
                <button 
                  onClick={() => navigate('/dashboard/appointments')}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {appointments.length > 0 ? (
                appointments.map((apt, i) => (
                  <div 
                    key={apt.id} 
                    onClick={() => navigate('/dashboard/appointments')}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                      apt.status === 'accepted' ? 'bg-blue-50/50 border-blue-200 shadow-lg shadow-blue-600/5' : 'bg-slate-50 border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    {apt.status === 'accepted' && (
                      <div className="absolute top-0 right-0 p-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 animate-pulse">
                          <Bell className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm font-black text-slate-900">{apt.doctor?.name}</div>
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{apt.doctor?.specialty}</div>
                      </div>
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600">
                          {new Date(apt.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600">
                          {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          apt.status === 'accepted' ? 'bg-emerald-500' : 
                          apt.status === 'pending' ? 'bg-orange-500' : 'bg-slate-400'
                        }`} />
                        {apt.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No upcoming appointments</p>
                  <button 
                    onClick={() => navigate('/dashboard/appointments')}
                    className="mt-4 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                  >
                    Book Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Security Status */}
          <motion.div 
            variants={itemVariants}
            className="bg-emerald-900 p-10 rounded-[3rem] shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Data Protection</div>
                <div className="text-lg font-black text-white">HIPAA Secure</div>
              </div>
            </div>
            <p className="text-emerald-100/60 text-xs font-medium leading-relaxed relative z-10">
              Your medical data is encrypted with military-grade AES-256 standards and is fully HIPAA compliant.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Prescription History Modal */}
      <AnimatePresence>
        {isPrescriptionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPrescriptionModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Prescription History</h2>
                <button onClick={() => setIsPrescriptionModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="space-y-6">
                {[
                  { name: 'Amoxicillin', date: 'Jan 12, 2026', doctor: 'Dr. Emily Brown', status: 'Completed' },
                  { name: 'Ibuprofen', date: 'Feb 05, 2026', doctor: 'Dr. Michael Chen', status: 'Completed' },
                  { name: 'Lisinopril', date: 'Mar 01, 2026', doctor: 'Dr. Sarah Johnson', status: 'Active' },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black text-slate-900">{item.name}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.date} • {item.doctor}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'Active' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
                Upload New Prescription
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Med Reminder Modal */}
      <AnimatePresence>
        {isReminderModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReminderModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-12"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add Reminder</h2>
                <button onClick={() => setIsReminderModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medication Name</label>
                  <input type="text" placeholder="e.g. Vitamin D3" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                    <input type="time" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>As needed</option>
                    </select>
                  </div>
                </div>
              </div>
              <button className="w-full mt-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                Set Reminder
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Health Goals Modal */}
      <AnimatePresence>
        {isGoalsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoalsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Health Goals</h2>
                <button onClick={() => setIsGoalsModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="space-y-8">
                {healthGoals.map((goal, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-lg font-black text-slate-900">{goal.name}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target: {goal.target} {goal.unit}</div>
                      </div>
                      <div className="text-2xl font-black text-blue-600">{goal.progress}%</div>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">
                Add New Goal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
    </div>
  );
}
