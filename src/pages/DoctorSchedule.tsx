import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Trash2,
  Clock,
  Plus,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  History as HistoryIcon,
  XCircle,
  CalendarDays,
  Settings,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
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
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function DoctorSchedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [customSlot, setCustomSlot] = useState('');
  const [isPublished, setIsPublished] = useState<Record<string, boolean>>({});
  const [isBlocked, setIsBlocked] = useState<Record<string, boolean>>({});
  const [recurringRule, setRecurringRule] = useState({
    days: [] as number[],
    startTime: '09:00',
    endTime: '17:00',
    interval: 60
  });
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.id) {
      fetchAvailability();
    }
  }, [user?.id]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', user?.id);
      
      if (error) throw error;
      
      const availabilityMap: Record<string, string[]> = {};
      const publishedMap: Record<string, boolean> = {};
      const blockedMap: Record<string, boolean> = {};
      data?.forEach(item => {
        if (item.slots === null) {
          blockedMap[item.date] = true;
        } else {
          availabilityMap[item.date] = item.slots;
          publishedMap[item.date] = item.is_published || false;
        }
      });
      setAvailability(availabilityMap);
      setIsPublished(publishedMap);
      setIsBlocked(blockedMap);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleSaveSchedule = async (date?: Date) => {
    if (!user?.id) return;
    
    const targetDate = date || selectedDate;
    try {
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const slots = isBlocked[dateStr] ? null : (availability[dateStr] || []);
      
      const { error } = await supabase
        .from('doctor_availability')
        .upsert({
          doctor_id: user.id,
          date: dateStr,
          slots: slots,
          is_published: isPublished[dateStr] || false
        }, { onConflict: 'doctor_id,date' });

      if (error) throw error;

      if (!date) {
        toast.success('Schedule saved successfully', {
          description: `Your availability for ${format(targetDate, 'MMMM d')} has been updated.`,
        });
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      if (!date) toast.error('Failed to save schedule');
    }
  };

  const applyRecurringRule = async () => {
    if (!user?.id) return;
    
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(addMonths(currentMonth, 2)); // Apply for 3 months
    const days = eachDayOfInterval({ start, end });
    
    const newAvailability = { ...availability };
    const newPublished = { ...isPublished };
    
    let count = 0;
    for (const day of days) {
      if (recurringRule.days.includes(day.getDay())) {
        const dateStr = format(day, 'yyyy-MM-dd');
        if (isBlocked[dateStr]) continue;

        const slots: string[] = [];
        let current = new Date(`2000-01-01T${recurringRule.startTime}`);
        const endT = new Date(`2000-01-01T${recurringRule.endTime}`);
        
        while (current < endT) {
          slots.push(format(current, 'HH:mm'));
          current = new Date(current.getTime() + recurringRule.interval * 60000);
        }
        
        newAvailability[dateStr] = slots;
        newPublished[dateStr] = true;
        count++;
        
        // Save to DB
        await supabase.from('doctor_availability').upsert({
          doctor_id: user.id,
          date: dateStr,
          slots: slots,
          is_published: true
        }, { onConflict: 'doctor_id,date' });
      }
    }
    
    setAvailability(newAvailability);
    setIsPublished(newPublished);
    toast.success('Recurring Rules Applied', {
      description: `Generated slots for ${count} days over the next 3 months.`,
    });
  };

  const toggleBlockDay = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const newBlocked = !isBlocked[dateStr];
    setIsBlocked(prev => ({ ...prev, [dateStr]: newBlocked }));
    if (newBlocked) {
      setAvailability(prev => {
        const next = { ...prev };
        delete next[dateStr];
        return next;
      });
    }
    await handleSaveSchedule();
    toast.info(newBlocked ? 'Day Blocked' : 'Day Unblocked');
  };

  const handlePublish = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setIsPublished(prev => ({ ...prev, [dateStr]: true }));
    await handleSaveSchedule();
    toast.success('Availability Published', {
      description: 'Patients can now book these slots.',
    });
  };

  const addCustomSlot = () => {
    if (!customSlot || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(customSlot)) {
      toast.error('Invalid time format (HH:MM)');
      return;
    }
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    if (availability[dateStr]?.includes(customSlot)) {
      toast.error('Slot already exists');
      return;
    }
    setAvailability(prev => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), customSlot].sort()
    }));
    setCustomSlot('');
  };

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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-16 pb-24 px-4 lg:px-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Schedule Management</h1>
          <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">Define your consultation hours and manage your availability. Sync your clinical calendar with patient booking systems.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-3 shadow-2xl shadow-emerald-200/50">
            <Shield className="w-4 h-4" />
            Auto-Sync Enabled
          </div>
        </div>
      </div>

      <motion.div 
        variants={itemVariants}
        className="rounded-[4rem] bg-white shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
      >
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Availability Calendar</h3>
            <p className="text-sm text-slate-400 font-medium">Select a date to manage its time slots</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="text-sm font-black text-slate-900 uppercase tracking-widest px-6 min-w-[200px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-10 grid lg:grid-cols-2 gap-16">
          {/* Calendar Grid */}
          <div className="space-y-8">
            <div className="grid grid-cols-7 gap-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const slots = availability[dateStr] || [];
                const hasSlots = slots.length > 0;
                const published = isPublished[dateStr];

                return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-[1.5rem] flex flex-col items-center justify-center relative transition-all border-2 ${
                    !isCurrentMonth ? 'opacity-20' : 'opacity-100'
                  } ${
                    isSelected 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200 scale-105 z-10' 
                      : isBlocked[dateStr]
                      ? 'bg-rose-50 text-rose-400 border-rose-100'
                      : 'bg-white text-slate-900 border-slate-50 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                >
                  <span className="text-base font-black tracking-tight">{format(day, 'd')}</span>
                  {isBlocked[dateStr] ? (
                    <XCircle className="w-3 h-3 absolute bottom-2 text-rose-400" />
                  ) : hasSlots && (
                    <div className={`absolute bottom-2 px-1.5 py-0.5 rounded-full text-[8px] font-black ${
                      isSelected ? 'bg-white text-blue-600' : published ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {slots.length}
                    </div>
                  )}
                </button>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                Selected
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 rounded-full" />
                Draft Slots
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-100 rounded-full" />
                Published
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-100 rounded-full" />
                Blocked
              </div>
            </div>

            {/* Recurring Rules Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 text-blue-600" />
                  Recurring Rules
                </h4>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const days = recurringRule.days.includes(i)
                        ? recurringRule.days.filter(d => d !== i)
                        : [...recurringRule.days, i];
                      setRecurringRule({ ...recurringRule, days });
                    }}
                    className={`w-full aspect-square rounded-xl text-[10px] font-black transition-all ${
                      recurringRule.days.includes(i)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                  <input 
                    type="time" 
                    value={recurringRule.startTime}
                    onChange={(e) => setRecurringRule({ ...recurringRule, startTime: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                  <input 
                    type="time" 
                    value={recurringRule.endTime}
                    onChange={(e) => setRecurringRule({ ...recurringRule, endTime: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>
              <button 
                onClick={applyRecurringRule}
                disabled={recurringRule.days.length === 0}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Recurring Rules
              </button>
            </div>
          </div>

          {/* Slot Management */}
          <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100 shadow-inner">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    {format(selectedDate, 'EEEE')}
                  </div>
                  {isPublished[format(selectedDate, 'yyyy-MM-dd')] && (
                    <div className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                      Live
                    </div>
                  )}
                  {isBlocked[format(selectedDate, 'yyyy-MM-dd')] && (
                    <div className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                      Blocked
                    </div>
                  )}
                </div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h4>
              </div>
              <button 
                onClick={toggleBlockDay}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isBlocked[format(selectedDate, 'yyyy-MM-dd')]
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                    : 'bg-white text-rose-600 border border-rose-100 hover:bg-rose-50'
                }`}
              >
                {isBlocked[format(selectedDate, 'yyyy-MM-dd')] ? 'Unblock Day' : 'Block Day'}
              </button>
            </div>

            {isBlocked[format(selectedDate, 'yyyy-MM-dd')] ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600">
                  <XCircle className="w-10 h-10" />
                </div>
                <div>
                  <h5 className="text-lg font-black text-slate-900">This day is blocked</h5>
                  <p className="text-xs text-slate-400 font-medium">No appointments can be scheduled on this date.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-3 mb-10">
                  <button 
                    onClick={() => {
                      const dateStr = format(selectedDate, 'yyyy-MM-dd');
                      setAvailability(prev => ({ ...prev, [dateStr]: ['09:00', '10:00', '11:00', '12:00'] }));
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                  >
                    Morning
                  </button>
                  <button 
                    onClick={() => {
                      const dateStr = format(selectedDate, 'yyyy-MM-dd');
                      setAvailability(prev => ({ ...prev, [dateStr]: ['13:00', '14:00', '15:00', '16:00', '17:00'] }));
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                  >
                    Afternoon
                  </button>
                </div>

                {/* Custom Slot Input */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="relative flex-1">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={customSlot}
                      onChange={(e) => setCustomSlot(e.target.value)}
                      placeholder="Add custom slot (HH:MM)" 
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                    />
                  </div>
                  <button 
                    onClick={addCustomSlot}
                    className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {timeSlots.concat((availability[format(selectedDate, 'yyyy-MM-dd')] || []).filter(s => !timeSlots.includes(s))).sort().map((slot) => {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const isActive = availability[dateStr]?.includes(slot);

                    return (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(dateStr, slot)}
                        className={`py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                          isActive 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-200 scale-105' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          {slot}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleSaveSchedule()}
                      className="flex-1 py-5 bg-white border-2 border-slate-900 text-slate-900 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                    >
                      <Save className="w-5 h-5" />
                      Save Draft
                    </button>
                    <button 
                      onClick={() => {
                        const dateStr = format(selectedDate, 'yyyy-MM-dd');
                        setAvailability(prev => ({ ...prev, [dateStr]: [] }));
                        setIsPublished(prev => ({ ...prev, [dateStr]: false }));
                      }}
                      className="p-5 bg-white border-2 border-slate-200 text-rose-600 rounded-[2rem] hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                  <button 
                    onClick={handlePublish}
                    className="w-full py-5 bg-slate-900 text-blue-400 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20"
                  >
                    <Zap className="w-5 h-5" />
                    Publish Availability
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
