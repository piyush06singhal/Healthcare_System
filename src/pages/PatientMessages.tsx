import { 
  Send, 
  Search, 
  MoreVertical, 
  User, 
  Shield, 
  Plus,
  Paperclip,
  CheckCheck,
  Activity,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addMessage } from '../store/healthSlice';
import { toast } from 'sonner';
import { dbService } from '../services/dbSync';

export default function PatientMessages() {
  const { messages } = useSelector((state: RootState) => state.health);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user?.id) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'patient' as const,
      text: input,
      timestamp: new Date().toISOString()
    };

    dispatch(addMessage(newMessage));
    const currentInput = input;
    setInput('');

    try {
      // Find active contact (mocking Dr. Sarah Mitchell id for now or first in list)
      const receiverId = 'staff-01'; // Mock ID for demonstration
      await dbService.sendMessage({
        sender_id: user.id,
        receiver_id: receiverId,
        content: currentInput
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Cloud sync failed, message saved locally.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
              Secure Channel
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              E2EE Active
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Clinical Dispatch</h1>
          <p className="text-slate-500 font-medium mt-1 text-lg">Direct encrypted line to your medical care team.</p>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-8 overflow-hidden min-h-0">
        {/* Chat List Sidebar */}
        <div className="hidden lg:flex flex-col bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search clinicians..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {[
              { name: 'Dr. Sarah Mitchell', role: 'Cardiologist', status: 'Online', active: true },
              { name: 'Dr. James Wilson', role: 'General Physician', status: 'Last seen 2h ago', active: false },
              { name: 'Nurse Clara', role: 'Care Support', status: 'Away', active: false },
            ].map((contact, i) => (
              <div 
                key={i} 
                className={`p-5 rounded-[2rem] flex items-center gap-4 transition-all cursor-pointer ${
                  contact.active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'hover:bg-slate-50 text-slate-900'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden relative">
                   <img 
                    src={`https://i.pravatar.cc/150?u=${contact.name}`} 
                    className="w-full h-full object-cover" 
                    alt="Chat avatar" 
                   />
                   {contact.status === 'Online' && (
                     <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                   )}
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-black tracking-tight truncate ${contact.active ? 'text-white' : 'text-slate-900'}`}>{contact.name}</div>
                  <div className={`text-[9px] font-black uppercase tracking-widest ${contact.active ? 'text-blue-100' : 'text-slate-400'}`}>{contact.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden relative h-[calc(100vh-14rem)] max-h-[850px] min-h-[500px]">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Dr. Sarah Mitchell</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Connection</span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center">
                <MoreVertical className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] space-y-2 ${msg.sender === 'patient' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`p-6 rounded-[2.5rem] text-sm font-medium leading-relaxed shadow-xl ${
                      msg.sender === 'patient' 
                        ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-900/10' 
                        : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-100'
                    }`}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender === 'patient' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="p-8 bg-white border-t border-slate-50 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center gap-5">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  type="button"
                  className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a clinical message..." 
                  className="w-full pl-8 pr-12 py-5 rounded-[2.5rem] bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                />
                <button 
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              <button 
                type="submit"
                disabled={!input.trim()}
                className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-50 shrink-0 group"
              >
                <Send className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

  );
}
