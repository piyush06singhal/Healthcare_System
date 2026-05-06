import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';
import { ArrowRight, Shield, Zap, Heart, Activity, Users, Star, Globe, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
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
  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const { scrollYProgress: featuresScrollY } = useScroll();
  const featuresBgY = useTransform(featuresScrollY, [0, 1], ["-10%", "10%"]);
  const featuresScale = useTransform(featuresScrollY, [0, 0.5, 1], [0.9, 1, 0.9]);

  const { scrollYProgress: storiesScrollY } = useScroll();
  const storiesBgY = useTransform(storiesScrollY, [0, 1], ["-20%", "20%"]);

  const features = [
    { 
      icon: <Zap className="w-8 h-8 text-blue-500" />, 
      title: "AI Symptom Prediction", 
      desc: "Advanced medical AI to predict potential conditions based on your symptoms with accuracy.",
      color: "bg-blue-50",
      glow: "hover:glow-primary"
    },
    { 
      icon: <Shield className="w-8 h-8 text-purple-500" />, 
      title: "Secure Health Records", 
      desc: "Encrypted medical data management with role-based access control and secure storage.",
      color: "bg-purple-50",
      glow: "hover:glow-secondary"
    },
    { 
      icon: <Heart className="w-8 h-8 text-rose-500" />, 
      title: "Personalized Care", 
      desc: "Customized health plans and reminders tailored to your medical history and lifestyle.",
      color: "bg-rose-50",
      glow: "hover:shadow-rose-200/50"
    },
    { 
      icon: <Users className="w-8 h-8 text-emerald-500" />, 
      title: "Expert Doctors", 
      desc: "Connect with verified medical professionals across various specializations in minutes.",
      color: "bg-emerald-50",
      glow: "hover:shadow-emerald-200/50"
    },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white overflow-hidden selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      <Navbar />
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[100] origin-left"
        style={{ scaleX }}
      />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Parallax Background Elements */}
        <motion.div style={{ opacity, y: bgY }} className="absolute inset-0 -z-10">
          <div className="absolute top-[5%] left-[15%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-[10%] right-[20%] w-[30%] h-[30%] bg-rose-100/40 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </motion.div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            style={{ y: heroTextY, opacity }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8 text-slate-900">
              Trusted Care for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">Every Family</span>
            </h1>
            <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-lg font-medium">
              Experience healthcare redefined. MediFlow provides personalized, technology-driven medical services with a focus on your well-being.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl text-lg font-black transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95 flex items-center gap-3 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">Book Appointment</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ y: heroImageY, rotate }}
            className="relative"
          >
            {/* Floating Icons */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center z-20 hidden lg:flex"
            >
              <Heart className="w-10 h-10 text-rose-500" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-10 -left-10 w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center z-20 hidden lg:flex"
            >
              <Shield className="w-10 h-10 text-blue-600" />
            </motion.div>
            
            <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" 
                className="w-full h-auto" 
                alt="Professional Doctor"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Floating Cards */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -left-12 glass-card p-6 rounded-3xl z-20 hidden lg:block shadow-xl border border-white/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">Live Queue</div>
                  <div className="text-xs font-bold text-slate-500">2 Patients Waiting</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-10 -right-12 glass-card p-6 rounded-3xl z-20 hidden lg:block shadow-xl border border-white/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">Top Rated</div>
                  <div className="text-xs font-bold text-slate-500">#1 in New Delhi</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="px-6 py-10 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-rose-600 rounded-[3rem] p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-rose-600/20">
            <motion.div 
              style={{ y: useTransform(pageScrollY, [500, 1500], [0, 100]) }}
              className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"
            ></motion.div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">Emergency? We're Here 24/7</h2>
              <p className="text-rose-100 text-lg font-medium">Instant ambulance support and emergency medical care at your doorstep.</p>
            </div>
            <div className="flex flex-wrap gap-4 relative z-10">
              <a href="tel:102" className="bg-white text-rose-600 px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-xl">
                Call 102 Now
              </a>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=MediFlow+Hospital+Health+Care" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-rose-700/50 text-white border-2 border-white/20 px-8 py-4 rounded-2xl font-black text-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
              >
                Get Directions
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-40 px-6 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center max-w-3xl mx-auto mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100"
            >
              Our Capabilities
            </motion.div>
            <h3 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-none">Everything you need <br /> for a healthier life.</h3>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              We've built a comprehensive suite of tools designed to make healthcare accessible, efficient, and secure for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Feature 1: Large AI Card */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="md:col-span-8 bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Zap className="w-10 h-10" />
                </div>
                <h4 className="text-4xl font-black mb-6 text-slate-900">AI Symptom Prediction</h4>
                <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-xl mb-10">
                  Advanced medical AI to predict potential conditions based on your symptoms with 98% accuracy. Our system processes millions of data points to give you instant insights.
                </p>
                <Link to="/dashboard/ai-chat" className="inline-flex items-center gap-3 font-black text-xs uppercase tracking-widest text-blue-600 group/btn">
                  Explore AI Engine
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent -z-0"></div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors"></div>
            </motion.div>

            {/* Feature 2: Secure Records */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-slate-900 rounded-[3rem] p-12 shadow-xl border border-white/5 group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 text-purple-400 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                  <Shield className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black mb-4 text-white">Secure Health Records</h4>
                <p className="text-slate-400 leading-relaxed font-medium mb-10">
                  End-to-end encrypted medical data management with blockchain security.
                </p>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 2 }}
                    className="h-full bg-purple-500"
                  ></motion.div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
            </motion.div>

            {/* Feature 3: Personalized Care */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 group relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black mb-4 text-slate-900">Personalized Care</h4>
              <p className="text-slate-500 leading-relaxed font-medium">
                Customized health plans and reminders tailored to your unique medical history.
              </p>
            </motion.div>

            {/* Feature 4: Expert Doctors */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="md:col-span-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 shadow-xl group relative overflow-hidden text-white"
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="max-w-md">
                  <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                    <Users className="w-8 h-8" />
                  </div>
                  <h4 className="text-3xl font-black mb-6">Connect with Expert Doctors</h4>
                  <p className="text-blue-100 leading-relaxed font-medium mb-10">
                    Verified medical professionals across various specializations ready to assist you in minutes.
                  </p>
                  <Link to="/doctors" className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform inline-block">
                    Find an Expert Doctor
                  </Link>
                </div>
                <div className="flex -space-x-4">
                  {[
                    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
                    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
                    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200",
                    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200"
                  ].map((url, i) => (
                    <motion.img 
                      key={i} 
                      whileHover={{ y: -10, zIndex: 50 }}
                      src={url} 
                      className="w-20 h-20 rounded-2xl border-4 border-blue-500 object-cover shadow-2xl" 
                      alt="Doctor" 
                      referrerPolicy="no-referrer" 
                    />
                  ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Success Stories Scrolling Cards */}
      <section className="py-40 px-6 bg-slate-900 overflow-hidden relative">
        <motion.div 
          style={{ y: storiesBgY }}
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-10"
        >
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[150px]"></div>
        </motion.div>

        <div className="max-w-7xl mx-auto mb-24">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-500/20"
              >
                Patient Impact
              </motion.div>
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-none">Real Stories, <br /> Real Results.</h2>
            </div>
            <p className="text-xl text-slate-400 font-medium max-w-sm">Hear from the families whose lives have been transformed by our technology-driven care.</p>
          </div>
        </div>

        <div className="relative">
          <div className="flex gap-8 overflow-x-auto pb-20 px-6 no-scrollbar snap-x snap-mandatory">
            {[
              {
                name: "The Sharma Family",
                story: "MediFlow's AI symptom checker helped us identify our son's condition early. The instant consultation saved us critical time.",
                image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
                tag: "Emergency Care"
              },
              {
                name: "Ananya Kapoor",
                story: "The digital health records feature is a lifesaver. I no longer have to carry heavy files for my chronic condition management.",
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
                tag: "Chronic Management"
              },
              {
                name: "Robert Wilson",
                story: "Consulting with a specialist from another city was seamless. The video quality and data security were top-notch.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
                tag: "Remote Consultation"
              },
              {
                name: "The Gupta Family",
                story: "We've been using MediFlow for our elderly parents. The personalized care plans and reminders are incredibly helpful.",
                image: "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=800",
                tag: "Elderly Care"
              }
            ].map((story, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="min-w-[350px] md:min-w-[450px] bg-white/5 border border-white/10 rounded-[3rem] p-10 snap-center group hover:bg-white/10 transition-all duration-500"
              >
                <div className="relative h-64 rounded-[2rem] overflow-hidden mb-8">
                  <img src={story.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={story.name} referrerPolicy="no-referrer" />
                  <div className="absolute top-6 right-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                    {story.tag}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{story.name}</h3>
                <p className="text-slate-400 leading-relaxed font-medium italic">"{story.story}"</p>
                <div className="mt-8 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-blue-500 text-blue-500" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <motion.div 
          style={{ y: useTransform(pageScrollY, [1500, 3000], [0, 200]) }}
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-5 pointer-events-none"
        >
          <div className="text-[30rem] font-black text-blue-900/10 whitespace-nowrap -rotate-12">MEDIFLOW</div>
        </motion.div>
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 rounded-[5rem] p-16 lg:p-32 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(59,130,246,0.5)]"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px] animate-pulse delay-1000"></div>
            
            <div className="relative z-10">
              <h2 className="text-6xl lg:text-8xl font-black tracking-tight mb-10 leading-[0.9]">
                Ready to take control <br />
                of your health?
              </h2>
              <p className="text-2xl text-white/80 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                Join thousands of users who are already experiencing the future of healthcare. It only takes 2 minutes to get started.
              </p>
              <div className="flex flex-wrap justify-center gap-8">
                <Link to="/register" className="px-16 py-8 bg-white text-blue-600 font-black rounded-[2.5rem] shadow-2xl hover:scale-110 hover:shadow-white/40 transition-all text-xl active:scale-95 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/20 to-blue-50/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">Create Free Account</span>
                </Link>
                <Link to="/contact" className="px-16 py-8 bg-white/10 text-white border-2 border-white/20 font-black rounded-[2.5rem] hover:bg-white/20 hover:scale-110 transition-all text-xl backdrop-blur-sm active:scale-95">
                  Contact Sales
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 group relative"
        >
          <div className="absolute -top-12 right-0 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with Support
          </div>
          <MessageCircle className="w-7 h-7" />
        </motion.button>
        <motion.a 
          href="tel:+919694984312" 
          whileHover={{ scale: 1.1, rotate: -15 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 group relative"
        >
          <div className="absolute -top-12 right-0 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Emergency Call
          </div>
          <Phone className="w-7 h-7" />
        </motion.a>
      </div>

      <Footer />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
