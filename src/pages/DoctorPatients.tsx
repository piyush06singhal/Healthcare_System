import { 
  Users, 
  Search, 
  MoreVertical,
  FileText,
  Activity,
  History,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';

export default function DoctorPatients() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useSelector((state: RootState) => state.auth);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchPatients();
    }
  }, [user?.id]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Fetch patients who have appointments with this doctor
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          patient:users!patient_id(id, name, email)
        `)
        .eq('doctor_id', user?.id);
      
      if (error) throw error;
      
      // Unique patients
      const allPatients = data?.map(a => a.patient as any).filter(Boolean) || [];
      const uniquePatients = Array.from(new Map(allPatients.map(p => [p.id, p])).values());
      
      // Add mock status for demo
      const patientsWithStatus = uniquePatients.map(p => ({
        ...p,
        status: ['Stable', 'Critical', 'Recovering'][Math.floor(Math.random() * 3)]
      }));
      
      setPatients(patientsWithStatus);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p?.name?.toLowerCase().includes(search.toLowerCase()) || 
                           p?.email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [patients, search, statusFilter]);

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
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Active Patients</h1>
          <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">Directory of patients under your clinical care. Manage records and monitor health scores in real-time.</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..." 
              className="pl-14 pr-8 py-5 rounded-[2rem] bg-white border border-slate-100 text-base focus:outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 transition-all w-full lg:w-96 text-slate-900 shadow-2xl shadow-slate-200/60 font-medium"
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-12 py-5 rounded-[2rem] bg-white border border-slate-100 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-8 focus:ring-blue-600/5 transition-all text-slate-900 shadow-2xl shadow-slate-200/40 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="stable">Stable</option>
              <option value="critical">Critical</option>
              <option value="recovering">Recovering</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">
              Syncing Patient Records...
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Records</h3>
            <p className="text-slate-400 font-medium">No patients found matching your search criteria.</p>
          </div>
        ) : (
          filteredPatients.map((patient, i) => (
            <motion.div
              key={patient.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={`https://picsum.photos/seed/${patient.id}/200/200`} 
                      className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-xl group-hover:scale-110 transition-transform" 
                      alt="Patient" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-lg"></div>
                  </div>
                  <div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{patient.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          patient.status === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          patient.status === 'Recovering' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {patient.status}
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID: {patient.id.slice(0, 6)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 hover:bg-slate-100 transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vital Status</div>
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest">
                    <Activity className="w-4 h-4" />
                    Stable
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Sync</div>
                  <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                    <History className="w-4 h-4" />
                    2h ago
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Score</span>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">84%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '84%' }}
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 relative z-10">
                <button 
                  onClick={() => navigate(`/dashboard/patients/${patient.id}`)}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <FileText className="w-4 h-4" />
                  Full Records
                </button>
                <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
                  <MessageSquare className="w-4 h-4" />
                  Secure Chat
                </button>
              </div>

              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
