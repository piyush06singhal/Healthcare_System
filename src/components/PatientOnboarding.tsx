import { 
  User, 
  Droplets, 
  Activity, 
  Wind, 
  Thermometer, 
  ArrowRight, 
  Sparkles,
  Shield,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PatientOnboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: '',
    conditions: ''
  });

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else {
      toast.success('Clinical profile synchronized.');
      onComplete();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-3xl"
    >
      <div className="w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-12 lg:p-16">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-blue-600/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Health Intake</h2>
                <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Step {step} of 3</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-blue-600' : 'w-4 bg-slate-100'}`} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Basic Info</h3>
                  <p className="text-slate-500 text-sm font-medium">Verify your medical markers for accurate diagnostics.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Blood Type</label>
                    <select 
                      value={data.bloodGroup}
                      onChange={(e) => setData({ ...data, bloodGroup: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                    >
                      <option value="">Select Type</option>
                      <option value="A+">A Positive</option>
                      <option value="A-">A Negative</option>
                      <option value="O+">O Positive</option>
                      <option value="O-">O Negative</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Condition</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hypertension"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Allergy Sensitivity</h3>
                  <p className="text-slate-500 text-sm font-medium">List any allergies or adverse reactions to cross-reference prescriptions.</p>
                </div>
                <textarea 
                  rows={4}
                  placeholder="e.g. Penicillin, Peanuts, Pollen..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-blue-100">
                  <Shield className="w-12 h-12 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Privacy Synchronization</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md mx-auto">
                    Your data is protected by hospital-grade AES-256 encryption. Only your authorized clinical team can decrypt these records.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-16 flex items-center justify-between">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest disabled:opacity-0 transition-all"
            >
              Previous
            </button>
            <button 
              onClick={nextStep}
              className="px-10 py-5 bg-slate-950 text-white rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3"
            >
              {step === 3 ? 'Complete Profile' : 'Next Step'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
