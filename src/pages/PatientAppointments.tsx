import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  MoreVertical,
  Video,
  MapPin,
  CheckCircle,
  AlertCircle,
  User,
  Stethoscope
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'sonner';
import GenericModal from '../components/GenericModal';
import { addAppointment } from '../store/healthSlice';
import { useNavigate } from 'react-router-dom';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({ doctorId: 'd1', reason: '', date: '' });
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { appointments: reduxAppointments, practitioners } = useSelector((state: RootState) => state.health);
  const dispatch = useDispatch();

  const [dbAppointments, setDbAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);

  const fetchAppointments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id);
      
      if (error) {
        console.error('Patient Supabase Fetch Error:', error);
        throw error;
      }
      
      const sorted = (data || []).sort((a, b) => {
        const tA = new Date(`${a.date || a.appointment_date} ${a.time || '00:00'}`).getTime();
        const tB = new Date(`${b.date || b.appointment_date} ${b.time || '00:00'}`).getTime();
        return tA - tB;
      });

      setDbAppointments(sorted);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to sync patient schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
        fetchAppointments();
        const channel = supabase
            .channel(`patient-appointments-${user.id}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'appointments',
                filter: `patient_id=eq.${user.id}`
            }, () => {
                fetchAppointments();
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, [user?.id]);

  const allAppointments = dbAppointments;

  const filteredAppointments = useMemo(() => {
    return allAppointments.filter(apt => 
      apt.doctor_name?.toLowerCase().includes(search.toLowerCase()) || 
      apt.reason?.toLowerCase().includes(search.toLowerCase())
    );
  }, [allAppointments, search]);

  const handleBook = async () => {
    if (!bookingData.reason || !bookingData.date) {
      toast.error('Please fill in all clinical scheduling requirements.');
      return;
    }

    const doctor = practitioners.find(p => p.id === bookingData.doctorId) || { id: 'staff-01', name: 'Dr. Sarah Mitchell' };
    const bookingDate = new Date(bookingData.date);
    
    try {
      const { error } = await supabase.from('appointments').insert([{
        patient_id: user?.id,
        doctor_id: doctor.id,
        patient_name: user?.name,
        doctor_name: doctor.name,
        date: format(bookingDate, 'yyyy-MM-dd'),
        time: format(bookingDate, 'HH:mm'),
        type: 'Video',
        status: 'pending',
        reason: bookingData.reason
      }]);

      if (error) throw error;
      
      toast.success(`Sequential slot reserved with ${doctor.name}. Clinical confirmation pending.`);
      setIsBookModalOpen(false);
      setBookingData({ doctorId: 'd1', reason: '', date: '' });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to commit reservation to cloud.");
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
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsBookModalOpen(true);
            }}
            className="px-8 py-4 bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Book New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && dbAppointments.length === 0 ? (
          <div className="col-span-full p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
            Synchronizing schedule...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="col-span-full p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
            No active appointments found
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
                      src={`https://i.pravatar.cc/150?u=${apt.doctor_id}`} 
                      className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-xl group-hover:scale-110 transition-transform" 
                      alt="Doctor" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-4 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{apt.doctor_name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{apt.type} Session</p>
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
                    {format(new Date(apt.date), 'EEEE, MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <div className="text-xs font-bold text-slate-600">
                    {apt.time}
                  </div>
                </div>
                <div className="flex items-center gap-4 px-2 py-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Reason:</div>
                  <div className="text-[11px] font-bold text-slate-700 truncate">{apt.reason}</div>
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

              <button 
                onClick={() => navigate(`/dashboard/video-consultation/${apt.id}`)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
              >
                Join {apt.status === 'accepted' ? 'Consultation' : 'Queue'}
              </button>

              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </motion.div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      <GenericModal 
        isOpen={isBookModalOpen} 
        onClose={() => setIsBookModalOpen(false)}
        title="Clinical Reservation"
        description="Book a new clinical consultation slot"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Clinician</label>
            <div className="grid grid-cols-1 gap-3">
              {practitioners.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setBookingData(prev => ({ ...prev, doctorId: doc.id }))}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                    bookingData.doctorId === doc.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <User className={`w-5 h-5 ${bookingData.doctorId === doc.id ? 'text-blue-500' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">{doc.name}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{doc.specialty}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Reservation Time</label>
            <input 
              type="datetime-local" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              value={bookingData.date}
              onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Primary Consultation Query</label>
            <textarea 
              placeholder="E.g. Persistent fatigue, routine checkup, symptom review..."
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 min-h-[120px] resize-none"
              value={bookingData.reason}
              onChange={(e) => setBookingData(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>

          <button 
            onClick={handleBook}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
          >
            Confirm Reservation Protocol
          </button>
        </div>
      </GenericModal>
    </motion.div>
  );
}
