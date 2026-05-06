import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Heart, LogOut, Shield, Activity, ChevronDown, Globe, Phone, FileText } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { useNotifications } from '../contexts/NotificationContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { 
      name: 'Services', 
      path: '/services',
      dropdown: [
        { name: 'Online Consultations', icon: <Phone className="w-4 h-4" />, desc: 'Video calls with experts', path: '/doctors' },
        { name: 'AI Symptom Checker', icon: <Activity className="w-4 h-4" />, desc: 'Instant health insights', path: '/dashboard/ai-chat' },
        { name: 'Medical Insights', icon: <FileText className="w-4 h-4" />, desc: 'Verified AI research', path: '/dashboard/insights' },
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
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-600">Health Core</span>
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
