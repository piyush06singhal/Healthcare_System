import { Stethoscope, Activity, FileText, MessageSquare, Calculator, ShieldCheck, ArrowRight, Zap, Heart, Users, Globe, Lock, Cpu, Star, Shield, Search, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ServicesPage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

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

  const gridRef = useRef(null);
  const { scrollYProgress: gridScrollY } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"]
  });
  const gridY = useTransform(gridScrollY, [0, 1], [50, -50]);

  const processRef = useRef(null);
  const { scrollYProgress: processScrollY } = useScroll({
    target: processRef,
    offset: ["start end", "end start"]
  });
  const processY = useTransform(processScrollY, [0, 1], [100, -100]);

  const services = [
    { 
      icon: <Stethoscope className="w-8 h-8 text-blue-500" />, 
      title: "Online Consultations", 
      desc: "Connect with top doctors from the comfort of your home via secure video calls.",
      color: "bg-blue-50",
      glow: "hover:shadow-blue-200/50",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
      path: "/doctors"
    },
    { 
      icon: <Activity className="w-8 h-8 text-emerald-500" />, 
      title: "AI Symptom Checker", 
      desc: "Get instant insights into your health symptoms using our advanced AI engine.",
      color: "bg-emerald-50",
      glow: "hover:shadow-emerald-200/50",
      image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800",
      path: "/dashboard/ai-chat"
    },
    { 
      icon: <FileText className="w-8 h-8 text-purple-500" />, 
      title: "Digital Health Records", 
      desc: "Manage all your medical reports, prescriptions, and history in one secure place.",
      color: "bg-purple-50",
      glow: "hover:shadow-purple-200/50",
      image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800",
      path: "/dashboard/records"
    },
    { 
      icon: <MessageSquare className="w-8 h-8 text-rose-500" />, 
      title: "24/7 AI Assistant", 
      desc: "Our AI chatbot is always available to answer your health-related queries.",
      color: "bg-rose-50",
      glow: "hover:shadow-rose-200/50",
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800",
      path: "/dashboard/ai-chat"
    },
    { 
      icon: <Calculator className="w-8 h-8 text-amber-500" />, 
      title: "Health Calculators", 
      desc: "Track your BMI, BMR, and daily calorie needs with our interactive tools.",
      color: "bg-amber-50",
      glow: "hover:shadow-amber-200/50",
      image: "https://images.unsplash.com/photo-1504813184591-01592fd03cfd?auto=format&fit=crop&q=80&w=800",
      path: "/dashboard/calculators"
    },
    { 
      icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />, 
      title: "Secure Data Privacy", 
      desc: "Your medical data is protected with enterprise-grade encryption and RLS.",
      color: "bg-indigo-50",
      glow: "hover:shadow-indigo-200/50",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      path: "/dashboard/profile"
    },
  ];

  const steps = [
    { title: "Search Specialist", desc: "Find the best doctor for your needs.", icon: <Search className="w-6 h-6" /> },
    { title: "Book Appointment", desc: "Choose a convenient time slot.", icon: <Calendar className="w-6 h-6" /> },
    { title: "Get Consultation", desc: "Talk to your doctor via video call.", icon: <Activity className="w-6 h-6" /> },
    { title: "Follow Up", desc: "Receive prescriptions and advice.", icon: <CheckCircle2 className="w-6 h-6" /> },
  ];

  return (
    <div className="bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <Navbar />
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[100] origin-left"
        style={{ scaleX }}
      />
      
      {/* Hero Section */}
      <section ref={targetRef} className="relative pt-48 pb-32 px-6 overflow-hidden">
        <motion.div style={{ opacity, y: bgY }} className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/40 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </motion.div>

        <motion.div style={{ scale, y: heroTextY }} className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-100 shadow-sm"
          >
            <Star className="w-3 h-3 fill-current" />
            Our Expertise
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8 text-slate-900"
          >
            Clinical Excellence <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">At Your Service.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            We provide a wide range of medical services designed to meet your every need. From AI-driven diagnostics to expert consultations.
          </motion.p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section ref={gridRef} className="py-24 px-6 relative overflow-hidden">
        <motion.div 
          style={{ x: useTransform(gridScrollY, [0, 1], [100, -100]) }}
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-5 pointer-events-none select-none flex items-center"
        >
          <div className="text-[20rem] font-black text-slate-900 whitespace-nowrap uppercase">CLINICAL EXCELLENCE</div>
        </motion.div>
        <motion.div style={{ y: gridY }} className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i % 3 * 0.1, duration: 0.8, ease: "easeOut" }}
                whileHover={{ y: -15 }}
                className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-slate-100 group transition-all duration-500 hover:shadow-2xl hover:shadow-blue-600/10"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={s.image} 
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700" 
                    alt={s.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute top-6 right-6 w-16 h-16 ${s.color} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                    {s.icon}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="p-10">
                  <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium mb-10 text-lg">{s.desc}</p>
                  <Link 
                    to={s.path}
                    className="inline-flex items-center gap-4 px-8 py-4 bg-slate-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm hover:shadow-md"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Process Section */}
      <section ref={processRef} className="py-40 px-6 bg-slate-50 relative overflow-hidden">
        <motion.div 
          style={{ y: useTransform(processScrollY, [0, 1], [0, 200]) }}
          className="absolute top-0 right-0 w-full h-full -z-10 opacity-20 pointer-events-none"
        >
          <div className="text-[25rem] font-black text-blue-900/10 whitespace-nowrap rotate-12">WORKFLOW</div>
        </motion.div>
        <motion.div style={{ y: processY }} className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-200"
            >
              Simple Workflow
            </motion.div>
            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-none">How it Works</h2>
            <p className="text-xl text-slate-500 font-medium mt-6 max-w-2xl mx-auto">Four simple steps to get the world-class care you deserve from our expert medical team.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-12 relative">
            {steps.map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center group"
              >
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-slate-200 -z-10 overflow-hidden">
                    <motion.div 
                      initial={{ x: "-100%" }}
                      whileInView={{ x: "0%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.2 + 0.5 }}
                      className="w-full h-full bg-blue-600"
                    ></motion.div>
                  </div>
                )}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 relative z-10"
                >
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black border-4 border-slate-50 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                    0{i + 1}
                  </div>
                </motion.div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 relative overflow-hidden">
        <motion.div 
          style={{ y: useTransform(pageScrollY, [1500, 3000], [0, 100]) }}
          className="max-w-7xl mx-auto bg-slate-900 rounded-[4rem] p-16 lg:p-32 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]"></div>
          </div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-10">
            <h2 className="text-5xl lg:text-7xl font-black text-white leading-[0.9] tracking-tight">
              Ready to Experience <br />
              <span className="text-blue-500">Modern Healthcare?</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium">
              Join thousands of patients who trust MediFlow for their health needs. Get started today with a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <button className="px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all">
                Book Appointment
              </button>
              <button className="px-10 py-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest border border-white/10 transition-all">
                Contact Support
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
