import { Activity, Shield, Users, Globe, Heart, Zap, ArrowRight, Star, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';

export default function AboutPage() {
  const { scrollYProgress } = useScroll();

  const { scrollYProgress: pageScrollY } = useScroll();
  const scaleX = useSpring(pageScrollY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const { scrollYProgress: missionScrollY } = useScroll();
  const missionY = useTransform(missionScrollY, [0, 1], [100, -100]);

  const { scrollYProgress: valuesScrollY } = useScroll();
  const valuesY = useTransform(valuesScrollY, [0, 1], [50, -50]);

  const stats = [
    { label: "Data Points Processed", value: "12M+", icon: <Cpu className="w-5 h-5" /> },
    { label: "Clinical Partners", value: "450+", icon: <Users className="w-5 h-5" /> },
    { label: "Avg. System Latency", value: "15ms", icon: <Zap className="w-5 h-5" /> },
    { label: "Global Reach", value: "180+", icon: <Globe className="w-5 h-5" /> }
  ];

  return (
    <div className="bg-white min-h-screen transition-colors duration-300 overflow-hidden">
      <Navbar />
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[100] origin-left"
        style={{ scaleX }}
      />
      
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <motion.div style={{ opacity, y: bgY }} className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </motion.div>

        <motion.div style={{ scale, y: heroTextY }} className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-100 shadow-sm"
            >
              <Star className="w-3 h-3 fill-current" />
              01 / Our Vision
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-12 text-slate-900"
            >
              The Technical <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600">Standard.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium"
            >
              MediFlow AI was established to bridge the gap between advanced medical intelligence and clinical practice. We build the infrastructure for the next generation of healthcare.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
                alt="Vision"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-32 px-6 bg-slate-50/50 overflow-hidden relative">
        <motion.div 
          style={{ x: useTransform(missionScrollY, [0, 1], [-100, 100]) }}
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-5 pointer-events-none select-none flex items-center"
        >
          <div className="text-[20rem] font-black text-slate-900 whitespace-nowrap">OUR MEDICAL MISSION</div>
        </motion.div>
        <motion.div style={{ y: missionY }} className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-purple-100">
              02 / Mission Architecture
            </div>
            
            <div className="space-y-12">
              {[
                { 
                  icon: <Globe className="w-6 h-6" />, 
                  title: "Global Infrastructure", 
                  desc: "Deploying medical expertise across distributed networks to ensure universal access to precision diagnostics.",
                  color: "text-blue-600",
                  bg: "bg-blue-100"
                },
                { 
                  icon: <Zap className="w-6 h-6" />, 
                  title: "Clinical Efficiency", 
                  desc: "Optimizing clinical workflows through high-performance AI models and automated medical processing.",
                  color: "text-rose-600",
                  bg: "bg-rose-100"
                },
                { 
                  icon: <Shield className="w-6 h-6" />, 
                  title: "Data Integrity", 
                  desc: "Ensuring end-to-end encryption and role-based access control for all medical data assets.",
                  color: "text-emerald-600",
                  bg: "bg-emerald-100"
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-8 group"
                >
                  <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200" 
                className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" 
                alt="Medical Research"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 glass-card p-8 rounded-[2rem] z-20 hidden md:block glow-primary">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Research Ref</div>
                  <div className="text-lg font-black text-slate-900">LAB_RESEARCH_A</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Core Values Section */}
      <section className="py-32 px-6 bg-slate-900 overflow-hidden relative">
        <motion.div 
          style={{ y: useTransform(valuesScrollY, [0, 1], [0, 200]) }}
          className="absolute top-0 right-0 w-full h-full -z-10 opacity-10 pointer-events-none"
        >
          <div className="text-[25rem] font-black text-blue-400/10 whitespace-nowrap rotate-12">EXCELLENCE</div>
        </motion.div>
        <motion.div style={{ y: valuesY }} className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-500/20">
              03 / Our Values
            </div>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-white">Principles of Excellence</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Clinical Precision", 
                desc: "We prioritize accuracy above all else, ensuring our AI models are validated against the highest medical standards.",
                icon: <Activity className="w-8 h-8 text-blue-400" />
              },
              { 
                title: "Patient Centricity", 
                desc: "Every line of code we write is designed to improve patient outcomes and simplify the care journey.",
                icon: <Heart className="w-8 h-8 text-rose-400" />
              },
              { 
                title: "Ethical Innovation", 
                desc: "We lead with transparency and ethics, ensuring AI is used responsibly and equitably across all populations.",
                icon: <Shield className="w-8 h-8 text-emerald-400" />
              }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="mb-8 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{value.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-block px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-100">
              04 / System Scale
            </div>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900">Performance Metrics</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-10">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-10 rounded-[2.5rem] text-center group hover:glow-primary transition-all"
              >
                <div className="w-14 h-14 bg-slate-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-[4rem] p-16 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10">
            <h2 className="text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-none">Join the Network</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
              Partner with us to redefine the technical standards of healthcare delivery. Together, we can build a healthier future.
            </p>
            <Link to="/contact" className="btn-primary px-12 py-6 text-lg group inline-flex items-center gap-4">
              Contact Engineering
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
