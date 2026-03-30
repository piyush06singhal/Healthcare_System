import { useState, useRef } from 'react';
import { Calculator, Scale, Ruler, Flame, Heart, ChevronRight, Activity, Zap, Info, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

export default function HealthCalculators() {
  const [bmi, setBmi] = useState<{ value: number; category: string } | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  
  // BMI State
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // BMR State
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w && h) {
      const val = w / (h * h);
      let cat = '';
      if (val < 18.5) cat = 'Underweight';
      else if (val < 25) cat = 'Normal';
      else if (val < 30) cat = 'Overweight';
      else cat = 'Obese';
      setBmi({ value: parseFloat(val.toFixed(1)), category: cat });
    }
  };

  const calculateBMR = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (w && h && a) {
      let val = 0;
      if (gender === 'male') {
        val = 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        val = 10 * w + 6.25 * h - 5 * a - 161;
      }
      setBmr(Math.round(val));
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
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100"
          >
            <Calculator className="w-3 h-3" />
            Biometric Tools
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Health Calculators</h1>
          <p className="text-slate-500 font-medium max-w-md">Quantitative assessment of physiological metrics and metabolic requirements.</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Precision: High</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* BMI Calculator */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="card p-10 space-y-10 relative overflow-hidden group"
        >
          <motion.div 
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
            className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"
          ></motion.div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">BMI Analysis</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Body Mass Index</p>
            </div>
          </div>
          
          <div className="space-y-8 relative z-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                <div className="relative group/input">
                  <Scale className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                  <input 
                    type="number" 
                    className="input-field pl-14" 
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
                <div className="relative group/input">
                  <Ruler className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                  <input 
                    type="number" 
                    className="input-field pl-14" 
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <button 
              onClick={calculateBMI} 
              className="btn-primary w-full py-5 text-lg shadow-xl shadow-blue-600/20 group/btn"
            >
              Execute Calculation
              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            
            <AnimatePresence>
              {bmi && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 text-center space-y-4 relative overflow-hidden"
                >
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 origin-left"
                  ></motion.div>
                  <div className="text-6xl font-black text-slate-900 tracking-tighter">{bmi.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Calculated Index</div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    bmi.category === 'Normal' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-orange-200 text-orange-600 bg-orange-50'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${bmi.category === 'Normal' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                    {bmi.category}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* BMR Calculator */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="card p-10 space-y-10 relative overflow-hidden group"
        >
          <motion.div 
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
            className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"
          ></motion.div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">BMR Analysis</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Basal Metabolic Rate</p>
            </div>
          </div>
          
          <div className="space-y-8 relative z-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Age (Years)</label>
                <div className="relative group/input">
                  <Activity className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-orange-600 transition-colors" />
                  <input 
                    type="number" 
                    className="input-field pl-14" 
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Biological Sex</label>
                <select 
                  className="input-field cursor-pointer"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={calculateBMR} 
              className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl group/btn"
            >
              Execute Calculation
              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            
            <AnimatePresence>
              {bmr && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 text-center space-y-4 relative overflow-hidden"
                >
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 origin-left"
                  ></motion.div>
                  <div className="text-6xl font-black text-slate-900 tracking-tighter">{bmr}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">KCAL / 24H (Resting)</div>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    Basal Metabolic Requirement
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Info Section */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { title: 'Why BMI?', desc: 'A quick indicator of body fatness based on height and weight.', icon: Info },
          { title: 'BMR Importance', desc: 'The number of calories your body needs to function at rest.', icon: Zap },
          { title: 'Heart Health', desc: 'Maintaining a healthy BMI reduces cardiovascular risks.', icon: Heart },
        ].map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10, backgroundColor: "rgb(248 250 252)" }}
            className="card p-8 space-y-4 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
              <item.icon className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{item.title}</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
