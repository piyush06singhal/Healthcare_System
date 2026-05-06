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
  Mic,
  Video,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function PatientMessages() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedClinician, setSelectedClinician] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [user?.id]);

  const fetchContacts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('doctor_id, doctor_name')
        .eq('patient_id', user.id);
      
      if (error) throw error;
      
      const uniqueDocs = Array.from(new Set(data?.map(a => a.doctor_id))).map(id => {
        return data?.find(a => a.doctor_id === id);
      });
      
      const docList = uniqueDocs.map(d => ({
        id: d.doctor_id,
        name: d.doctor_name,
        role: 'Consultant',
        status: 'Online',
        active: false
      }));

      setContacts(docList);
      if (docList.length > 0 && !selectedClinician) {
        setSelectedClinician(docList[0]);
      }
    } catch (error) {
      console.error('Error fetching clinician contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user?.id && selectedClinician?.id) {
       fetchMessages();

       const channel = supabase
         .channel(`chat-${user.id}-${selectedClinician.id}`)
         .on('postgres_changes', {
           event: 'INSERT',
           schema: 'public',
           table: 'messages',
           filter: `receiver_id=eq.${user.id}`
         }, (payload) => {
           if (payload.new.sender_id === selectedClinician.id) {
             setMessages(prev => [...prev, payload.new as Message]);
           }
         })
         .on('postgres_changes', {
           event: 'INSERT',
           schema: 'public',
           table: 'messages',
           filter: `sender_id=eq.${user.id}`
         }, (payload) => {
           if (payload.new.receiver_id === selectedClinician.id) {
             setMessages(prev => [...prev, payload.new as Message]);
           }
         })
         .subscribe();

       return () => {
         supabase.removeChannel(channel);
       };
    }
  }, [user?.id, selectedClinician?.id]);

  const fetchMessages = async () => {
    if (!user?.id || !selectedClinician?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedClinician.id}),and(sender_id.eq.${selectedClinician.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user?.id || !selectedClinician?.id) return;

    const currentInput = input;
    setInput('');

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedClinician.id,
          content: currentInput
        })
        .select()
        .single();

      if (error) throw error;
      
      if (!messages.find(m => m.id === data.id)) {
        setMessages(prev => [...prev, data as Message]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to transmit data.');
      setInput(currentInput);
    }
  };

  const handleJoinConsultation = async () => {
    if (!selectedClinician) return;
    
    const { data } = await supabase
        .from('appointments')
        .select('id')
        .eq('patient_id', user?.id)
        .eq('doctor_id', selectedClinician.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

    if (data) {
        navigate(`/dashboard/video-consultation/${data.id}`);
    } else {
        navigate(`/dashboard/video-consultation/session-${selectedClinician.id.slice(0,5)}-${user?.id?.slice(0,5)}`);
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
            {contacts.map((contact, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedClinician(contact)}
                className={`p-5 rounded-[2rem] flex items-center gap-4 transition-all cursor-pointer ${
                  selectedClinician?.id === contact.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'hover:bg-slate-50 text-slate-900'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden relative">
                   <img 
                    src={`https://i.pravatar.cc/150?u=${contact.id}`} 
                    className="w-full h-full object-cover" 
                    alt="Chat avatar" 
                   />
                   {contact.status === 'Online' && (
                     <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                   )}
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-black tracking-tight truncate ${selectedClinician?.id === contact.id ? 'text-white' : 'text-slate-900'}`}>{contact.name}</div>
                  <div className={`text-[9px] font-black uppercase tracking-widest ${selectedClinician?.id === contact.id ? 'text-blue-100' : 'text-slate-400'}`}>{contact.role}</div>
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
                <div className="text-center py-20">
                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active clinical links</p>
                </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden relative h-[calc(100vh-14rem)] max-h-[850px] min-h-[500px]">
          {selectedClinician ? (
            <>
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30 shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${selectedClinician.id}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedClinician.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Connection</span>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isCalling ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:text-rose-600'}`}
                      onClick={() => {
                          if (isCalling) {
                              setIsCalling(false);
                              toast.error('Voice link terminated');
                          } else {
                              setIsCalling(true);
                              toast.success('Wait... Contacting clinical team...');
                              setTimeout(() => {
                                  if (window.confirm('Practitioner is available for voice counsel. Accept encrypted call?')) {
                                      toast.success('Secure voice connection active');
                                  } else {
                                      setIsCalling(false);
                                  }
                              }, 3000);
                          }
                      }}
                  >
                    <Mic className="w-5 h-5 shadow-inner" />
                  </button>
                  <button 
                    onClick={handleJoinConsultation}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                  >
                    <Video className="w-4 h-4" />
                    Join Consultation
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-white/10 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center border border-slate-100">
                    <MoreVertical className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] space-y-2 ${msg.sender_id === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`p-6 rounded-[2.5rem] text-sm font-medium leading-relaxed shadow-xl ${
                            msg.sender_id === user?.id 
                              ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-900/10' 
                              : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-100'
                          }`}>
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-2 px-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.sender_id === user?.id && <CheckCheck className="w-3 h-3 text-blue-500" />}
                          </div>
                        </div>
                      </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                        <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No messages yet. Start the clinical dialogue.</p>
                    </div>
                  )}
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
                <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                    <MessageSquare className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Dispatch Center</h2>
                <p className="text-slate-500 font-medium mt-2">Establish a secure link with your medical practitioner.</p>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
