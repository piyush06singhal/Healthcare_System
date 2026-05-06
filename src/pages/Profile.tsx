import { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Camera, Save, Loader2, ChevronRight, Globe, Lock, Star, Activity, CreditCard, Bell, Settings, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 000-0000',
    address: 'San Francisco, CA',
    bio: 'Dedicated healthcare professional focused on patient-centric care and digital health innovation.',
    specialty: 'Cardiology',
    education: 'Harvard Medical School',
    experience: '12 Years',
    certifications: 'Board Certified in Cardiovascular Disease',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully');
    }, 1000);
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Parallax Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          style={{ y: y1, rotate }}
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2, rotate: -rotate }}
          className="absolute bottom-40 -right-20 w-[500px] h-[500px] bg-purple-100/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 space-y-12 pb-20">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b border-slate-200/60 pb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-950 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-[0.25em] border border-white/5 shadow-xl">
              <User className="w-3 h-3" />
              Verified Profile
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-slate-950 tracking-tighter">Clinical Profile</h1>
            <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed">Synchronize your professional identity and clinical credentials across the MediFlow network.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              Public Record
            </button>
            <button onClick={handleSave} className="btn-primary py-4 px-10 shadow-2xl shadow-blue-500/20 group">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Session
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column - Navigation */}
          <div className="lg:col-span-3 space-y-8">
            <div className="card p-6 space-y-3 bg-white/70 backdrop-blur-3xl">
              {[
                { id: 'personal', label: 'Identity', icon: User },
                { id: 'professional', label: 'Clinical', icon: Star, show: user?.role === 'doctor' },
                { id: 'security', label: 'Protocols', icon: Shield },
                { id: 'billing', label: 'Licensing', icon: CreditCard },
                { id: 'notifications', label: 'Telemetry', icon: Bell },
              ].filter(t => t.show !== false).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                    activeTab === tab.id ? 'bg-slate-950 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : ''}`} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="card p-8 bg-gradient-to-br from-indigo-900 to-slate-950 text-white overflow-hidden relative group">
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                  <Star className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black tracking-tight">MediFlow Pro</h3>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-loose mt-2">Access Advanced <br/>AI Diagnostics</p>
                </div>
                <button className="w-full py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">
                  Upgrade Tier
                </button>
              </div>
              <Activity className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 rotate-12" />
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-9 space-y-12">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-12 space-y-12 bg-white/70 backdrop-blur-3xl"
            >
              {activeTab === 'personal' && (
                <>
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="relative group">
                      <div className="w-48 h-48 rounded-[3.5rem] overflow-hidden border-8 border-white shadow-2xl group-hover:scale-105 transition-all duration-700 ring-1 ring-slate-100">
                        <img 
                          src={`https://i.pravatar.cc/400?u=${user?.id}`} 
                          className="w-full h-full object-cover group-hover:rotate-3 transition-transform duration-700" 
                          alt="Profile"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <button className="absolute -bottom-3 -right-3 w-14 h-14 bg-slate-950 text-blue-400 rounded-3xl border-4 border-white shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center group/cam">
                        <Camera className="w-6 h-6 group-hover/cam:scale-110 transition-transform" />
                      </button>
                    </div>
                    <div className="space-y-4 text-center md:text-left">
                      <h2 className="text-5xl font-display font-black text-slate-950 tracking-tighter">{user?.name}</h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                          {user?.role} Verified
                        </span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                          UUID: {user?.id?.slice(0, 16)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Digital Identity Card */}
                <div className="relative w-full h-80 bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700">
                      {/* Grid Background */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[size:40px_40px]" />
                      </div>
                      
                      <div className="absolute inset-0 p-12 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                             <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-4">Identity Card</div>
                             <div className="text-3xl font-display font-black text-white tracking-widest">MEDIFLOW HEALTH</div>
                          </div>
                          <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center">
                            <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
                          </div>
                        </div>

                        <div className="flex items-end justify-between">
                          <div className="space-y-6">
                            <div>
                              <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em] mb-1">Authenticated Account</div>
                              <div className="text-2xl font-black text-white uppercase tracking-tighter">{user?.name}</div>
                            </div>
                            <div className="flex gap-12">
                              <div>
                                <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em] mb-1">Account Level</div>
                                <div className="text-sm font-black text-blue-400 uppercase">PREMIUM</div>
                              </div>
                              <div>
                                <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em] mb-1">Status</div>
                                <div className="text-sm font-black text-white uppercase font-mono">ACTIVE</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-4">
                            <div className="w-24 h-24 bg-white p-2 rounded-2xl shadow-xl">
                              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=mediflow-auth-${user?.id}`} className="w-full h-full" alt="QR Auth" />
                            </div>
                            <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] text-right">Reference: {user?.id?.slice(0, 8)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Legal Identity</label>
                      <div className="relative group">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="text" 
                          className="input-field pl-16 py-6" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Network Endpoint</label>
                      <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="email" 
                          className="input-field pl-16 py-6 opacity-60 cursor-not-allowed bg-slate-100/50" 
                          value={formData.email}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Contact Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="tel" 
                          className="input-field pl-16 py-6" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Clinical Base</label>
                      <div className="relative group">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="text" 
                          className="input-field pl-16 py-6" 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Clinical Profile Summary</label>
                    <textarea 
                      className="input-field min-h-[160px] resize-none p-8 leading-relaxed text-slate-600 bg-slate-50/50" 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                </>
              )}

              {activeTab === 'professional' && user?.role === 'doctor' && (
                <div className="space-y-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Clinical Domain</label>
                      <div className="relative group">
                        <Activity className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="text" 
                          className="input-field pl-16 py-6" 
                          value={formData.specialty}
                          onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Academic Foundation</label>
                      <div className="relative group">
                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="text" 
                          className="input-field pl-16 py-6" 
                          value={formData.education}
                          onChange={(e) => setFormData({...formData, education: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Field Seniority</label>
                      <div className="relative group">
                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="text" 
                          className="input-field pl-16 py-6" 
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Board Certifications</label>
                      <div className="relative group">
                        <Shield className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="text" 
                          className="input-field pl-16 py-6" 
                          value={formData.certifications}
                          onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* System Info Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { label: 'Induction Date', value: 'Oct 2026', icon: Calendar },
                { label: 'Security Tier', value: 'Verified Admin', icon: Shield, color: 'emerald' },
                { label: 'Active Session', value: '00:14:42', icon: Clock },
              ].map((info) => (
                <div key={info.label} className="card p-8 flex flex-col items-center text-center space-y-4 group hover:scale-[1.03] transition-all bg-white/70">
                  <div className={`w-14 h-14 bg-slate-50 text-slate-400 rounded-[1.25rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm`}>
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{info.label}</div>
                    <div className={`text-base font-display font-black ${info.color === 'emerald' ? 'text-emerald-600' : 'text-slate-950'}`}>{info.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
