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

      <div className="relative z-10 space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <User className="w-3 h-3" />
            Account Settings
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
          <p className="text-slate-500 font-medium max-w-md">Manage your personal information, security preferences, and account metadata.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            View Public Profile
          </button>
          <button onClick={handleSave} className="btn-primary py-3 px-8 shadow-lg shadow-blue-600/20 group">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Column - Navigation */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-4 space-y-2">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'professional', label: 'Professional', icon: Star, show: user?.role === 'doctor' },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'billing', label: 'Billing', icon: CreditCard },
              { id: 'notifications', label: 'Notifications', icon: Bell },
            ].filter(t => t.show !== false).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
              <h3 className="text-lg font-black tracking-tight">MediFlow Pro</h3>
              <p className="text-white/60 text-xs font-medium leading-relaxed">Unlock advanced AI diagnostics and priority support.</p>
              <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-9 space-y-10">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-10 space-y-10"
          >
            {activeTab === 'personal' && (
              <>
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-[40px] overflow-hidden border-4 border-slate-100 group-hover:border-blue-100 transition-all duration-500">
                      <img 
                        src={`https://i.pravatar.cc/300?u=${user?.id}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt="Profile"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 text-white rounded-2xl border-4 border-white shadow-xl hover:bg-blue-700 transition-colors flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        {user?.role} Account
                      </span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        ID: {user?.id?.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="text" 
                        className="input-field pl-14" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="email" 
                        className="input-field pl-14 opacity-50 cursor-not-allowed" 
                        value={formData.email}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="tel" 
                        className="input-field pl-14" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                    <div className="relative group">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="text" 
                        className="input-field pl-14" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                  <textarea 
                    className="input-field min-h-[150px] resize-none p-5" 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
              </>
            )}

            {activeTab === 'professional' && user?.role === 'doctor' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Specialty</label>
                    <div className="relative group">
                      <Activity className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="text" 
                        className="input-field pl-14" 
                        value={formData.specialty}
                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Education</label>
                    <div className="relative group">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="text" 
                        className="input-field pl-14" 
                        value={formData.education}
                        onChange={(e) => setFormData({...formData, education: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Experience</label>
                    <div className="relative group">
                      <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="text" 
                        className="input-field pl-14" 
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Certifications</label>
                    <div className="relative group">
                      <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="text" 
                        className="input-field pl-14" 
                        value={formData.certifications}
                        onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Security Overview</h3>
                    <p className="text-slate-500 text-sm font-medium">Your account is protected with enterprise-grade security protocols.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account.', status: 'Enabled', icon: Lock },
                    { label: 'Password Management', desc: 'Last changed 42 days ago. We recommend every 90 days.', status: 'Rotate', icon: Settings },
                    { label: 'Login History', desc: 'Track all active sessions and login attempts.', status: 'View', icon: Activity },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 tracking-tight">{item.label}</div>
                          <div className="text-xs text-slate-500 font-medium">{item.desc}</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-blue-600 transition-all">
                        {item.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* System Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Registration', value: 'Oct 2026', icon: Calendar },
              { label: 'Verification', value: 'Verified', icon: Shield, color: 'emerald' },
              { label: 'Last Access', value: '2H 14M Ago', icon: Clock },
            ].map((info) => (
              <div key={info.label} className="card p-6 flex flex-col items-center text-center space-y-3 group hover:scale-[1.05] transition-all">
                <div className={`w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all`}>
                  <info.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{info.label}</div>
                  <div className={`text-sm font-black ${info.color === 'emerald' ? 'text-emerald-600' : 'text-slate-900'}`}>{info.value}</div>
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
