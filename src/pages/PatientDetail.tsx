import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets, 
  FileText, 
  History as HistoryIcon, 
  Calendar,
  Download,
  Share2,
  Plus,
  TrendingUp,
  AlertCircle,
  XCircle,
  Search,
  Clock,
  ChevronRight,
  User,
  Shield,
  Lock,
  Eye,
  Key,
  Sparkles,
  Upload,
  Video,
  MessageSquare,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const healthData = [
  { date: '2026-03-25', heartRate: 72, bp: 120, glucose: 95 },
  { date: '2026-03-26', heartRate: 75, bp: 118, glucose: 92 },
  { date: '2026-03-27', heartRate: 70, bp: 122, glucose: 98 },
  { date: '2026-03-28', heartRate: 78, bp: 125, glucose: 105 },
  { date: '2026-03-29', heartRate: 74, bp: 119, glucose: 97 },
  { date: '2026-03-30', heartRate: 71, bp: 121, glucose: 94 },
  { date: '2026-03-31', heartRate: 73, bp: 120, glucose: 96 },
];

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [activeTab, setActiveTab] = useState('clinical');
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [examData, setExamData] = useState({
    symptoms: '',
    physicalExam: '',
    diagnosis: '',
    plan: '',
    vitals: {
      heartRate: '72',
      bp: '120/80',
      glucose: '96',
      temp: '98.6'
    }
  });

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const generateAiSummary = async () => {
    if (!patient) return;
    setIsAiLoading(true);
    try {
      const prompt = `As a medical assistant, provide a concise clinical summary for patient ${patient.name}. 
      Current condition: Type 2 Diabetes. 
      Recent vitals: HR 72, BP 120/80, Glucose 96. 
      Clinical history includes blood panel analysis and metformin prescriptions. 
      Focus on key risks and recommended focus areas for the next consultation. 
      Keep it professional and clinical.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiSummary(response.text || 'No summary generated.');
    } catch (error) {
      console.error('AI Summary Error:', error);
      setAiSummary('Failed to generate clinical summary. Please review records manually.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('Examination record saved successfully');
      setIsExamModalOpen(false);
      // Reset form
      setExamData({
        symptoms: '',
        physicalExam: '',
        diagnosis: '',
        plan: '',
        vitals: { heartRate: '72', bp: '120/80', glucose: '96', temp: '98.6' }
      });
    } catch (error) {
      toast.error('Failed to save examination');
    }
  };

  const handleShareRecord = () => {
    const secureToken = Math.random().toString(36).substring(2, 15);
    const shareUrl = `${window.location.origin}/secure-access/${secureToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Secure Access Link Generated', {
      description: 'Link copied to clipboard. Valid for 24 hours.',
    });
  };

  const filteredHistory = [
    { date: 'Mar 24, 2026', type: 'Consultation', title: 'Routine Checkup', doctor: 'Dr. Sarah Johnson' },
    { date: 'Mar 15, 2026', type: 'Lab Result', title: 'Blood Panel Analysis', doctor: 'Lab Corp' },
    { date: 'Feb 28, 2026', type: 'Prescription', title: 'Metformin Refill', doctor: 'Dr. Sarah Johnson' },
  ].filter(item => 
    item.title.toLowerCase().includes(historySearch.toLowerCase()) || 
    item.type.toLowerCase().includes(historySearch.toLowerCase())
  );

  const accessLogs = [
    { user: 'Dr. Sarah Johnson', action: 'Viewed Records', time: '2 mins ago', ip: '192.168.1.45' },
    { user: 'Pharmacy System', action: 'Accessed Prescription', time: '1 hour ago', ip: '10.0.0.12' },
    { user: 'Patient (Self)', action: 'Downloaded Lab Results', time: '5 hours ago', ip: '172.16.0.5' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">
          Retrieving Clinical Records...
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-slate-900" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                Patient Profile
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Active Monitoring
              </div>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{patient?.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleShareRecord}
            className="p-4 bg-white rounded-2xl shadow-lg hover:bg-slate-50 transition-all text-slate-600 group relative"
          >
            <Share2 className="w-5 h-5" />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Secure Share
            </div>
          </button>
          <button className="p-4 bg-white rounded-2xl shadow-lg hover:bg-slate-50 transition-all text-slate-600">
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsExamModalOpen(true)}
            className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-3"
          >
            <Plus className="w-4 h-4" />
            Start Examination
          </button>
        </div>
      </div>

      {/* AI Summary Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Patient Health Overview</h3>
                <p className="text-sm text-blue-100 font-medium">AI-generated summary based on available medical records</p>
              </div>
            </div>
            <button 
              onClick={generateAiSummary}
              disabled={isAiLoading}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              {isAiLoading ? 'Analyzing...' : 'Refresh Summary'}
            </button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            {aiSummary ? (
              <p className="text-sm leading-relaxed font-medium text-blue-50">
                {aiSummary}
              </p>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs font-black uppercase tracking-widest text-blue-200">Click refresh to generate health insights</p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-100 pb-2">
        {[
          { id: 'clinical', label: 'Clinical Records', icon: Activity },
          { id: 'timeline', label: 'Interaction Timeline', icon: HistoryIcon },
          { id: 'security', label: 'Security & Access', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'clinical' ? (
          <motion.div 
            key="clinical"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid lg:grid-cols-3 gap-10"
          >
            {/* Left Column: Vitals & Charts */}
            <div className="lg:col-span-2 space-y-10">
              {/* Vital Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: 'Heart Rate', value: '72', unit: 'BPM', icon: <Heart className="w-6 h-6" />, color: 'rose', trend: '-2%' },
                  { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: <Activity className="w-6 h-6" />, color: 'blue', trend: '+1%' },
                  { label: 'Glucose', value: '96', unit: 'mg/dL', icon: <Droplets className="w-6 h-6" />, color: 'emerald', trend: 'Stable' },
                ].map((vital, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-${vital.color}-50 text-${vital.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      {vital.icon}
                    </div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{vital.label}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">{vital.value}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{vital.unit}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <TrendingUp className={`w-3 h-3 ${vital.trend.startsWith('-') ? 'rotate-180 text-rose-500' : 'text-emerald-500'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${vital.trend.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {vital.trend}
                      </span>
                    </div>
                    <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-${vital.color}-500/5 rounded-full blur-2xl`} />
                  </motion.div>
                ))}
              </div>

              {/* Main Chart */}
              <motion.div 
                variants={itemVariants}
                className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Trends</h3>
                    <p className="text-sm text-slate-400 font-medium">7-day physiological monitoring</p>
                  </div>
                  <div className="flex bg-slate-50 p-1 rounded-xl">
                    {['Heart Rate', 'BP', 'Glucose'].map((tab) => (
                      <button key={tab} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'Heart Rate' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healthData}>
                      <defs>
                        <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                        dy={10}
                        tickFormatter={(val) => val.split('-')[2]}
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
                        fill="url(#colorHr)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Info & History */}
            <div className="space-y-10">
              {/* Patient Info */}
              <motion.div 
                variants={itemVariants}
                className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden"
              >
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <img 
                      src={`https://picsum.photos/seed/${id}/200/200`} 
                      className="w-20 h-20 rounded-3xl object-cover border-4 border-white/10" 
                      alt="Patient" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-xl font-black tracking-tight">{patient?.name}</h3>
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">ID: {id?.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Age</div>
                      <div className="text-sm font-black">34 Years</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gender</div>
                      <div className="text-sm font-black">Male</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Blood Type</div>
                      <div className="text-sm font-black text-rose-400">O Positive</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weight</div>
                      <div className="text-sm font-black">78 kg</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-bold">{patient?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-bold">Privacy Consent: Active</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl" />
              </motion.div>

              {/* Upload Section */}
              <motion.div 
                variants={itemVariants}
                className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Upload Documents
                </h3>
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center hover:border-blue-400 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-50 transition-colors">
                    <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drop files or click to upload</p>
                  <p className="text-[8px] text-slate-400 mt-2">PDF, JPG, PNG (Max 10MB)</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : activeTab === 'timeline' ? (
          <motion.div 
            key="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Interaction Timeline</h3>
                <p className="text-sm text-slate-400 font-medium">Chronological record of patient-provider touchpoints</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Filter By Date</button>
                <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Export PDF</button>
              </div>
            </div>

            <div className="relative space-y-12 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {[
                { date: 'Today, 10:00 AM', type: 'Consultation', title: 'Video Consultation Session', doctor: 'Dr. Sarah Johnson', status: 'Completed', icon: Video },
                { date: 'Yesterday, 02:30 PM', type: 'Prescription', title: 'Metformin 500mg Renewal', doctor: 'Dr. Sarah Johnson', status: 'Authorized', icon: FileText },
                { date: 'Mar 28, 2026', type: 'Lab Result', title: 'HbA1c Blood Panel', doctor: 'Central Lab', status: 'Reviewed', icon: Activity },
                { date: 'Mar 25, 2026', type: 'Message', title: 'Follow-up regarding diet plan', doctor: 'Dr. Sarah Johnson', status: 'Read', icon: MessageSquare },
              ].map((item, i) => (
                <div key={i} className="relative pl-16 group">
                  <div className="absolute left-0 top-0 w-11 h-11 bg-white border-4 border-slate-50 rounded-2xl flex items-center justify-center z-10 group-hover:border-blue-50 transition-all shadow-sm">
                    <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-200/50 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{item.type}</div>
                        <h4 className="text-lg font-black text-slate-900">{item.title}</h4>
                      </div>
                      <div className="px-4 py-1.5 bg-white rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                        {item.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {item.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {item.doctor}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="grid lg:grid-cols-2 gap-10">
              {/* Access Logs */}
              <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Access Audit Log</h3>
                    <p className="text-sm text-slate-400 font-medium">Real-time record access monitoring</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-6">
                  {accessLogs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 tracking-tight">{log.user}</div>
                          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{log.action}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">{log.time}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{log.ip}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Controls */}
              <div className="space-y-6">
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-900/20">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">Record Encryption</h3>
                      <p className="text-xs font-medium text-slate-400">AES-256 Enterprise Grade Security</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="text-xs font-black uppercase tracking-widest">End-to-End Encryption</div>
                      <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest">Active</div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="text-xs font-black uppercase tracking-widest">Blockchain Verification</div>
                      <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[8px] font-black uppercase tracking-widest">Verified</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Access Management</h3>
                  <div className="space-y-4">
                    <button className="w-full p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600">
                          <Key className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-black text-slate-900 tracking-tight">Revoke All Access</div>
                          <div className="text-[10px] text-slate-400 font-medium">Immediately invalidate all active links</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
                    </button>
                    <button className="w-full p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-black text-slate-900 tracking-tight">HIPAA Compliance</div>
                          <div className="text-[10px] text-slate-400 font-medium">Generate compliance report</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Examination Modal */}
      <AnimatePresence>
        {isExamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExamModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Examination</h2>
                  <p className="text-sm text-slate-400 font-medium">Recording new clinical findings for {patient?.name}</p>
                </div>
                <button 
                  onClick={() => setIsExamModalOpen(false)}
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-slate-50 transition-all"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddExam} className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid md:grid-cols-4 gap-6 mb-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Heart Rate</label>
                    <input 
                      type="text"
                      value={examData.vitals.heartRate}
                      onChange={(e) => setExamData({...examData, vitals: {...examData.vitals, heartRate: e.target.value}})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Pressure</label>
                    <input 
                      type="text"
                      value={examData.vitals.bp}
                      onChange={(e) => setExamData({...examData, vitals: {...examData.vitals, bp: e.target.value}})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Glucose</label>
                    <input 
                      type="text"
                      value={examData.vitals.glucose}
                      onChange={(e) => setExamData({...examData, vitals: {...examData.vitals, glucose: e.target.value}})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temperature</label>
                    <input 
                      type="text"
                      value={examData.vitals.temp}
                      onChange={(e) => setExamData({...examData, vitals: {...examData.vitals, temp: e.target.value}})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chief Complaint & Symptoms</label>
                    <textarea 
                      rows={3}
                      value={examData.symptoms}
                      onChange={(e) => setExamData({...examData, symptoms: e.target.value})}
                      placeholder="Describe the patient's current symptoms..."
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Examination Findings</label>
                    <textarea 
                      rows={3}
                      value={examData.physicalExam}
                      onChange={(e) => setExamData({...examData, physicalExam: e.target.value})}
                      placeholder="Record physical exam observations..."
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Diagnosis</label>
                      <textarea 
                        rows={3}
                        value={examData.diagnosis}
                        onChange={(e) => setExamData({...examData, diagnosis: e.target.value})}
                        placeholder="Primary and differential diagnosis..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Treatment Plan</label>
                      <textarea 
                        rows={3}
                        value={examData.plan}
                        onChange={(e) => setExamData({...examData, plan: e.target.value})}
                        placeholder="Next steps, medications, and follow-up..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex gap-4">
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
                  >
                    Save Examination Record
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsExamModalOpen(false)}
                    className="px-10 py-5 bg-slate-100 text-slate-500 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
