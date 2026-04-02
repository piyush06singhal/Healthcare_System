import { Phone, Video, X, Mic, MicOff, VideoOff, Monitor, Settings, MessageSquare, Users, Shield, Clock, FileText, Plus, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'sonner';

export default function VideoConsultation() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isDoctor = user?.role === 'doctor';

  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: isDoctor ? 'System' : 'Dr. Mitchell', text: isDoctor ? 'Patient is in the waiting room.' : 'Hello! How are you feeling today?', time: '10:00 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isJoined && !isVideoOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing media devices:", err);
          toast.error("Could not access camera/microphone");
        });
    }
  }, [isJoined, isVideoOff]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { sender: 'You', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setNewMessage('');
  };

  return (
    <div className="bg-slate-900 min-h-[calc(100vh-160px)] rounded-[3rem] text-white selection:bg-blue-500/30 overflow-hidden flex flex-col relative border border-slate-800 shadow-2xl">
      <main className="flex-1 flex flex-col">
        {!isJoined ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-[3rem] p-12 border border-slate-700/50 shadow-2xl text-center space-y-8"
            >
              <div className="w-24 h-24 bg-blue-600/20 text-blue-500 rounded-[2rem] flex items-center justify-center mx-auto relative">
                <Video className="w-12 h-12" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 border-4 border-slate-800 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">
                  {isDoctor ? 'Start Consultation' : 'Ready to join?'}
                </h1>
                <p className="text-slate-400 font-medium">
                  {isDoctor 
                    ? 'Patient: Piyush Singhal is waiting in the secure clinical room.' 
                    : 'Dr. Mitchell is waiting for you in the consultation room.'}
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <button 
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Connection Status</span>
                  <span className="text-emerald-400">Optimal</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Encryption</span>
                  <span className="text-blue-400">AES-256 Secure</span>
                </div>
              </div>

              <button 
                onClick={() => setIsJoined(true)}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all"
              >
                {isDoctor ? 'Initialize Neural Link' : 'Join Consultation'}
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
            {/* Main Video Area */}
            <div className="flex-1 relative bg-slate-800 rounded-[3rem] overflow-hidden border border-slate-700 shadow-2xl group">
              {/* Remote Video */}
              <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                <img 
                  src={isDoctor 
                    ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=1200"
                    : "https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=1200"
                  } 
                  className="w-full h-full object-cover opacity-80" 
                  alt="Remote Participant"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      {isDoctor ? 'Patient' : 'Consultant'}
                    </div>
                    <div className="text-xl font-black">
                      {isDoctor ? 'Piyush Singhal' : 'Dr. Mitchell'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Video */}
              <motion.div 
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                className="absolute top-8 right-8 w-48 h-64 bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl z-10 cursor-move"
              >
                {!isVideoOff ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <VideoOff className="w-8 h-8 text-slate-600" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 text-[8px] font-black uppercase tracking-widest bg-slate-900/60 backdrop-blur-md px-2 py-1 rounded-md">
                  You (Live)
                </div>
              </motion.div>

              {/* Controls Overlay */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-4 bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
                <div className="w-px h-8 bg-white/10 mx-2" />
                <button className="w-12 h-12 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all">
                  <Monitor className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isChatOpen ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                {isDoctor && (
                  <button 
                    onClick={() => setIsNotesOpen(!isNotesOpen)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isNotesOpen ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                )}
                <div className="w-px h-8 bg-white/10 mx-2" />
                <button 
                  onClick={() => setIsJoined(false)}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 rotate-[135deg]" />
                  End Call
                </button>
              </div>

              {/* Status Indicators */}
              <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/30 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live Consultation
                </div>
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md text-white rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  14:22
                </div>
              </div>
            </div>

            {/* Sidebars Container */}
            <div className="flex gap-6 h-full">
              {/* Chat Sidebar */}
              <AnimatePresence>
                {isChatOpen && (
                  <motion.div 
                    initial={{ opacity: 0, x: 100, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 320 }}
                    exit={{ opacity: 0, x: 100, width: 0 }}
                    className="bg-slate-800 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        <h3 className="text-sm font-black tracking-tight uppercase">Chat</h3>
                      </div>
                      <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[90%] p-3 rounded-2xl text-xs font-medium ${msg.sender === 'You' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
                            {msg.text}
                          </div>
                          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1">
                            {msg.sender} • {msg.time}
                          </span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-700">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Type..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="w-full pl-4 pr-10 py-3 bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-xs font-medium"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500"><Send className="w-4 h-4" /></button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notes Sidebar (Doctor Only) */}
              <AnimatePresence>
                {isDoctor && isNotesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, x: 100, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 320 }}
                    exit={{ opacity: 0, x: 100, width: 0 }}
                    className="bg-slate-800 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-black tracking-tight uppercase">Clinical Notes</h3>
                      </div>
                      <button onClick={() => setIsNotesOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="flex-1 p-6">
                      <textarea 
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder="Enter clinical observations, diagnosis, and treatment plan..."
                        className="w-full h-full bg-slate-700/50 border border-slate-600 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-slate-200"
                      />
                    </div>

                    <div className="p-6 border-t border-slate-700">
                      <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        Sign & Save
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
