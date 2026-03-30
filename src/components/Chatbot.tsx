import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Terminal, ChevronRight, Sparkles, Zap, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      const reply = await generateAIResponse(input, messages);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: reply || "Error: Failed to process request. Please re-initialize.", 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: "System Error: Neural engine connection failed. Please check your network or API configuration.", 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
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
                    Neural Engine Active
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
                        placeholder="Type your clinical query..."
                        className="w-full pl-5 pr-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium outline-none"
                      />
                      <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
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

