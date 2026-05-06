import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Terminal, ChevronRight, Sparkles, Zap, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'sonner';

import { generateAIResponse, generateSpeech } from '../lib/ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isSpeaking?: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "System initialized. I am your **MediFlow AI** assistant. How can I assist with your clinical operations today?", sender: 'ai', timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { biometrics, prescriptions, treatments } = useSelector((state: RootState) => state.health);
  const { user } = useSelector((state: RootState) => state.auth);

  const toggleListening = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('AI core is listening...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      // Let the user review or auto-send if desired. 
      // For responsiveness, we just set the input.
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error('Voice link disrupted.');
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [isListening]);

  const clinicalContext = useMemo(() => {
    const latestHeartRate = biometrics.heartRate.length > 0 ? biometrics.heartRate[biometrics.heartRate.length - 1].value : 'N/A';
    return `
    Patient: ${user?.name || 'Unknown'}
    Latest Vitals:
    - Heart Rate: ${latestHeartRate} BPM
    - Blood Pressure: ${biometrics.bloodPressure}
    - Blood Sugar: ${biometrics.bloodSugar} mg/dL
    - Oxygen: ${biometrics.oxygen}%
    
    Current Medications:
    ${prescriptions.map(p => `- ${p.name} (${p.dosage}, ${p.frequency})`).join('\n')}
    
    Recent Treatments:
    ${treatments.slice(0, 2).map(t => `- ${t.condition} (Doctor: ${t.doctor}, Status: ${t.status})`).join('\n')}
    `;
  }, [biometrics, prescriptions, treatments, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSpeech = async (text: string, msgId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setMessages(prev => prev.map(m => ({ ...m, isSpeaking: false })));
      return;
    }

    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isSpeaking: true } : m));
    
    try {
      const base64Audio = await generateSpeech(text.replace(/[#*`]/g, ''));
      if (base64Audio) {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        audioRef.current = audio;
        audio.onended = () => {
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isSpeaking: false } : m));
          audioRef.current = null;
        };
        audio.play();
      }
    } catch (error) {
      console.error('Speech error:', error);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isSpeaking: false } : m));
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await generateAIResponse(input, messages, user?.role === 'doctor' ? 'doctor' : 'patient', clinicalContext);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: reply || "Error: Failed to process request. Please re-initialize.", 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
      
      // Auto-speak the response for voice assistant feel
      if (reply) {
        handleSpeech(reply, aiMsg.id);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: error.message || "System Error: AI engine connection failed. Please check your network or API configuration.", 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {/* WhatsApp Button */}
      <motion.a
        href="https://wa.me/919694984312"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, x: 20 }}
        animate={{ scale: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:shadow-[#25D366]/40 transition-all group"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
        <svg 
          viewBox="0 0 24 24" 
          className="w-7 h-7 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.653a11.888 11.888 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </motion.a>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-400/40 flex items-center justify-center relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <MessageSquare className="w-8 h-8 relative z-10" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 72 : 600,
              width: isMinimized ? 300 : 420
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 flex items-center justify-between text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    MediFlow AI
                    <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="text-[10px] font-mono opacity-60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    AI Engine Active
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  onClick={() => setIsMinimized(!isMinimized)} 
                  className="p-2 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  onClick={() => setIsOpen(false)} 
                  className="p-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={msg.id} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                          msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'
                        }`}>
                          {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group/msg ${
                          msg.sender === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                        }`}>
                          <div className="prose prose-sm prose-slate max-w-none text-inherit">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                          
                          {msg.sender === 'ai' && (
                            <button 
                              onClick={() => handleSpeech(msg.text, msg.id)}
                              className={`absolute -right-10 top-0 p-2 rounded-lg bg-white border border-slate-100 shadow-sm opacity-0 group-hover/msg:opacity-100 transition-opacity ${msg.isSpeaking ? 'text-blue-600 opacity-100' : 'text-slate-400'}`}
                            >
                              {msg.isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                          )}

                          <div className={`text-[9px] font-mono mt-3 opacity-40 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <Bot className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-3">
                          <div className="flex gap-1">
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input */}
                <div className="p-5 bg-white border-t border-slate-100">
                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isListening ? "Listening..." : "Type your clinical query..."}
                        className={`w-full pl-5 pr-12 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium outline-none ${isListening ? 'animate-pulse' : ''}`}
                      />
                      <button 
                        onClick={toggleListening}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-300 hover:text-blue-500 hover:bg-white'}`}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="p-4 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Terminal className="w-3 h-3" />
                      MediFlow AI / v4.2.0
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-600 uppercase tracking-widest font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      Secure Connection
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

