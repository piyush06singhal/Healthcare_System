import { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  AlertCircle, 
  Filter,
  Package,
  Truck,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PharmacyDashboard() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      // In a real app, we'd fetch from a 'prescriptions' table
      // For now, we'll mock some data based on appointments with notes
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          notes,
          patient:users!patient_id(id, name),
          doctor:users!doctor_id(id, name)
        `)
        .not('notes', 'is', null)
        .order('date', { ascending: false });
      
      if (error) throw error;

      // Add mock status and medication details
      const enrichedData = (data || []).map(p => ({
        ...p,
        status: ['pending', 'processing', 'ready', 'picked_up'][Math.floor(Math.random() * 4)],
        medication: p.notes?.split('-')[0]?.trim() || 'General Medication',
        dosage: '500mg',
        priority: Math.random() > 0.8 ? 'Urgent' : 'Normal'
      }));

      setPrescriptions(enrichedData);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to sync pharmacy records');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setPrescriptions(prev => prev.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
    toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = p.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.medication?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Pending', count: prescriptions.filter(p => p.status === 'pending').length, icon: <Clock className="w-5 h-5 text-amber-500" />, color: 'amber' },
    { label: 'Processing', count: prescriptions.filter(p => p.status === 'processing').length, icon: <Package className="w-5 h-5 text-blue-500" />, color: 'blue' },
    { label: 'Ready', count: prescriptions.filter(p => p.status === 'ready').length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: 'emerald' },
    { label: 'Total Today', count: prescriptions.length, icon: <ClipboardList className="w-5 h-5 text-slate-500" />, color: 'slate' },
  ];

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      initial="hidden"
      animate="visible"
      className="space-y-16 pb-24 px-4 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/30">
              Pharmacy Portal
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              Live Inventory Sync
            </div>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Fulfillment</h1>
          <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">Manage and track prescription fulfillment in real-time. Ensure accurate and timely medication delivery.</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search by patient or RX ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/60 focus:outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 transition-all w-full lg:w-96 font-medium text-slate-900"
            />
          </div>
          <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            {['all', 'pending', 'processing', 'ready'].map((status) => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === status ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              <div className="text-2xl font-black text-slate-900">{stat.count}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">
            Accessing Secure RX Database...
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
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner ${
                    p.status === 'ready' ? 'bg-emerald-50 text-emerald-600' :
                    p.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <Pill className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{p.patient?.name}</h3>
                      {p.priority === 'Urgent' && (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-rose-100 animate-pulse">
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        RX-{p.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        Dr. {p.doctor?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 lg:max-w-md">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Medication Details</div>
                  <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-slate-900">{p.medication}</span>
                      <span className="text-xs font-bold text-blue-600">{p.dosage}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 italic">
                      {p.notes || 'Standard clinical protocol instructions apply.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {p.status === 'pending' && (
                    <button 
                      onClick={() => handleStatusUpdate(p.id, 'processing')}
                      className="px-8 py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20"
                    >
                      <Package className="w-5 h-5" />
                      Start Processing
                    </button>
                  )}
                  {p.status === 'processing' && (
                    <button 
                      onClick={() => handleStatusUpdate(p.id, 'ready')}
                      className="px-8 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-3 shadow-xl shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Mark as Ready
                    </button>
                  )}
                  {p.status === 'ready' && (
                    <div className="flex items-center gap-3">
                      <div className="px-6 py-5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-3">
                        <Truck className="w-5 h-5" />
                        Ready for Pickup
                      </div>
                      <button 
                        onClick={() => handleStatusUpdate(p.id, 'picked_up')}
                        className="p-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                      >
                        <ShieldCheck className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                  {p.status === 'picked_up' && (
                    <div className="px-8 py-5 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5" />
                      Order Fulfilled
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredPrescriptions.length === 0 && (
            <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Orders Found</h3>
              <p className="text-slate-400 font-medium">There are no prescriptions matching your current filter.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
