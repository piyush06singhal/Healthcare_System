import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
        ? 'py-4 bg-white/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-b border-slate-200/50' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex justify-between items-center gap-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-slate-900 leading-none">MediFlow</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">System Live</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            {navLinks.map((link) => (
              <div 
                key={link.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.path}
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${
                    location.pathname === link.path
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                  {link.dropdown && <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                </Link>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                      <div className="space-y-2">
                        {link.dropdown.map((item, idx) => (
                          <Link 
                            key={idx} 
                            to={item.path}
                            onClick={() => setActiveDropdown(null)}
                            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-blue-50 transition-all group/item"
                          >
                            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                              {item.icon}
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.name}</div>
                              <div className="text-[10px] font-bold text-slate-500">{item.desc}</div>
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
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden xl:flex items-center gap-1">
              <button className="p-2 text-slate-500 hover:text-blue-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 transition-colors relative rounded-xl ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50"
                    >
                      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
                        <button 
                          onClick={() => setNotifications([])}
                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => markAsRead(notif.id)}
                              className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group cursor-pointer"
                            >
                              <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  notif.type === 'reminder' ? 'bg-blue-50 text-blue-600' :
                                  notif.type === 'message' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                                }`}>
                                  {notif.type === 'reminder' ? <Clock className="w-5 h-5" /> :
                                   notif.type === 'message' ? <Phone className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                </div>
                                <div className="space-y-1">
                                  <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{notif.title}</div>
                                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{notif.desc}</p>
                                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-1">{notif.time}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 text-center">
                            <Bell className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No new notifications</p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <Link 
                          to="/dashboard/notifications" 
                          className="block p-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          View All Notifications
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="h-6 w-px bg-slate-200 hidden xl:block mx-2"></div>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all group"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Dashboard</span>
                </Link>
                <button 
                  onClick={() => dispatch(logout())}
                  className="p-2 text-slate-500 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
              >
                Book Now
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 bg-slate-100 rounded-xl text-slate-900"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block p-4 rounded-2xl text-base font-black uppercase tracking-widest transition-all ${
                    location.pathname === link.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-6 grid grid-cols-2 gap-4">
                  <Link 
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="p-4 text-center font-black uppercase tracking-widest text-slate-600 bg-slate-100 rounded-2xl"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="p-4 text-center font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl"
                  >
                    Join Now
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
