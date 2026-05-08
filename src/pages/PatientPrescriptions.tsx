import { 
  Pill, 
  Clock, 
  Calendar, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Droplets,
  Activity,
  History,
  Info,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { takeDose, addNotification } from '../store/healthSlice';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import GenericModal from '../components/GenericModal';

export default function PatientPrescriptions() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [refillData, setRefillData] = useState({ scriptId: '', urgency: 'Normal' });
  const [refillRequests, setRefillRequests] = useState<any[]>([]);
  const [dbPrescriptions, setDbPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchPrescriptions = async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setDbPrescriptions(data);
      }
    };

    const fetchRefills = async () => {
      const { data } = await supabase
        .from('refill_requests')
        .select('*, prescriptions(medication)')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setRefillRequests(data);
    };

    fetchPrescriptions();
    fetchRefills();

    const prescriptionsChannel = supabase
      .channel('prescriptions_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'prescriptions',
        filter: `patient_id=eq.${user.id}`
      }, fetchPrescriptions)
      .subscribe();

    const refillsChannel = supabase
      .channel('refills_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'refill_requests', 
        filter: `patient_id=eq.${user.id}` 
      }, fetchRefills)
      .subscribe();
    
    return () => { 
      supabase.removeChannel(prescriptionsChannel);
      supabase.removeChannel(refillsChannel);
    };
  }, [user]);

  const prescriptions = useMemo(() => {
    return dbPrescriptions.map(p => ({
      id: p.id,
      name: p.medication,
      category: 'In-Patient Protocol',
      dosage: p.dosage,
      frequency: p.frequency,
      doctor: 'Dr. Sarah Mitchell',
      status: p.status === 'Active' ? 'Active' : 'Pending',
      remaining: 10, // Simulated logic if not in DB
      total: 30
    }));
  }, [dbPrescriptions]);

  const handleTakeDose = async (id: string, name: string) => {
    try {
      if (!user) return;

      // 1. Log the adherence entry
      const { error: logError } = await supabase
        .from('medication_adherence')
        .insert([{
          prescription_id: id,
          patient_id: user.id,
          status: 'taken',
          taken_at: new Date().toISOString()
        }]);

      if (logError) throw logError;

      // 2. Update prescription record
      const { error: updateError } = await supabase
        .from('prescriptions')
        .update({
          last_dose_taken: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Optimistic Update
      setDbPrescriptions(prev => prev.map(p => 
        p.id === id ? { ...p, remaining: Math.max(0, (p.remaining || 10) - 1), last_dose_taken: new Date().toISOString() } : p
      ));
      
      dispatch(takeDose(id));
      toast.success(`Dose tracked for ${name}. Stability update sent to clinic.`, {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      });
    } catch (error: any) {
      console.error("Adherence Log Error:", error);
      toast.error("Failed to sync dose tracking. Please check connection.");
    }
  };

  const handleRequestRefill = async () => {
    if (!refillData.scriptId) {
      toast.error('Please select a medication protocol for re-supply.');
      return;
    }

    if (!user) return;

    const med = prescriptions.find(p => p.id === refillData.scriptId);
    
    try {
      const { error } = await supabase.from('refill_requests').insert([{
        prescription_id: refillData.scriptId,
        patient_id: user.id,
        priority: refillData.urgency.toLowerCase(),
        status: 'pending'
      }]);

      if (error) throw error;

      dispatch(addNotification({
        id: `notif-${Date.now()}`,
        title: 'Refill Protocol Initialized',
        message: `A supply request for ${med?.name} has been dispatched to ${med?.doctor}.`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false
      }));

      toast.success(`Refill request for ${med?.name} sent to clinical pharmacy.`);
      setIsRefillModalOpen(false);
    } catch (error) {
      console.error("Refill error:", error);
      toast.error("Failed to synchronize refill request with clinical cloud.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
              Active Pharmacy
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Synced with Pharmacy
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Medications</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Manage dosages, refills, and adherence protocols.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="px-8 py-5 bg-white border border-slate-200 text-slate-900 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3"
          >
            <History className="w-5 h-5" />
            Full History
          </button>
          <button 
            onClick={() => setIsRefillModalOpen(true)}
            className="px-8 py-5 bg-blue-600 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            Request Refill
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="popLayout">
            {prescriptions.map((px) => (
              <motion.div
                key={px.id}
                layout
                variants={itemVariants}
                className="group bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-lg ${
                      px.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <Pill className="w-10 h-10" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{px.name}</h3>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {px.category}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-slate-400 mb-4">{px.dosage} • {px.frequency}</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                         <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinic Source</div>
                            <div className="text-xs font-bold text-blue-600">{px.doctor}</div>
                         </div>
                         <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current State</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(px.remaining / px.total) * 100}%` }}
                                  className={`h-full rounded-full ${px.remaining < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-900">{px.remaining}/{px.total}</span>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button 
                      onClick={() => handleTakeDose(px.id, px.name)}
                      disabled={px.remaining === 0}
                      className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                    >
                      Log Dose
                    </button>
                    <button className="w-full sm:w-auto p-5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-[2rem] transition-all">
                      <Info className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {px.remaining < 5 && (
                  <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">Low supply: Refill optimized for priority dispatch</span>
                  </div>
                )}
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-10">
          <motion.div 
            variants={itemVariants}
            className="bg-slate-950 rounded-[3.5rem] p-10 shadow-2xl text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-black mb-4">Safety Protocol</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8">
                Your AI assistant is cross-referencing your prescriptions with your health data to prevent interactions.
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Interaction Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-100"
          >
             <h3 className="text-xl font-black text-slate-900 mb-8">Refill Logistics</h3>
             <div className="space-y-6">
                {refillRequests.length === 0 ? (
                  <p className="text-[10px] font-medium text-slate-400 italic text-center">No active logistics requests</p>
                ) : (
                  refillRequests.map(req => (
                    <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {req.created_at && !isNaN(new Date(req.created_at).getTime()) ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                          req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Refill: {req.prescriptions?.medication || 'Protocol'}
                      </div>
                    </div>
                  ))
                )}
             </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-100"
          >
             <h3 className="text-xl font-black text-slate-900 mb-8">Daily Adherence</h3>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-500 uppercase">Streak</span>
                   <span className="text-lg font-black text-blue-600">12 Days</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-blue-600 rounded-full" />
                </div>
                <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                  You are in the top 5% of patients for protocol compliance. Keep it up!
                </p>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Refill Modal */}
      <GenericModal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        title="Pharmacy Request"
        description="Request a medication refill"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Medication Protocol</label>
            <div className="grid grid-cols-1 gap-3">
              {prescriptions.map(med => (
                <button
                  key={med.id}
                  onClick={() => setRefillData(prev => ({ ...prev, scriptId: med.id }))}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                    refillData.scriptId === med.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Pill className={`w-5 h-5 ${refillData.scriptId === med.id ? 'text-blue-500' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{med.name}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{med.dosage}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</div>
                    <div className={`text-xs font-black ${med.remaining < 5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {med.remaining}/{med.total}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Priority Level</label>
            <div className="flex gap-3">
              {['Normal', 'Urgent', 'Life-Critical'].map(level => (
                <button
                  key={level}
                  onClick={() => setRefillData(prev => ({ ...prev, urgency: level }))}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    refillData.urgency === level 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
            <Stethoscope className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-[10px] font-medium text-blue-700 leading-relaxed">
              Verification will be requested from your prescribing physician. Priority requests will be processed as quickly as possible.
            </p>
          </div>

          <button 
            onClick={handleRequestRefill}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
          >
            Dispatch Supply Request
          </button>
        </div>
      </GenericModal>
    </motion.div>
  );
}
