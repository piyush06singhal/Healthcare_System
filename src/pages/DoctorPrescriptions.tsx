import { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  FileText, 
  Clock, 
  User, 
  ChevronRight,
  Download,
  Printer,
  Mail,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Zap,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addPrescription } from '../store/healthSlice';
import { toast } from 'sonner';

export default function DoctorPrescriptions() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    route: 'Oral',
    refills: '0',
    diagnosis: '',
    notes: '',
    pharmacyNotes: ''
  });
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions();
      fetchPatients();
    }
  }, [user?.id]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          patient:users!patient_id(id, name)
        `)
        .eq('doctor_id', user?.id);
      
      if (error) throw error;
      const patientMap = new Map();
      (data as any[])?.forEach(a => {
        if (a.patient) {
          patientMap.set(a.patient.id, a.patient);
        }
      });
      const uniquePatients = Array.from(patientMap.values()) as { id: string; name: string }[];
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: newPrescription.patientId,
          doctor_id: user.id,
          medication: newPrescription.medication,
          dosage: newPrescription.dosage,
          frequency: newPrescription.frequency,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const prescriptionId = insertedData.id;
      
      const reduxPrescription = {
        id: prescriptionId,
        name: newPrescription.medication,
        dosage: newPrescription.dosage,
        frequency: newPrescription.frequency,
        remaining: 30, // Default for mock
        total: 30,
        doctor: user?.name || 'Dr. Mitchell',
        status: 'Active' as const,
        category: 'Maintenance'
      };

      dispatch(addPrescription(reduxPrescription));

      const newRxEntry = {
        id: prescriptionId,
        date: new Date().toISOString().split('T')[0],
        notes: `${newPrescription.medication} - ${newPrescription.dosage} (${newPrescription.frequency}). Notes: ${newPrescription.notes}`,
        patient: {
          name: patients.find(p => p.id === newPrescription.patientId)?.name || 'Unknown Patient'
        },
        status: 'active',
        medication: newPrescription.medication,
        dosage: newPrescription.dosage
      };
      
      setPrescriptions(prev => [newRxEntry, ...prev]);
      setIsModalOpen(false);
      setNewPrescription({
        patientId: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        route: 'Oral',
        refills: '0',
        diagnosis: '',
        notes: '',
        pharmacyNotes: ''
      });
      toast.success('Prescription issued and synced successfully');
    } catch (error: any) {
      console.error('Error issuing prescription:', error);
      toast.error(error.message || 'Failed to issue prescription');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          id,
          medication,
          dosage,
          frequency,
          status,
          created_at,
          patient:users!patient_id(id, name)
        `)
        .eq('doctor_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Transform for UI consistency if needed
      const transformed = (data || []).map(p => ({
        ...p,
        date: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : 'N/A',
        notes: `${p.medication} (${p.dosage}) - ${p.frequency}`
      }));

      setPrescriptions(transformed);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = p.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (p.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-16 pb-24 px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.25em] shadow-2xl">
              Pharmacy Link
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              {filteredPrescriptions.length} Active Prescriptions
            </div>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Prescription Management</h1>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/60 focus:outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 transition-all w-full lg:w-96 font-medium text-base"
            />
          </div>
          <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            {['all', 'active', 'completed', 'cancelled'].map((status) => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === status ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center gap-4 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Prescription
          </button>
        </div>
      </div>

      {/* New Prescription Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Prescription</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                    <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleCreatePrescription} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient</label>
                      <select 
                        required
                        value={newPrescription.patientId}
                        onChange={(e) => setNewPrescription({...newPrescription, patientId: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm"
                      >
                        <option value="">Select Patient</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diagnosis / ICD-10</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. J01.90 (Acute sinusitis)"
                        value={newPrescription.diagnosis}
                        onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medication</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Amoxicillin"
                        value={newPrescription.medication}
                        onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Route of Administration</label>
                      <select 
                        value={newPrescription.route}
                        onChange={(e) => setNewPrescription({...newPrescription, route: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm"
                      >
                        <option value="Oral">Oral</option>
                        <option value="Intravenous">Intravenous (IV)</option>
                        <option value="Intramuscular">Intramuscular (IM)</option>
                        <option value="Subcutaneous">Subcutaneous</option>
                        <option value="Topical">Topical</option>
                        <option value="Inhalation">Inhalation</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
                      <input 
                        required
                        type="text"
                        placeholder="500mg"
                        value={newPrescription.dosage}
                        onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                      <input 
                        required
                        type="text"
                        placeholder="BID"
                        value={newPrescription.frequency}
                        onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                      <input 
                        required
                        type="text"
                        placeholder="7 days"
                        value={newPrescription.duration}
                        onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Refills</label>
                      <input 
                        type="number"
                        min="0"
                        value={newPrescription.refills}
                        onChange={(e) => setNewPrescription({...newPrescription, refills: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Notes</label>
                      <textarea 
                        rows={2}
                        placeholder="Instructions for the patient..."
                        value={newPrescription.notes}
                        onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pharmacy Instructions</label>
                      <textarea 
                        rows={2}
                        placeholder="Notes for the pharmacist..."
                        value={newPrescription.pharmacyNotes}
                        onChange={(e) => setNewPrescription({...newPrescription, pharmacyNotes: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                    >
                      Issue Prescription
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">
            Syncing Pharmacy Records...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPrescriptions.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-blue-600/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8"
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                    <Pill className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{p.patient?.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        (p.status || 'active') === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        (p.status || 'active') === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {p.status || 'active'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {p.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <Clock className="w-3 h-3" />
                        Refill in 12 days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 lg:max-w-md">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Instructions</div>
                  <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    "{p.notes || 'No specific clinical notes provided for this prescription.'}"
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Zap className="w-3 h-3 text-amber-500" />
                      High Potency
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Shield className="w-3 h-3 text-blue-500" />
                      Verified
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                    <Printer className="w-6 h-6" />
                  </button>
                  <button className="p-5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                    <Download className="w-6 h-6" />
                  </button>
                  <button className="px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-900/20">
                    <FileText className="w-5 h-5" />
                    Full Order
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredPrescriptions.length === 0 && (
            <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Prescriptions Found</h3>
              <p className="text-slate-400 font-medium">Start by creating a new prescription for your patients.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
