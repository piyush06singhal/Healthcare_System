import { 
  ClipboardList, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  ArrowRight,
  Plus,
  Shield,
  Sparkles,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addNotification } from '../store/healthSlice';
import { toast } from 'sonner';
import { useState } from 'react';
import GenericModal from '../components/GenericModal';

export default function PatientTreatments() {
  const { treatments } = useSelector((state: RootState) => state.health);
  const dispatch = useDispatch();
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [protocolData, setProtocolData] = useState({ condition: '', priority: 'Standard' });

  const handleRequestProtocol = () => {
    if (!protocolData.condition) {
      toast.error('Please specify the clinical area for the new protocol.');
      return;
    }

    dispatch(addNotification({
      id: `notif-protocol-${Date.now()}`,
      title: 'Protocol Analysis Initialized',
      message: `A request for a new treatment blueprint regarding "${protocolData.condition}" has been logged. Neural generation starting within 1-2 clinical hours.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    }));

    toast.success(`Request for "${protocolData.condition}" protocol submitted. Neural core processing...`);
    setIsProtocolModalOpen(false);
    setProtocolData({ condition: '', priority: 'Standard' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
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
              Clinical Registry
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              Verified Protocol
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Treatment History</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Detailed clinical progression of your health journey.</p>
        </div>
        <button 
          onClick={() => setIsProtocolModalOpen(true)}
          className="px-8 py-5 bg-slate-900 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Request New Protocol
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="popLayout">
            {treatments.map((treatment) => (
              <motion.div
                key={treatment.id}
                layout
                variants={itemVariants}
                className="group bg-white rounded-[3.5rem] p-8 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                    <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-lg ${
                      treatment.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                      treatment.status === 'Ongoing' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {treatment.status === 'Completed' ? <CheckCircle2 className="w-10 h-10" /> : <Activity className="w-10 h-10 animate-pulse" />}
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{treatment.condition}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          treatment.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
                          treatment.status === 'Ongoing' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {treatment.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Started: {treatment.date}
                        </div>
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <Stethoscope className="w-3 h-3" />
                          {treatment.doctor}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="px-6 py-4 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    View Blueprint
                  </button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinical Execution Notes</div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {treatment.notes}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`absolute -right-8 -bottom-8 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none ${
                    treatment.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          <motion.div 
            variants={itemVariants}
            className="bg-slate-950 rounded-[3.5rem] p-10 shadow-2xl text-white relative overflow-hidden group"
          >
            <div className="relative z-10 text-center">
              <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-6" />
              <h3 className="text-xl font-black mb-4">Neural Recovery Optimization</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8">
                 treatment efficacy is currently synced at <span className="text-white font-bold">92% stability</span>.
              </p>
              <button 
                onClick={() => toast.success('Neural optimization sequence started. Protocol adjustment imminent.')}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
              >
                Optimize Schedule
              </button>
            </div>
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-100"
          >
            <h3 className="text-xl font-black text-slate-900 mb-8">Health Invariants</h3>
            <div className="space-y-6">
              {[
                { label: 'Allergies', value: 'Penicillin, Latex', color: 'rose' },
                { label: 'Blood Group', value: 'O Positive', color: 'blue' },
                { label: 'Emergency Contact', value: 'John S. (Sibling)', color: 'amber' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</div>
                  <div className={`text-sm font-black text-${item.color}-600`}>{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Protocol Modal */}
      <GenericModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
        title="Protocol Acquisition"
        description="Request a new medical intervention blueprint"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Clinical Objective</label>
            <input 
              type="text" 
              placeholder="E.g. Cognitive Enhancement, Cardio-Health, Post-Op Recovery..."
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-300"
              value={protocolData.condition}
              onChange={(e) => setProtocolData(prev => ({ ...prev, condition: e.target.value }))}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Request Priority</label>
            <div className="flex gap-3">
              {['Standard', 'Accelerated', 'Critical-Path'].map(p => (
                <button
                  key={p}
                  onClick={() => setProtocolData(prev => ({ ...prev, priority: p }))}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    protocolData.priority === p 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-[2rem] border border-white/5 space-y-4">
             <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Analysis Active</span>
             </div>
             <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
               MediFlow AI will synthesize your historical biometrics with global peer-reviewed data to generate a custom recovery roadmap.
             </p>
          </div>

          <button 
            onClick={handleRequestProtocol}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
          >
            <FileText className="w-5 h-5" />
            Initialize Protocol Generation
          </button>
        </div>
      </GenericModal>
    </motion.div>
  );
}
