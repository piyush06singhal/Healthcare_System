import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  Activity,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Shield,
  Clock,
  Users,
  Video,
  Pill,
  Brain,
  ClipboardList,
  Command,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { markNotificationRead } from '../store/healthSlice';
import { initializeRealTimeSync } from '../services/dbSync';
import { toast } from 'sonner';
import CommandCenter from './CommandCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, activeProfile } = useSelector((state: RootState) => state.auth);
  const { notifications } = useSelector((state: RootState) => state.health);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  useEffect(() => {
    if (user?.id) {
      const cleanup = initializeRealTimeSync(dispatch as AppDispatch, user.id, user.role);
      return () => {
        if (typeof cleanup === 'function') (cleanup as any)();
      };
    }
  }, [user?.id, user?.role, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandCenterOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const patientMenuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', path: '/dashboard' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', path: '/dashboard/appointments' },
    { icon: <FileText className="w-5 h-5" />, label: 'Health Records', path: '/dashboard/records' },
    { icon: <Pill className="w-5 h-5" />, label: 'Medications', path: '/dashboard/prescriptions' },
    { icon: <ClipboardList className="w-5 h-5" />, label: 'Treatments', path: '/dashboard/treatments' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Messaging', path: '/dashboard/messages' },
    { icon: <Users className="w-5 h-5" />, label: 'Family Vault', path: '/dashboard/family' },
    { icon: <Sparkles className="w-5 h-5" />, label: 'Calculators', path: '/dashboard/calculators' },
    { icon: <Brain className="w-5 h-5" />, label: 'AI Assistant', path: '/dashboard/ai-chat' },
  ];

  const doctorMenuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', path: '/dashboard' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Patient Queue', path: '/dashboard/appointments' },
    { icon: <Clock className="w-5 h-5" />, label: 'My Schedule', path: '/dashboard/schedule' },
    { icon: <Users className="w-5 h-5" />, label: 'My Patients', path: '/dashboard/patients' },
    { icon: <Shield className="w-5 h-5" />, label: 'Staff Directory', path: '/dashboard/staff' },
    { icon: <Brain className="w-5 h-5" />, label: 'Clinical Workbench', path: '/dashboard/ai-workbench' },
    { icon: <Video className="w-5 h-5" />, label: 'Video Consultation', path: '/dashboard/video-consultation' },
    { icon: <Pill className="w-5 h-5" />, label: 'Prescriptions', path: '/dashboard/prescriptions' },
    { icon: <ClipboardList className="w-5 h-5" />, label: 'Pharmacy Dashboard', path: '/dashboard/pharmacy' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Patient Messaging', path: '/dashboard/messages' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/dashboard/notifications' },
    { icon: <Activity className="w-5 h-5" />, label: 'Clinical Insights', path: '/dashboard/insights' },
    { icon: <Sparkles className="w-5 h-5" />, label: 'AI Video Gen', path: '/dashboard/video-gen' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/dashboard/profile' },
  ];

  const menuItems = user?.role === 'doctor' ? doctorMenuItems : patientMenuItems;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      {/* Sidebar Overlay for mobile */}
      <AnimatePresence>
        {(isSidebarOpen || isNotificationsOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsSidebarOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 320 : 96,
          x: 0 
        }}
        className="bg-slate-950 border-r border-white/5 relative z-50 flex flex-col transition-all duration-500 shadow-2xl shrink-0"
      >
        <div className={`p-10 flex items-center ${isSidebarOpen ? 'gap-5' : 'justify-center p-8'}`}>
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            onClick={toggleSidebar}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 shrink-0 cursor-pointer border border-white/10"
          >
            <Activity className="w-8 h-8" />
          </motion.div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="text-2xl font-display font-black tracking-tighter text-white whitespace-nowrap">
                  MediFlow <span className="text-blue-400">AI</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Clinical OS v2.0</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-5 py-6 space-y-2.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-400 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-2xl shadow-blue-600/20 border border-white/10' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-white border border-transparent'
                } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
              >
                <div className={`shrink-0 transition-transform duration-500 ${isActive ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:-rotate-3'}`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                </div>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-bold whitespace-nowrap text-sm tracking-tight"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && isSidebarOpen && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-4 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(96,165,250,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          {isSidebarOpen && (
            <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">System Live</span>
                  <span className="text-[8px] font-bold text-emerald-400/70 uppercase">Sync Optimal</span>
                </div>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500"
                  animate={{ width: ['20%', '80%', '40%', '95%'] }}
                  transition={{ duration: 10, repeat: Infinity }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-black text-[11px] uppercase tracking-widest whitespace-nowrap"
                >
                  Terminate Session
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-12 w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50 text-slate-400 hover:text-blue-600 hover:border-blue-200"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-28 bg-white/70 border-b border-slate-200/60 px-10 flex items-center justify-between sticky top-0 z-40 backdrop-blur-3xl shadow-sm">
          <div className="flex items-center gap-8 flex-1 max-w-2xl">
            {!isSidebarOpen && (
              <button 
                onClick={toggleSidebar}
                className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <button 
              onClick={() => setIsCommandCenterOpen(true)}
              className="relative w-full group flex items-center text-left"
            >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div className="w-full pl-16 pr-8 py-5 bg-slate-100/50 border border-transparent rounded-[2rem] group-hover:bg-white group-hover:border-blue-600/20 group-hover:ring-8 group-hover:ring-blue-600/5 transition-all font-semibold text-slate-400">
                Search records, tools, nodes...
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm text-[10px] font-black text-slate-400">
                <Command className="w-3 h-3" />
                K
              </div>
            </button>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all group"
              >
                <Bell className="w-7 h-7" />
                {unreadCount > 0 && (
                  <span className="absolute top-4 right-4 w-4 h-4 bg-rose-500 border-2 border-white rounded-full group-hover:scale-125 transition-transform shadow-lg shadow-rose-500/20 flex items-center justify-center text-[8px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => navigate('/dashboard/profile')}
                className="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all"
              >
                <Settings className="w-7 h-7" />
              </button>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="flex items-center gap-5 group cursor-pointer" onClick={() => navigate('/dashboard/profile')}>
              <div className="text-right hidden sm:flex flex-col items-end">
                <div className="text-lg font-display font-black text-slate-950 leading-none group-hover:text-blue-700 transition-colors">{activeProfile?.name || user?.name || 'Dr. Singhal'}</div>
                <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em] flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                  {activeProfile?.relation || user?.role || 'Lead Physician'}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-4 border-white shadow-2xl group-hover:scale-105 transition-all ring-2 ring-blue-500/10">
                <img 
                  src={activeProfile?.avatar ? activeProfile.avatar : (user?.role === 'doctor' 
                    ? "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100"
                    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100")
                  } 
                  className="w-full h-full object-cover" 
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto px-4 py-8 lg:px-10 lg:py-12 custom-scrollbar bg-[#f8fafc] flex flex-col min-h-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 flex flex-col w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Notifications Sidebar */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[60] flex flex-col border-l border-slate-100"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Clinical Feed</h2>
              </div>
              <button 
                onClick={() => setIsNotificationsOpen(false)}
                className="p-3 bg-white text-slate-400 rounded-2xl hover:text-slate-900 shadow-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                  <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center">
                     <Bell className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Activity feed quiet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    onClick={() => dispatch(markNotificationRead(notif.id))}
                    className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer group relative overflow-hidden ${
                      notif.read ? 'bg-white border-slate-100' : 'bg-blue-50/30 border-blue-100 shadow-lg shadow-blue-500/5'
                    }`}
                  >
                    <div className="flex gap-5 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center shadow-lg ${
                        notif.type === 'alert' ? 'bg-rose-50 text-rose-600' : 
                        notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {notif.type === 'alert' ? <AlertCircle className="w-6 h-6" /> : 
                         notif.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </div>
                        <h4 className="text-sm font-black text-slate-900 tracking-tight mb-1">{notif.title}</h4>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                    {!notif.read && (
                      <div className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                    )}
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30">
               <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                  Dismiss All Notifications
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandCenter 
        isOpen={isCommandCenterOpen} 
        onClose={() => setIsCommandCenterOpen(false)} 
      />
    </div>
  );
}
