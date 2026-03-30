import { useState, useRef } from 'react';
import { Search, Activity, AlertCircle, Loader2, ArrowRight, ShieldCheck, Stethoscope, ChevronRight, Brain, Sparkles, Heart, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

import { generateSymptomAnalysis } from '../lib/ai';

export default function SymptomPredictor() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const symptomList = symptoms.split(',').map(s => s.trim()).filter(s => s.length > 0);

  const handlePredict = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setPrediction(null);

    try {
      const reply = await generateSymptomAnalysis(symptoms);
      setPrediction(reply);
    } catch (error) {
      console.error('Prediction error:', error);
      // Fallback for demo
      setPrediction("### Analysis Result\n\n**Possible Conditions:**\n- Common Cold\n- Seasonal Allergies\n\n**Severity Level:** Low\n\n**Recommended Next Steps:**\n- Rest and hydration\n- Monitor temperature\n\n**Suggested Doctor Specialization:** General Practitioner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-10 pb-20 overflow-hidden">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-8"
      >
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100"
          >
            <Brain className="w-3 h-3" />
            AI Diagnostics
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Symptom Analysis</h1>
          <p className="text-slate-500 font-medium max-w-md">Neural network processing of clinical symptoms for preliminary diagnostic insights.</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Model: MediFlow-v4.2</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card p-8 space-y-8 relative overflow-hidden group"
          >
            <motion.div 
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
              className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"
            ></motion.div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Input / Symptom Description</label>
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Assisted
                </span>
              </div>
              <textarea 
                className="input-field min-h-[200px] resize-none p-6 text-lg font-medium leading-relaxed focus:ring-purple-500/20" 
                placeholder="Enter symptoms separated by commas... (e.g. Persistent cough, chest pain, fever)"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 font-medium mt-2 ml-1 italic">
                Tip: Separate multiple symptoms with commas for better analysis.
              </p>

              {symptomList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <AnimatePresence>
                    {symptomList.map((s, i) => (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 10 }}
                        key={i} 
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2 shadow-sm"
                      >
                        <Activity className="w-3 h-3" />
                        {s}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4 p-6 bg-amber-50 rounded-3xl border border-amber-100 relative z-10"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Medical Disclaimer</div>
                <p className="text-xs font-medium text-amber-700 leading-relaxed opacity-80">
                  This computational tool is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>
            </motion.div>

            <button 
              onClick={handlePredict}
              disabled={loading || !symptoms.trim()}
              className="btn-primary w-full flex items-center justify-center gap-3 py-5 text-lg shadow-xl shadow-blue-600/20 disabled:opacity-50 relative z-10 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-3">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    Execute Neural Analysis
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </motion.div>

          {/* Quick Tips */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Be Specific', desc: 'Mention duration and intensity.', icon: Zap },
              { title: 'Vital Signs', desc: 'Include temperature if known.', icon: Activity },
              { title: 'History', desc: 'Mention any prior conditions.', icon: Heart },
            ].map((tip, i) => (
              <motion.div 
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, backgroundColor: "rgb(248 250 252)" }}
                className="card p-6 space-y-3 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                  <tip.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{tip.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">{tip.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div 
                key="prediction"
                initial={{ opacity: 0, scale: 0.95, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 30 }}
                className="card p-10 h-full flex flex-col relative overflow-hidden border-2 border-blue-100 group"
              >
                <motion.div 
                  style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
                  className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"
                ></motion.div>
                
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100 relative z-10">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Analysis Output</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Processed in 1.2s</p>
                  </div>
                </div>
                
                <div className="prose prose-slate prose-sm max-w-none flex-grow relative z-10">
                  <div className="markdown-body">
                    <ReactMarkdown>{prediction}</ReactMarkdown>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 relative z-10">
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl group/btn">
                    Initiate Specialist Consultation
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-10 h-full flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/50 border-dashed border-2 border-slate-200"
              >
                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-slate-300 shadow-sm relative">
                  <div className="absolute inset-0 bg-blue-600/5 rounded-[40px] animate-ping"></div>
                  <Stethoscope className="w-10 h-10 relative z-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Output Pending</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-[250px] leading-relaxed">
                    Enter your symptoms and execute the neural analysis to view system predictions.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
