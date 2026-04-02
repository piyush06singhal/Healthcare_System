import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  MoreVertical,
  Video,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'sonner';

export default function PatientAppointments() {
  const [search, setSearch] = useState('');
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
          doctor:users!doctor_id(id, name, email)
        `)
        .eq('patient_id', user?.id)
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => 
      apt.doctor?.name?.toLowerCase().includes(search.toLowerCase()) || 
      apt.reason?.toLowerCase().includes(search.toLowerCase())
    );
  }, [appointments, search]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-slate-500 font-medium mt-1">View and manage your upcoming medical consultations.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search appointments..." 
              className="pl-12 pr-6 py-4 rounded-[2rem] bg-white border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all w-80 text-slate-900 shadow-sm"
            />
          </div>
          <button className="px-8 py-4 bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Book New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="col-span-full p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
            No appointments found
          </div>
        ) : (
          filteredAppointments.map((apt, i) => (
            <motion.div
              key={apt.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={`https://picsum.photos/seed/${apt.doctor?.id}/200/200`} 
                      className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-xl group-hover:scale-110 transition-transform" 
                      alt="Doctor" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-4 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{apt.doctor?.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cardiologist</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div className="text-xs font-bold text-slate-600">
                    {format(new Date(apt.appointment_date), 'EEEE, MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <div className="text-xs font-bold text-slate-600">
                    {format(new Date(apt.appointment_date), 'h:mm a')}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Video className="w-5 h-5 text-emerald-600" />
                  <div className="text-xs font-bold text-slate-600">Video Consultation</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  apt.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  apt.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  'bg-slate-50 text-slate-400 border border-slate-100'
                }`}>
                  {apt.status === 'accepted' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {apt.status}
                </div>
                <button className="text-xs font-black text-rose-600 hover:text-rose-700 uppercase tracking-widest">
                  Cancel
                </button>
              </div>

              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20">
                Join Consultation
              </button>

              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
