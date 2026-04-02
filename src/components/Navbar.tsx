import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Heart, LogOut, Shield, Activity, ChevronDown, Globe, Phone, Search, Bell, Clock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Appointment Reminder', desc: 'Your session with Dr. Sarah starts in 30 mins', time: 'Just now', type: 'reminder' },
    { id: 2, title: 'New Message', desc: 'Dr. Michael sent you a follow-up note', time: '2h ago', type: 'message' },
    { id: 3, title: 'Health Update', desc: 'Your blood test results are now available', time: '5h ago', type: 'update' },
  ]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { 
      name: 'Services', 
      path: '/services',
      dropdown: [
        { name: 'Online Consultations', icon: <Phone className="w-4 h-4" />, desc: 'Video calls with experts', path: '/doctors' },
        { name: 'AI Symptom Checker', icon: <Activity className="w-4 h-4" />, desc: 'Instant health insights', path: '/dashboard/ai-chat' },
        { name: 'Medical Insights', icon: <Search className="w-4 h-4" />, desc: 'Verified AI research', path: '/dashboard/insights' },
        { name: 'Video Generation', icon: <Globe className="w-4 h-4" />, desc: 'AI educational videos', path: '/dashboard/video-gen' },
        { name: 'Health Records', icon: <Shield className="w-4 h-4" />, desc: 'Secure digital storage', path: '/dashboard/records' },
      ]
    },
    { name: 'Doctors', path: '/doctors' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'py-3 bg-white/70 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border-b border-white/20' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group shrink-0">
            <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-slate-900 leading-none uppercase">MediFlow</span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-600">Quantum Core</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 backdrop-blur-md p-1.5 rounded-[2rem] border border-white/40">
            {navLinks.map((link) => (
              <div 
                key={link.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.path}
                  className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${
                    location.pathname === link.path
                      ? 'text-white bg-slate-900 shadow-lg shadow-slate-900/20'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  {link.name}
                  {link.dropdown && <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                </Link>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-3 w-80 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 p-5 overflow-hidden"
                    >
                      <div className="space-y-1.5">
                        {link.dropdown.map((item, idx) => (
                          <Link 
                            key={idx} 
                            to={item.path}
                            onClick={() => setActiveDropdown(null)}
                            className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-900 hover:text-white transition-all group/item"
                          >
                            <div className="w-11 h-11 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center group-hover/item:bg-white/10 group-hover/item:text-white transition-all">
                              {item.icon}
                            </div>
                            <div className="text-left">
                              <div className="text-[10px] font-black uppercase tracking-widest mb-0.5">{item.name}</div>
                              <div className="text-[9px] font-bold opacity-60">{item.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden xl:flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors bg-white/50 rounded-xl border border-white/50">
                <Search className="w-4 h-4" />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-10 h-10 flex items-center justify-center transition-all relative rounded-xl border border-white/50 ${showNotifications ? 'bg-slate-900 text-white shadow-lg' : 'bg-white/50 text-slate-500 hover:text-slate-900'}`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute top-full right-0 mt-4 w-96 bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden z-50"
                    >
                      <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Telemetry Feed</h3>
                        <button 
                          onClick={() => setNotifications([])}
                          className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                        >
                          Purge All
                        </button>
                      </div>
                      <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => markAsRead(notif.id)}
                              className="p-6 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group cursor-pointer"
                            >
                              <div className="flex gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                  notif.type === 'reminder' ? 'bg-blue-50 text-blue-600' :
                                  notif.type === 'message' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                                }`}>
                                  {notif.type === 'reminder' ? <Clock className="w-5 h-5" /> :
                                   notif.type === 'message' ? <Phone className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                </div>
                                <div className="space-y-1.5">
                                  <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{notif.title}</div>
                                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{notif.desc}</p>
                                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest pt-1">{notif.time}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-16 text-center">
                            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feed is clear</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="h-6 w-px bg-slate-200 hidden xl:block mx-1 opacity-50"></div>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
                >
                  <div className="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center text-white text-[9px] font-black">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Console</span>
                </Link>
                <button 
                  onClick={() => dispatch(logout())}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors bg-white/50 rounded-xl border border-white/50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/20 active:scale-95 whitespace-nowrap"
              >
                Access Portal
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-11 h-11 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-900 shadow-sm"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-3xl border-t border-slate-100 overflow-hidden shadow-2xl"
          >
            <div className="p-8 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block p-5 rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
                    location.pathname === link.path
                      ? 'text-white bg-slate-900 shadow-xl shadow-slate-900/20'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-8 grid grid-cols-2 gap-4">
                  <Link 
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="p-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 rounded-3xl"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="p-5 text-center text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 rounded-3xl shadow-xl shadow-slate-900/20"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
