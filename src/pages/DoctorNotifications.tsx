import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Info,
  Trash2,
  MoreVertical,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export default function DoctorNotifications() {
  const { notifications, markAsRead, deleteNotification, clearAll } = useNotifications();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || (filter === 'unread' && !n.isRead) || (filter === 'urgent' && n.type === 'urgent');
      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-16 pb-24 px-4 lg:px-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Clinical Alerts</h1>
          <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">Real-time telemetry and system notifications. Stay updated with critical lab results and upcoming consultations.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts..." 
              className="pl-14 pr-8 py-5 rounded-[2rem] bg-white border border-slate-100 text-base focus:outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 transition-all w-full lg:w-96 text-slate-900 shadow-2xl shadow-slate-200/60 font-medium"
            />
          </div>
          <button 
            onClick={clearAll}
            className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/30 active:scale-95"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        {/* Filters Sidebar */}
        <motion.div variants={itemVariants} className="space-y-4">
          {[
            { id: 'all', label: 'All Notifications', icon: <Bell className="w-4 h-4" />, count: notifications.length },
            { id: 'unread', label: 'Unread', icon: <Clock className="w-4 h-4" />, count: notifications.filter(n => !n.isRead).length },
            { id: 'urgent', label: 'Urgent Alerts', icon: <AlertCircle className="w-4 h-4" />, count: notifications.filter(n => n.type === 'urgent').length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`w-full p-6 rounded-[2rem] flex items-center justify-between transition-all border ${
                filter === item.id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200' 
                  : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${filter === item.id ? 'bg-white/20' : 'bg-slate-50'}`}>
                  {item.icon}
                </div>
                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${filter === item.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                {item.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Notifications List */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Alerts Found</h3>
                <p className="text-slate-400 font-medium">Your clinical queue is currently clear.</p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative p-8 rounded-[3rem] bg-white border transition-all hover:shadow-2xl hover:shadow-slate-200/50 ${
                    !notification.isRead ? 'border-blue-100 shadow-xl shadow-blue-50' : 'border-slate-100'
                  }`}
                >
                  {!notification.isRead && (
                    <div className="absolute top-8 left-4 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                  
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-2xl shrink-0 ${
                      notification.type === 'urgent' ? 'bg-rose-50 text-rose-600' :
                      notification.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                      notification.type === 'reminder' ? 'bg-amber-50 text-amber-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {notification.type === 'urgent' ? <AlertCircle className="w-6 h-6" /> :
                       notification.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
                       notification.type === 'reminder' ? <Clock className="w-6 h-6" /> :
                       <Info className="w-6 h-6" />}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{notification.title}</h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notification.time}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{notification.message}</p>
                      
                      <div className="pt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                          >
                            Mark as read
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:text-rose-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
