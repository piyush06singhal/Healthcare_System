import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Plus, 
  MoreVertical,
  Shield,
  FlaskConical,
  Stethoscope,
  Activity,
  Filter,
  Lock,
  Sparkles,
  Share2,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function PatientRecords() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchRecords();
  }, [user?.id]);

  const fetchRecords = async () => {
    if (!user?.id) return;
    try {
        setLoading(true);
        const { data, error } = await supabase
            .from('diagnostics')
            .select('*')
            .eq('patient_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const mapped = (data || []).map(d => ({
            id: `REC-${d.id.slice(0, 3)}`,
            name: d.type,
            date: new Date(d.created_at).toLocaleDateString(),
            type: 'Imaging',
            doctor: 'AI Specialist',
            size: 'AI Generated',
            icon: <Activity className="w-6 h-6" />,
            color: 'blue',
            insight: d.findings?.findings?.[0] || 'Clinical analysis pending.'
        }));

        setRecords(mapped);
    } catch (error) {
        console.error('Error fetching records:', error);
    } finally {
        setLoading(false);
    }
  };

  const categories = ['All', 'Report', 'Lab', 'Imaging', 'Consultation'];

  const filteredRecords = useMemo(() => {
    const baseRecords = records.length > 0 ? records : [];
    return baseRecords.filter(rec => {
      const matchesSearch = rec.name.toLowerCase().includes(search.toLowerCase()) || 
                           rec.doctor.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || rec.type === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, records]);

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
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
              Medical History
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              Secure Storage
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Health Records</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Secure chronological access to your comprehensive health history.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records or clinicians..." 
              className="pl-14 pr-8 py-5 rounded-[2.5rem] bg-white border border-slate-200 text-sm focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all w-full md:w-96 text-slate-900 shadow-xl shadow-slate-200/40"
            />
          </div>
          <button 
            onClick={() => toast.success('Initializing secure upload...')}
            className="w-full sm:w-auto px-8 py-5 bg-slate-900 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10 flex items-center justify-center gap-3 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Upload Records
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
        <div className="p-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-12 relative">
        {/* Timeline Axis */}
        <div className="absolute left-8 lg:left-[4.25rem] top-2 bottom-2 w-px bg-gradient-to-b from-blue-600 via-slate-200 to-transparent hidden lg:block opacity-30" />

        <div className="lg:col-span-3 space-y-10 relative">
          <AnimatePresence mode="popLayout">
            {filteredRecords.map((record) => (
              <motion.div
                key={record.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                className="group relative pl-0 lg:pl-20"
              >
                {/* Timeline Node */}
                <div className="absolute left-[3.85rem] top-8 w-3 h-3 rounded-full bg-blue-600 border-4 border-white shadow-lg hidden lg:block group-hover:scale-150 transition-transform z-10" />

                <div className="bg-white rounded-[3.5rem] p-8 lg:p-10 shadow-2xl shadow-slate-200/60 border border-slate-100 hover:border-blue-500/30 transition-all">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                      <div className={`w-20 h-20 rounded-[2rem] bg-${record.color}-50 text-${record.color}-600 flex items-center justify-center shrink-0 shadow-lg shadow-${record.color}-600/5 group-hover:rotate-6 transition-transform duration-500`}>
                        {record.icon}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{record.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500`}>
                            {record.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <div className="flex items-center gap-1.5 text-blue-600">
                            <Clock className="w-3 h-3" />
                            {record.date}
                          </div>
                          <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                          <div className="flex items-center gap-1.5 text-indigo-600">
                            <Stethoscope className="w-3 h-3" />
                            {record.doctor}
                          </div>
                          <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3 h-3" />
                            {record.size}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 self-end xl:self-center">
                      <button 
                        onClick={() => toast.info('Previewing clinical document...')}
                        className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center group/btn"
                      >
                        <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={() => toast.success('Starting secure download...')}
                        className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center group/btn"
                      >
                        <Download className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={() => toast.info('Preparing sharing link...')}
                        className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center group/btn"
                      >
                        <Share2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* AI Insight Section */}
                  <div className="mt-8 pt-8 border-t border-slate-50 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">AI Diagnostic Insight</div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                        "{record.insight}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-10">
          <motion.div 
            variants={itemVariants}
            className="bg-slate-950 rounded-[3.5rem] p-10 shadow-2xl text-white relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Security Vault</h3>
              </div>
              <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8">
                Records are protected by biometric encryption. Direct access is audited in real-time.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Biometric Lock</span>
                  <div className="w-8 h-4 bg-blue-600 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Log Audit</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100"
          >
            <h3 className="text-xl font-black text-slate-900 mb-8">Storage Status</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Cloud</div>
                  <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">42.8 MB / 500 MB</div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '15%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-blue-600 rounded-full" 
                  />
                </div>
              </div>
              <button className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                Upgrade Capacity
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
