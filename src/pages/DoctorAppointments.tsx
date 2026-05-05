import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle, 
  Clock,
  Search,
  MoreVertical,
  Stethoscope,
  Users,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Brain,
  ChevronRight,
  Sparkles,
  Activity
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNotifications } from '../contexts/NotificationContext';

export default function DoctorAppointments() {
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { appointments: reduxAppointments } = useSelector((state: RootState) => state.health);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  const appointments = reduxAppointments;

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      const statusMessages: Record<string, string> = {
        accepted: 'Appointment accepted. Patient has been notified.',
        rejected: 'Appointment rejected. Patient will be informed.',
        completed: 'Consultation marked as completed.'
      };

      toast.success(statusMessages[status] || `Status updated to ${status}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const navigate = useNavigate();

  const filteredQueue = useMemo(() => {
    let result = appointments.filter(apt => {
      const name = apt.patient?.name || '';
      const matchesSearch = name.toLowerCase().includes(queueSearch.toLowerCase()) || apt.id.toLowerCase().includes(queueSearch.toLowerCase());
      const matchesFilter = queueFilter === 'all' || apt.status.toLowerCase() === queueFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      if (sortBy === 'time') {
        const dateA = new Date(a.appointment_date).getTime();
        const dateB = new Date(b.appointment_date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortBy === 'name') {
        const nameA = a.patient?.name || '';
        const nameB = b.patient?.name || '';
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      return 0;
    });

    return result;
  }, [appointments, queueSearch, queueFilter, sortBy, sortOrder]);

  const [expandedApt, setExpandedApt] = useState<string | null>(null);

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
      className="space-y-12 pb-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <div className="space-y-4">
          <h1 className="text-7xl font-display font-black text-slate-950 tracking-tighter leading-none">Patient Queue</h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed">System-wide triage management with real-time biometric synchronization.</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative group flex-1 min-w-[280px] lg:flex-none">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              value={queueSearch}
              onChange={(e) => setQueueSearch(e.target.value)}
              placeholder="Filter queue by name or ID..." 
              className="w-full lg:w-96 pl-16 pr-8 py-5 rounded-[2rem] bg-white border border-slate-200 text-sm font-bold focus:outline-none focus:ring-8 focus:ring-blue-600/5 transition-all text-slate-950 shadow-xl shadow-slate-200/50"
            />
          </div>
          <div className="flex bg-white p-2 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-x-auto custom-scrollbar no-scrollbar">
            {['all', 'pending', 'accepted', 'completed'].map((filter) => (
              <button 
                key={filter}
                onClick={() => setQueueFilter(filter)}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${queueFilter === filter ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 gap-10"
      >
        {loading ? (
          <div className="p-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner">
            <div className="flex flex-col items-center gap-8">
              <div className="w-20 h-20 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">
                Syncing Clinical Queue...
              </div>
            </div>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner">
            <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-sm border border-slate-100">
              <Users className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-3xl font-display font-black text-slate-950 mb-4 tracking-tight uppercase">Queue Synchronized</h3>
            <p className="text-slate-400 font-medium text-lg">No patient sessions found for current criteria.</p>
          </div>
        ) : (
          filteredQueue.map((apt) => (
            <motion.div
              key={apt.id}
              layoutId={apt.id}
              className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 group transition-all relative overflow-hidden"
            >
              <div className="p-10 lg:p-12 flex flex-col xl:flex-row xl:items-center justify-between gap-12 lg:gap-16 relative z-10">
                <div className="flex items-center gap-10 relative z-10">
                  <div className="relative shrink-0">
                    <img 
                      src={`https://picsum.photos/seed/${apt.patient?.id}/300/300`} 
                      className="w-24 h-24 lg:w-28 lg:h-28 rounded-[2.25rem] object-cover border-4 border-white shadow-2xl group-hover:scale-110 transition-transform duration-700 ring-1 ring-slate-100" 
                      alt="Patient" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className={`absolute -bottom-2 -right-2 w-9 h-9 border-4 border-white rounded-full shadow-xl ${
                      apt.status === 'accepted' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                      apt.status === 'completed' ? 'bg-blue-500 shadow-blue-500/20' :
                      'bg-amber-500 animate-pulse shadow-amber-500/20'
                    }`} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h3 className="text-3xl font-display font-black text-slate-950 tracking-tight">{apt.patient?.name}</h3>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        apt.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20' : 
                        apt.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-500/20' :
                        'bg-amber-50 text-amber-600 border-amber-500/20'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        {format(new Date(apt.appointment_date), 'h:mm a')}
                      </span>
                      <span className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        {format(new Date(apt.appointment_date), 'MMM d')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0 relative z-10">
                  <button 
                    onClick={() => setExpandedApt(expandedApt === apt.id ? null : apt.id)}
                    className="px-8 py-6 bg-slate-50 text-slate-950 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-3 border border-slate-200/60"
                  >
                    {expandedApt === apt.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expandedApt === apt.id ? 'Close Details' : 'View Details'}
                  </button>
                  
                  {apt.status === 'pending' && (
                    <button 
                      onClick={() => updateAppointmentStatus(apt.id, 'accepted')}
                      className="px-10 py-6 bg-emerald-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/10"
                    >
                      Authorize
                    </button>
                  )}
                  
                  <button 
                    onClick={() => navigate(`/dashboard/patients/${apt.patient_id}`)}
                    className="px-10 py-6 bg-slate-950 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-4"
                  >
                    <Stethoscope className="w-5 h-5 text-blue-400" />
                    Clinical View
                  </button>
                </div>
              </div>

              {/* Consultation Details Expansion */}
              <AnimatePresence>
                {expandedApt === apt.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
                  >
                    <div className="p-12 space-y-10">
                      <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-8">
                          <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              Symptomatic Context
                            </h4>
                            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm leading-relaxed text-slate-600">
                              {apt.reason || 'Patient presenting with recurring symptoms requiring neural baseline sync. Initial intake suggests metabolic variance.'}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Risk Profile</div>
                              <div className="flex flex-wrap gap-2">
                                {['Hypertension', 'Genetic Marker B4', 'Neural Stress'].map(risk => (
                                  <span key={risk} className="px-3 py-1 bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-widest rounded-lg border border-rose-100">
                                    {risk}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Vital Trends</div>
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="text-2xl font-black text-slate-900 tracking-tight">124/82</div>
                                  <div className="text-[8px] font-black text-slate-400 uppercase">Blood Pressure</div>
                                </div>
                                <Activity className="w-5 h-5 text-emerald-500" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-8 h-full">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                              <Brain className="w-5 h-5" />
                            </div>
                            <h5 className="text-sm font-black uppercase tracking-widest">Neural Insights</h5>
                          </div>
                          
                          <div className="space-y-6">
                            {[
                              { label: 'Confidence Score', val: '94.2%' },
                              { label: 'Recommended Action', val: 'Lab V4 Scan' },
                              { label: 'Urgency Tier', val: 'Level 2' }
                            ].map(insight => (
                              <div key={insight.label} className="flex items-center justify-between border-b border-white/10 pb-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{insight.label}</span>
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{insight.val}</span>
                              </div>
                            ))}
                          </div>

                          <button className="w-full py-5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3">
                            Launch Diagnostics
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Progress Bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-20" style={{ width: '100%' }} />
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
