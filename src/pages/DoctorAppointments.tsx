import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle, 
  Clock,
  Search,
  MoreVertical,
  Stethoscope,
  Users,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function DoctorAppointments() {
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState('all');
  const { user } = useSelector((state: RootState) => state.auth);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
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
    return appointments.filter(apt => {
      const name = apt.patient?.name || '';
      const matchesSearch = name.toLowerCase().includes(queueSearch.toLowerCase()) || apt.id.toLowerCase().includes(queueSearch.toLowerCase());
      const matchesFilter = queueFilter === 'all' || apt.status.toLowerCase() === queueFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [appointments, queueSearch, queueFilter]);

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
      className="space-y-16 pb-16 px-4 lg:px-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Patient Queue</h1>
          <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">Manage your appointments and triage patients in real-time with advanced clinical insights.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              value={queueSearch}
              onChange={(e) => setQueueSearch(e.target.value)}
              placeholder="Search queue..." 
              className="pl-14 pr-8 py-5 rounded-[2rem] bg-white border border-slate-200 text-base focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all w-96 text-slate-900 shadow-xl shadow-slate-200/50"
            />
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
              <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">
                Syncing Clinical Queue...
              </div>
            </div>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner">
            <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-sm">
              <Users className="w-14 h-14 text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Queue Empty</h3>
            <p className="text-slate-400 font-medium text-xl">No patients are currently waiting for consultation.</p>
          </div>
        ) : (
          filteredQueue.map((apt) => (
            <motion.div
              key={apt.id}
              layoutId={apt.id}
              whileHover={{ scale: 1.01, y: -6 }}
              className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 group hover:border-blue-600/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-16"
            >
              <div className="flex items-center gap-10">
                <div className="relative shrink-0">
                  <img 
                    src={`https://picsum.photos/seed/${apt.patient?.id}/200/200`} 
                    className="w-28 h-28 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl group-hover:scale-110 transition-transform duration-700" 
                    alt="Patient" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className={`absolute -bottom-3 -right-3 w-10 h-10 border-4 border-white rounded-full shadow-xl ${
                    apt.status === 'accepted' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-5">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{apt.patient?.name}</h3>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      apt.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">
                    <span className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {format(new Date(apt.appointment_date), 'h:mm a')}
                    </span>
                    <span className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      {format(new Date(apt.appointment_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 lg:max-w-lg space-y-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Clinical Reason</div>
                <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 text-base text-slate-600 font-medium leading-relaxed shadow-inner group-hover:bg-white transition-colors duration-500">
                  {apt.reason || 'Routine clinical checkup and consultation.'}
                </div>
              </div>

              <div className="flex items-center gap-5 shrink-0">
                {apt.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => updateAppointmentStatus(apt.id, 'accepted')}
                      className="px-10 py-6 bg-emerald-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200/50 active:scale-95"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => updateAppointmentStatus(apt.id, 'rejected')}
                      className="px-10 py-6 bg-rose-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-2xl shadow-rose-200/50 active:scale-95"
                    >
                      Reject
                    </button>
                  </>
                )}
                {apt.status === 'accepted' && (
                  <button 
                    onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                    className="px-10 py-6 bg-emerald-100 text-emerald-600 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-all active:scale-95"
                  >
                    Complete
                  </button>
                )}
                <button 
                  onClick={() => navigate(`/dashboard/patients/${apt.patient_id}`)}
                  className="px-10 py-6 bg-blue-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200/50 flex items-center gap-4 active:scale-95"
                >
                  <Stethoscope className="w-6 h-6" />
                  Examine
                </button>
                <button className="p-6 bg-slate-100 text-slate-400 rounded-[2rem] hover:text-slate-900 hover:bg-slate-200 transition-all active:scale-95">
                  <MoreVertical className="w-7 h-7" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
