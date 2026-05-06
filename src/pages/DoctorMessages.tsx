import { 
  Search, 
  MessageSquare, 
  User, 
  Clock, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Shield, 
  AlertCircle,
  Phone,
  Video,
  CheckCheck,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { addMessage } from '../store/healthSlice';
import { toast } from 'sonner';
import { dbService } from '../services/dbSync';

const mockPatients = [
  { id: 'p1', name: 'Piush Singhal', lastMsg: 'I took the dose 2h ago.', time: 'Just now', unread: 2, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100", status: 'online' },
  { id: 'p2', name: 'Aarya Singhal', lastMsg: 'When is the next checkup?', time: '12m ago', unread: 0, avatar: "https://images.unsplash.com/photo-1517677129300-07b130802f46?auto=format&fit=crop&q=80&w=100", status: 'offline' },
  { id: 'p3', name: 'Suman Singhal', lastMsg: 'The labs look good, thank you.', time: '2h ago', unread: 0, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100", status: 'away' },
];

export default function DoctorMessages() {
  const { messages } = useSelector((state: RootState) => state.health);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user?.id) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'doctor' as const,
      text: input,
      timestamp: new Date().toISOString()
    };

    dispatch(addMessage(newMsg));
    const currentInput = input;
    setInput('');
    
    try {
      await dbService.sendMessage({
        sender_id: user.id,
        receiver_id: selectedPatient.id,
        content: currentInput
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Cloud sync failed.');
    }
  };

  return (
    <div className="h-full flex gap-10 min-h-0">
      {/* Patient List */}
      <div className="w-[400px] flex flex-col gap-8 bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Comms</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 italic">Secure HIPAA Link</p>
          </div>
          <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors shadow-sm border border-slate-100">
            <Search className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {mockPatients.map((patient) => (
            <motion.div
              key={patient.id}
              whileHover={{ x: 5 }}
              onClick={() => setSelectedPatient(patient)}
              className={`p-6 rounded-[2.5rem] cursor-pointer transition-all border ${
                selectedPatient?.id === patient.id 
                ? 'bg-slate-950 text-white border-slate-950 shadow-2xl' 
                : 'bg-slate-50 text-slate-600 border-slate-50 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/10">
                    <img src={patient.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    patient.status === 'online' ? 'bg-emerald-500' : 
                    patient.status === 'away' ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-black truncate ${selectedPatient?.id === patient.id ? 'text-white' : 'text-slate-900'}`}>{patient.name}</h3>
                    <span className="text-[9px] font-black opacity-50 uppercase tracking-tight whitespace-nowrap">{patient.time}</span>
                  </div>
                  <p className="text-xs opacity-60 truncate mt-1 font-medium">{patient.lastMsg}</p>
                </div>
                {patient.unread > 0 && (
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-black">
                    {patient.unread}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950 rounded-[3.5rem] shadow-2xl overflow-hidden relative border border-white/5 h-[calc(100vh-14rem)] max-h-[850px] min-h-[500px]">
        <div className="p-10 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-4 border-white/5">
              <img src={selectedPatient.avatar} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">{selectedPatient.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Counsel Session Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-14 h-14 bg-white/5 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
              <Phone className="w-6 h-6" />
            </button>
            <button className="w-14 h-14 bg-white/5 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
              <Video className="w-6 h-6" />
            </button>
            <button className="w-14 h-14 bg-white/5 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Shield className="w-3 h-3" />
              End-to-End Encrypted Tunnel
            </div>
          </div>

          <div className="space-y-6">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] group`}>
                  <div className={`p-6 rounded-[2.5rem] text-sm font-medium leading-relaxed tracking-tight ${
                    msg.sender === 'doctor' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-2xl shadow-blue-600/20' 
                    : 'bg-white/5 text-white rounded-tl-none border border-white/10'
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`mt-2 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity ${
                    msg.sender === 'doctor' ? 'justify-end' : 'justify-start'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.sender === 'doctor' && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={scrollRef} />
          </div>
        </div>

        <div className="p-10 border-t border-white/5 bg-slate-900/50 backdrop-blur-xl relative z-10">
          <form onSubmit={handleSend} className="flex gap-4">
            <button type="button" className="w-16 h-16 bg-white/5 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">
              <Paperclip className="w-6 h-6" />
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Record safe advice..."
              className="flex-1 bg-white/5 border border-white/10 rounded-[1.5rem] px-8 text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all font-medium"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="px-10 h-16 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-600/20 flex items-center gap-3"
            >
              Send Secure
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Ambient Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />
      </div>
    </div>
  );
}
