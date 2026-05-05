import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Command, 
  User, 
  Activity, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Pill, 
  Shield, 
  Settings, 
  X,
  CreditCard,
  Bell,
  Sparkles,
  Dna,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function CommandCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const mainActions = [
    { id: 'nodes', label: 'Neural Dashboard', path: '/dashboard', icon: Activity, keywords: 'home overview charts' },
    { id: 'vault', label: 'Medical Records', path: '/dashboard/records', icon: FileText, keywords: 'docs labs results' },
    { id: 'comms', label: 'Clinical Comms', path: '/dashboard/messages', icon: MessageSquare, keywords: 'chat doctor talk' },
    { id: 'prescriptions', label: 'RX Center', path: '/dashboard/prescriptions', icon: Pill, keywords: 'meds pills pharmacy' },
    { id: 'ai', label: 'AI Health Agent', path: '/dashboard/ai-chat', icon: Sparkles, keywords: 'help bot assistant' },
    { id: 'appointments', label: 'Scheduler', path: '/dashboard/appointments', icon: Calendar, keywords: 'book visit doctor' },
    { id: 'identity', label: 'Neural Profile', path: '/dashboard/profile', icon: User, keywords: 'me self settings' },
    { id: 'security', label: 'Protocols', path: '/dashboard/security', icon: Shield, keywords: 'privacy keys safety' },
    { id: 'video', label: 'Telehealth', path: '/dashboard/video-consultation', icon: Video, keywords: 'call meeting online' },
    { id: 'help', label: 'Knowledge Base', path: '/help', icon: Sparkles, keywords: 'help support guide documentation' },
  ];

  const filteredActions = mainActions.filter(action => 
    action.label.toLowerCase().includes(query.toLowerCase()) || 
    action.keywords.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null; // Toggle logic is handled by parent, but we can do it here too if we want
      }
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
          >
            {/* Search Input */}
            <div className="p-8 border-b border-slate-100 flex items-center gap-6">
              <Command className="w-8 h-8 text-blue-600" />
              <input 
                autoFocus
                type="text"
                placeholder="Search neural endpoints (e.g. 'lab results', 'appointments')..."
                className="flex-1 bg-transparent border-none text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                onClick={onClose}
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar max-h-[60vh]">
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {query ? 'Matched Endpoints' : 'Suggested Nodes'}
              </div>
              
              <div className="mt-4 space-y-2">
                {filteredActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleSelect(action.path)}
                    className="w-full flex items-center justify-between p-6 rounded-[2rem] hover:bg-slate-50 group transition-all text-left border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-900 leading-tight">{action.label}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{action.keywords}</div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">Enter</div>
                    </div>
                  </button>
                ))}

                {filteredActions.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No Neural Results Found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-black text-slate-400 shadow-sm">ESC</div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Close</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-black text-slate-400 shadow-sm">↑↓</div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Navigate</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-blue-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient Portal Sync Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
