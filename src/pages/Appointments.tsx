import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, User, Phone, Check, X, Search, Filter, Activity, ChevronRight, Plus, MoreVertical, MapPin, Star, Trash2, AlertCircle, ArrowRight, Bell, CheckCircle2, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
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
  subMonths
} from 'date-fns';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('date-desc');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'upcoming' | 'history'>('upcoming');
  const [displayMode, setDisplayMode] = useState<'list' | 'calendar'>('list');
  const [cancellingApt, setCancellingApt] = useState<any | null>(null);
  const [reschedulingApt, setReschedulingApt] = useState<any | null>(null);
  const [statusUpdateApt, setStatusUpdateApt] = useState<{ apt: any, status: string } | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState({
    doctor_id: '',
    date: '',
    time: '',
    reason: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingErrors, setBookingErrors] = useState<any>({});
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchAppointments();
    if (user?.role === 'patient') {
      fetchDoctors();
    }
  }, []);

  useEffect(() => {
    if (bookingData.doctor_id && bookingData.date) {
      fetchAvailableSlots();
    }
  }, [bookingData.doctor_id, bookingData.date]);

  const fetchAvailableSlots = async () => {
    setFetchingSlots(true);
    try {
      const { data, error } = await supabase
        .from('doctor_availability')
        .select('slots')
        .eq('doctor_id', bookingData.doctor_id)
        .eq('date', bookingData.date)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      setAvailableSlots(data?.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setFetchingSlots(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, specialty')
        .eq('role', 'doctor');
      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: any = {};
    if (!bookingData.doctor_id) errors.doctor_id = 'Please select a doctor';
    if (!bookingData.date) errors.date = 'Please select a date';
    if (!bookingData.time) errors.time = 'Please select a time';
    if (!bookingData.reason) errors.reason = 'Please provide a reason for your visit';

    if (Object.keys(errors).length > 0) {
      setBookingErrors(errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setBookingErrors({});
    setBookingLoading(true);
    try {
      const appointmentDate = new Date(`${bookingData.date}T${bookingData.time}`);
      
      // Check if date is in the past
      if (appointmentDate < new Date()) {
        setBookingErrors({ date: 'Appointment date cannot be in the past' });
        toast.error('Invalid date selected');
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user?.id,
          doctor_id: bookingData.doctor_id,
          appointment_date: appointmentDate.toISOString(),
          reason: bookingData.reason,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Appointment booked successfully!', {
        description: 'The doctor will review your request shortly.',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      });
      setShowBookingForm(false);
      setBookingData({ doctor_id: '', date: '', time: '', reason: '' });
      fetchAppointments();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:users!doctor_id(name, specialty),
          patient:users!patient_id(name)
        `)
        .or(`patient_id.eq.${user?.id},doctor_id.eq.${user?.id}`)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.date || !bookingData.time) {
      toast.error('Please select both date and time');
      return;
    }

    try {
      const appointmentDate = new Date(`${bookingData.date}T${bookingData.time}`);
      const { error } = await supabase
        .from('appointments')
        .update({ appointment_date: appointmentDate.toISOString(), status: 'pending' })
        .eq('id', reschedulingApt.id);

      if (error) throw error;
      toast.success('Appointment rescheduled successfully', {
        description: 'The doctor will be notified of the change.'
      });
      setReschedulingApt(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error rescheduling:', error);
      toast.error('Failed to reschedule');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const name = user?.role === 'patient' ? apt.doctor?.name : apt.patient?.name;
    const matchesSearch = name?.toLowerCase().includes(searchQuery.toLowerCase()) || apt.id.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    // Date Range Filter
    const aptDate = new Date(apt.appointment_date);
    const matchesStartDate = !dateRange.start || aptDate >= new Date(dateRange.start);
    const matchesEndDate = !dateRange.end || aptDate <= new Date(dateRange.end + 'T23:59:59');
    
    // Role Filter (Specific Doctor/Patient)
    const matchesRole = roleFilter === 'all' || 
      (user?.role === 'patient' ? apt.doctor_id === roleFilter : apt.patient_id === roleFilter);

    // History vs Upcoming Filter
    const isPast = aptDate < new Date();
    const matchesViewMode = viewMode === 'upcoming' ? !isPast : isPast;

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate && matchesRole && matchesViewMode;
  }).sort((a, b) => {
    if (sortBy === 'date-asc') return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
    if (sortBy === 'date-desc') return new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime();
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return 0;
  });

  const appointmentsForSelectedDay = useMemo(() => {
    if (!selectedCalendarDay) return [];
    return appointments.filter(apt => 
      isSameDay(new Date(apt.appointment_date), selectedCalendarDay)
    );
  }, [appointments, selectedCalendarDay]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentCalendarMonth));
    const end = endOfWeek(endOfMonth(currentCalendarMonth));
    return eachDayOfInterval({ start, end });
  }, [currentCalendarMonth]);

  const handleRemindMe = (apt: any) => {
    if (reminders.includes(apt.id)) {
      setReminders(prev => prev.filter(id => id !== apt.id));
      toast.info(`Reminder removed for your appointment with ${apt.doctor?.name || 'the doctor'}`);
      return;
    }

    setReminders(prev => [...prev, apt.id]);
    const date = new Date(apt.appointment_date).toLocaleString();
    toast.success(`Reminder set for your appointment with ${apt.doctor?.name || 'the doctor'} on ${date}`, {
      description: "We'll notify you 30 minutes before the session starts.",
      icon: <Bell className="w-4 h-4" />
    });
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <CalendarIcon className="w-3 h-3" />
            Clinical Schedule
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 font-medium max-w-md">Manage your clinical interactions and upcoming consultations with ease.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setDisplayMode('list')}
              className={`p-2 rounded-xl transition-all ${displayMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Activity className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setDisplayMode('calendar')}
              className={`p-2 rounded-xl transition-all ${displayMode === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
            {['all', 'pending', 'accepted', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  statusFilter === status 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12 py-3 w-64 text-sm bg-white border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" 
              placeholder="Search appointments..." 
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
              showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
          <button 
            onClick={() => setShowBookingForm(true)}
            className="btn-primary py-3 px-8 shadow-lg shadow-blue-600/20 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Enhanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="card p-8 bg-slate-50/50 border-dashed border-2 border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort By</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 transition-all appearance-none"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="status">By Status</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {user?.role === 'patient' ? 'Filter by Doctor' : 'Filter by Patient'}
                </label>
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 transition-all appearance-none"
                >
                  <option value="all">All {user?.role === 'patient' ? 'Doctors' : 'Patients'}</option>
                  {/* We could populate this with unique doctors/patients from the appointments list */}
                  {Array.from(new Set(appointments.map(a => user?.role === 'patient' ? a.doctor_id : a.patient_id))).map(id => {
                    const apt = appointments.find(a => (user?.role === 'patient' ? a.doctor_id : a.patient_id) === id);
                    const name = user?.role === 'patient' ? apt?.doctor?.name : apt?.patient?.name;
                    return <option key={id} value={id}>{name}</option>;
                  })}
                </select>
              </div>
              <div className="lg:col-span-4 flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => {
                    setDateRange({ start: '', end: '' });
                    setSortBy('date-desc');
                    setRoleFilter('all');
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Upcoming', value: appointments.filter(a => a.status === 'accepted').length, color: 'blue', icon: Clock },
          { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: 'orange', icon: Activity },
          { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: 'emerald', icon: Check },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="card p-6 flex items-center justify-between group hover:scale-[1.02] transition-all cursor-default"
          >
            <div className="space-y-1">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </div>
            <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform`}>
              <stat.icon className="w-7 h-7" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {viewMode === 'upcoming' ? 'Upcoming Schedule' : 'Appointment History'}
            </h2>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setViewMode('upcoming')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setViewMode('history')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                History
              </button>
            </div>
          </div>
          {viewMode === 'upcoming' && (
            <button 
              onClick={() => setViewMode('history')}
              className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
            >
              View History
            </button>
          )}
        </div>

        <div className="grid gap-4">
          {displayMode === 'list' ? (
            <AnimatePresence mode="popLayout">
              {filteredAppointments.map((apt, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  key={apt.id}
                  className="card p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group border-l-4 border-l-transparent hover:border-l-blue-600"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-100 group-hover:border-blue-100 transition-colors">
                          <img 
                            src={`https://i.pravatar.cc/150?u=${apt.id}`} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt="Avatar"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center ${
                          apt.status === 'accepted' ? 'bg-emerald-500' :
                          apt.status === 'pending' ? 'bg-orange-500' : 
                          apt.status === 'cancelled' || apt.status === 'rejected' ? 'bg-red-500' : 'bg-slate-400'
                        }`}>
                          {apt.status === 'accepted' ? <Check className="w-3 h-3 text-white" /> : 
                           apt.status === 'cancelled' || apt.status === 'rejected' ? <X className="w-3 h-3 text-white" /> :
                           <Clock className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900 tracking-tight">
                            {user?.role === 'patient' ? apt.doctor?.name : apt.patient?.name}
                          </h3>
                          {user?.role === 'patient' && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-100">
                              {apt.doctor?.specialty || 'Specialist'}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-blue-500" />
                            {apt.reason || 'General Consultation'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex items-center gap-6">
                        <div className="text-center px-6 border-r border-slate-100">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</div>
                          <div className="text-sm font-black text-slate-900">{new Date(apt.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</div>
                          <div className="text-sm font-black text-slate-900">{new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>

                        <div className="flex items-center gap-3">
                          {user?.role === 'patient' && apt.status === 'accepted' && (
                            <button 
                              onClick={() => handleRemindMe(apt)}
                              className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border ${
                                reminders.includes(apt.id)
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                                  : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white'
                              }`}
                              title={reminders.includes(apt.id) ? "Reminder Set" : "Set Reminder"}
                            >
                              <Bell className={`w-5 h-5 ${reminders.includes(apt.id) ? 'animate-bounce' : ''}`} />
                            </button>
                          )}
                          
                          {/* Reschedule Option */}
                          {(apt.status === 'pending' || apt.status === 'accepted') && (
                            <button 
                              onClick={() => {
                                setReschedulingApt(apt);
                                setBookingData({
                                  doctor_id: apt.doctor_id,
                                  date: new Date(apt.appointment_date).toISOString().split('T')[0],
                                  time: new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                                  reason: apt.reason
                                });
                              }}
                              className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border border-blue-100"
                              title="Reschedule"
                            >
                              <CalendarIcon className="w-5 h-5" />
                            </button>
                          )}

                          {user?.role === 'doctor' && apt.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => setStatusUpdateApt({ apt, status: 'accepted' })}
                                className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center border border-emerald-100"
                                title="Accept"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => setStatusUpdateApt({ apt, status: 'rejected' })}
                                className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
                                title="Reject"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          {/* Cancel Button */}
                          {((user?.role === 'patient' && (apt.status === 'pending' || apt.status === 'accepted')) || 
                            (user?.role === 'doctor' && apt.status === 'accepted')) && (
                            <button 
                              onClick={() => setCancellingApt(apt)}
                              className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
                              title="Cancel Appointment"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}

                          <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border border-slate-100">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="card p-10 bg-white">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{format(currentCalendarMonth, 'MMMM yyyy')}</h3>
                    <p className="text-xs text-slate-400 font-medium">Your monthly clinical schedule</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentCalendarMonth(subMonths(currentCalendarMonth, 1))}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button 
                    onClick={() => setCurrentCalendarMonth(addMonths(currentCalendarMonth, 1))}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

            <div className="grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4">{day}</div>
                ))}
                {calendarDays.map((day, i) => {
                  const isCurrentMonth = isSameMonth(day, currentCalendarMonth);
                  const isToday = isSameDay(day, new Date());
                  const dayAppointments = filteredAppointments.filter(a => isSameDay(new Date(a.appointment_date), day));
                  
                  return (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCalendarDay(day)}
                      className={`aspect-square rounded-2xl border p-2 flex flex-col items-center justify-between transition-all cursor-pointer relative group ${
                        !isCurrentMonth ? 'opacity-20 pointer-events-none' : 'opacity-100'
                      } ${
                        isToday ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-50 border-slate-100'
                      } ${dayAppointments.length > 0 && !isToday ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : ''}`}
                    >
                      <span className={`text-xs font-black ${isToday ? 'text-white' : 'text-slate-900'}`}>{format(day, 'd')}</span>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {dayAppointments.slice(0, 4).map((apt, idx) => (
                          <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full ${
                              isToday ? 'bg-white' : 
                              apt.status === 'accepted' ? 'bg-emerald-500' : 
                              apt.status === 'pending' ? 'bg-orange-500' : 'bg-slate-400'
                            }`} 
                          />
                        ))}
                        {dayAppointments.length > 4 && (
                          <div className={`text-[8px] font-black leading-none ${isToday ? 'text-white' : 'text-blue-600'}`}>
                            +{dayAppointments.length - 4}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredAppointments.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200"
            >
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Appointments Found</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">We couldn't find any appointments matching your search criteria.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-blue-600 font-black uppercase tracking-widest text-xs hover:text-blue-700"
              >
                Clear Search
              </button>
            </motion.div>
          )}
        </div>
      </div>
      {/* Booking Form Modal */}
      <AnimatePresence>
        {showBookingForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Book Appointment</h2>
                    <p className="text-slate-500 font-medium text-sm">Fill in the details to schedule a consultation.</p>
                  </div>
                  <button 
                    onClick={() => setShowBookingForm(false)}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleBookAppointment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Doctor</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-4 h-4" />
                      <select 
                        required
                        value={bookingData.doctor_id}
                        onChange={(e) => {
                          setBookingData({...bookingData, doctor_id: e.target.value});
                          if (bookingErrors.doctor_id) setBookingErrors({...bookingErrors, doctor_id: null});
                        }}
                        className={`input-field pl-12 py-4 w-full text-sm bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all appearance-none ${bookingErrors.doctor_id ? 'border-red-500 bg-red-50/30' : ''}`}
                      >
                        <option value="">Choose a specialist...</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>
                        ))}
                      </select>
                    </div>
                    {bookingErrors.doctor_id && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{bookingErrors.doctor_id}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Date & Time</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="relative group">
                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-4 h-4" />
                            <input 
                              required
                              type="date" 
                              min={new Date().toISOString().split('T')[0]}
                              value={bookingData.date}
                              onChange={(e) => {
                                setBookingData({...bookingData, date: e.target.value});
                                if (bookingErrors.date) setBookingErrors({...bookingErrors, date: null});
                              }}
                              className={`input-field pl-12 py-4 w-full text-sm bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all ${bookingErrors.date ? 'border-red-500 bg-red-50/30' : ''}`}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {fetchingSlots ? (
                            <div className="col-span-3 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading slots...</div>
                          ) : availableSlots.length > 0 ? (
                            availableSlots.map((time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => setBookingData({...bookingData, time})}
                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                  bookingData.time === time 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                                    : 'bg-slate-50 text-slate-600 border-transparent hover:border-blue-200 hover:bg-blue-50'
                                }`}
                              >
                                {time}
                              </button>
                            ))
                          ) : (
                            <div className="col-span-3 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              {bookingData.doctor_id && bookingData.date ? 'No slots available' : 'Select doctor & date'}
                            </div>
                          )}
                        </div>
                      </div>
                      {bookingErrors.date && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{bookingErrors.date}</p>}
                      {bookingErrors.time && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{bookingErrors.time}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Visit</label>
                    <div className="relative group">
                      <Activity className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors w-4 h-4" />
                      <textarea 
                        required
                        value={bookingData.reason}
                        onChange={(e) => {
                          setBookingData({...bookingData, reason: e.target.value});
                          if (bookingErrors.reason) setBookingErrors({...bookingErrors, reason: null});
                        }}
                        className={`input-field pl-12 py-4 w-full text-sm bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all min-h-[100px] ${bookingErrors.reason ? 'border-red-500 bg-red-50/30' : ''}`}
                        placeholder="Briefly describe your symptoms or reason for visit..."
                      />
                    </div>
                    {bookingErrors.reason && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{bookingErrors.reason}</p>}
                  </div>

                  <button 
                    disabled={bookingLoading}
                    type="submit"
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                    {!bookingLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {reschedulingApt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReschedulingApt(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reschedule Appointment</h2>
                    <p className="text-slate-500 font-medium text-sm">Select a new date and time for your consultation.</p>
                  </div>
                  <button 
                    onClick={() => setReschedulingApt(null)}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleReschedule} className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Date & Time</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-4 h-4" />
                        <input 
                          required
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingData.date}
                          onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                          className="input-field pl-12 py-4 w-full text-sm bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {fetchingSlots ? (
                          <div className="col-span-3 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading slots...</div>
                        ) : availableSlots.length > 0 ? (
                          availableSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingData({...bookingData, time})}
                              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                bookingData.time === time 
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                                  : 'bg-slate-50 text-slate-600 border-transparent hover:border-blue-200 hover:bg-blue-50'
                              }`}
                            >
                              {time}
                            </button>
                          ))
                        ) : (
                          <div className="col-span-3 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            {bookingData.date ? 'No slots available' : 'Select a date'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
                  >
                    Confirm Reschedule
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for Cancellation */}
      <AnimatePresence>
        {cancellingApt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingApt(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cancel Appointment?</h3>
                  <p className="text-slate-500 font-medium">
                    Are you sure you want to cancel your appointment with <span className="text-slate-900 font-bold">{user?.role === 'patient' ? cancellingApt.doctor?.name : cancellingApt.patient?.name}</span>? This action cannot be undone.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => setCancellingApt(null)}
                    className="py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(cancellingApt.id, 'cancelled');
                      setCancellingApt(null);
                      toast.success('Appointment cancelled successfully');
                    }}
                    className="py-4 px-6 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for Status Update (Accept/Reject) */}
      <AnimatePresence>
        {statusUpdateApt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusUpdateApt(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto ${
                  statusUpdateApt.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {statusUpdateApt.status === 'accepted' ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {statusUpdateApt.status === 'accepted' ? 'Accept Appointment?' : 'Reject Appointment?'}
                  </h3>
                  <p className="text-slate-500 font-medium">
                    Are you sure you want to {statusUpdateApt.status} the appointment for <span className="text-slate-900 font-bold">{statusUpdateApt.apt.patient?.name}</span>?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => setStatusUpdateApt(null)}
                    className="py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(statusUpdateApt.apt.id, statusUpdateApt.status);
                      setStatusUpdateApt(null);
                      toast.success(`Appointment ${statusUpdateApt.status} successfully`);
                    }}
                    className={`py-4 px-6 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg ${
                      statusUpdateApt.status === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Day View Modal */}
      <AnimatePresence>
        {selectedCalendarDay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCalendarDay(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{format(selectedCalendarDay, 'MMMM d, yyyy')}</h2>
                    <p className="text-slate-500 font-medium text-sm">Schedule for this day</p>
                  </div>
                  <button 
                    onClick={() => setSelectedCalendarDay(null)}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                  {appointmentsForSelectedDay.length > 0 ? (
                    appointmentsForSelectedDay.map((apt, i) => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setSelectedCalendarDay(null);
                        }}
                        className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-blue-600">
                              {format(new Date(apt.appointment_date), 'h:mm')}
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-900">{user?.role === 'patient' ? apt.doctor?.name : apt.patient?.name}</div>
                              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{apt.reason}</div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            apt.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            apt.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-slate-50 text-slate-600 border-slate-100'
                          }`}>
                            {apt.status}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No appointments scheduled for this day.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Activity className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Details</h2>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">ID: {selectedAppointment.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedAppointment(null)}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <img 
                      src={`https://i.pravatar.cc/150?u=${selectedAppointment.id}`} 
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-sm" 
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                        {user?.role === 'patient' ? 'Doctor' : 'Patient'}
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        {user?.role === 'patient' ? selectedAppointment.doctor?.name : selectedAppointment.patient?.name}
                      </div>
                      {user?.role === 'patient' && (
                        <div className="text-sm font-bold text-blue-600">{selectedAppointment.doctor?.specialty}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <CalendarIcon className="w-3 h-3" /> Date
                      </div>
                      <div className="text-sm font-black text-slate-900">{format(new Date(selectedAppointment.appointment_date), 'MMM d, yyyy')}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Time
                      </div>
                      <div className="text-sm font-black text-slate-900">{format(new Date(selectedAppointment.appointment_date), 'h:mm a')}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Visit</div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm font-medium text-slate-600 leading-relaxed">
                      {selectedAppointment.reason || 'No reason provided.'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</div>
                      <div className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedAppointment.status === 'accepted' ? 'bg-emerald-500' :
                          selectedAppointment.status === 'pending' ? 'bg-orange-500 animate-pulse' : 'bg-slate-400'
                        }`} />
                        {selectedAppointment.status}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {((user?.role === 'patient' && (selectedAppointment.status === 'pending' || selectedAppointment.status === 'accepted')) || 
                        (user?.role === 'doctor' && selectedAppointment.status === 'accepted')) && (
                        <button 
                          onClick={() => {
                            setCancellingApt(selectedAppointment);
                            setSelectedAppointment(null);
                          }}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedAppointment(null)}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
