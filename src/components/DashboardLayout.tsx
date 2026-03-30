import React, { useState } from 'react';
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
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', path: '/dashboard' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', path: '/dashboard/appointments' },
    { icon: <FileText className="w-5 h-5" />, label: 'Medical Records', path: '/dashboard/records' },
    { icon: <Sparkles className="w-5 h-5" />, label: 'Health Calculators', path: '/dashboard/calculators' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'AI Assistant', path: '/dashboard/ai-chat' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/dashboard/profile' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 300 : 100 }}
        className="bg-slate-900 border-r border-white/10 relative z-50 flex flex-col transition-all duration-500"
      >
        <div className="p-8 flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 cursor-pointer"
          >
            <Activity className="w-7 h-7" />
          </motion.div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-2xl font-black tracking-tight text-white whitespace-nowrap"
              >
                MediFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-bold whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && isSidebarOpen && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className={`glass-card p-4 rounded-2xl bg-white/5 border-white/10 ${!isSidebarOpen && 'hidden'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-widest">System Status</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              All Systems Operational
            </div>
          </div>

          <div className={`glass-card p-4 rounded-2xl bg-white/5 border-white/10 ${!isSidebarOpen && 'hidden'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-widest">Security</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 leading-tight">Your data is secured with 256-bit encryption.</div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold whitespace-nowrap"
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
          className="absolute -right-4 top-10 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 text-slate-400 hover:text-blue-600"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-6 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search health records, doctors, diagnostics..." 
                className="w-full pl-12 pr-6 py-3 bg-slate-100 border-transparent rounded-2xl focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <button className="relative p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full group-hover:scale-125 transition-transform"></span>
              </button>
              <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <Settings className="w-6 h-6" />
              </button>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4 pl-2 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black text-slate-900">{user?.name || 'Piyush Singhal'}</div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center justify-end gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  {user?.role || 'Premium Patient'}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-xl group-hover:scale-105 transition-transform ring-2 ring-blue-50">
                <img 
                  src={`https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100`} 
                  className="w-full h-full object-cover" 
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-50/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
