import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Activity, 
  Shield, 
  Zap,
  MoreVertical,
  Search,
  Mic,
  MicOff,
  Info,
  Heart,
  Droplets,
  Clock,
  ChevronRight,
  Brain,
  TrendingDown,
  History,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateAIResponse } from '../lib/ai';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addMessage } from '../store/healthSlice';

export default function PatientAIChat() {
  const { messages } = useSelector((state: RootState) => state.health);
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const visibleMessages = useMemo(() => {
    return messages.slice(-visibleCount);
  }, [messages, visibleCount]);

  const hasMore = messages.length > visibleCount;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate speech recognition
      setTimeout(() => {
        setInput('What are the symptoms of common cold?');
        setIsListening(false);
      }, 2000);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { 
      id: Date.now().toString(),
      sender: 'patient' as const, 
      text: input,
      timestamp: new Date().toISOString()
    };
    dispatch(addMessage(userMessage));
    setInput('');
    setLoading(true);

    try {
      const response = await generateAIResponse(input, messages, 'patient');
      const assistantMessage = { 
        id: (Date.now() + 1).toString(),
        sender: 'doctor' as const, 
        text: response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date().toISOString()
      };
      dispatch(addMessage(assistantMessage));
    } catch (error) {
      console.error('AI Error:', error);
      dispatch(addMessage({ 
        id: (Date.now() + 1).toString(),
        sender: 'doctor' as const, 
        text: "I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString()
      }));
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => setVisibleCount(prev => prev + 10);

  return (
    <div className="h-full flex flex-col gap-8 pb-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
              Personal Concierge
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Active Health Context
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">AI Health Assistant</h1>
          <p className="text-slate-500 font-medium mt-1 text-lg">Instant, context-aware clinical intelligence at your fingertips.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            AES-256 Vault
          </div>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-10 overflow-hidden min-h-0">
        {/* Chat Interface */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20 backdrop-blur-3xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">MediFlow AI Assistant</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex -space-x-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-4 h-4 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                        <Sparkles className="w-1.5 h-1.5 text-blue-600" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Synergizing Health Data</span>
                </div>
              </div>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar scroll-smooth">
            {hasMore && (
              <div className="flex justify-center pb-10">
                <button 
                  onClick={loadMore}
                  className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-slate-100"
                >
                  <History className="w-4 h-4" />
                  Load Previous Context
                </button>
              </div>
            )}
            <AnimatePresence initial={false}>
              {visibleMessages.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-5 max-w-[85%] ${msg.sender === 'patient' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      msg.sender === 'patient' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white shadow-blue-500/10'
                    }`}>
                      {msg.sender === 'patient' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                    </div>
                    <div className={`p-8 rounded-[2.5rem] text-base font-medium leading-relaxed shadow-xl ${
                      msg.sender === 'patient' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-100'
                    }`}>
                      <div className="prose prose-sm xl:prose-base prose-slate max-w-none text-inherit leading-relaxed">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-5 items-center bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100/50 shadow-sm">
                  <div className="relative">
                    <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-blue-400 animate-spin" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Synthesizing clinical knowledge...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-10 bg-white border-t border-slate-50 sticky bottom-0 z-20">
            <form onSubmit={handleSend} className="relative flex items-center gap-5">
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Health assistant is listening..." : "Describe a symptom, ask about stats, or medication guidance..."} 
                  className={`w-full pl-10 pr-32 py-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-base font-medium focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner ${isListening ? 'animate-pulse ring-8 ring-blue-500/10 border-blue-300' : 'hover:bg-slate-100'}`}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={toggleListening}
                    className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center ${isListening ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:bg-white hover:shadow-md'}`}
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                  <Sparkles className="w-6 h-6 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-50 shrink-0 group"
              >
                <Send className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10 lg:block min-w-0">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-100 overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Context</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Heart Rate', value: '72', unit: 'BPM', icon: <Heart className="w-4 h-4" />, color: 'rose' },
                { label: 'Stability', value: '88', unit: '%', icon: <Zap className="w-4 h-4" />, color: 'blue' },
                { label: 'Hydration', value: 'Optimal', unit: '', icon: <Droplets className="w-4 h-4" />, color: 'emerald' },
              ].map((vital, i) => (
                <div key={i} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-${vital.color}-100 text-${vital.color}-600`}>
                        {vital.icon}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vital.label}</span>
                    </div>
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">{vital.value}</span>
                    <span className="text-[10px] font-bold text-slate-400">{vital.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-950 rounded-[3.5rem] p-10 shadow-2xl text-white relative overflow-hidden group"
          >
            <h3 className="text-xl font-black mb-8 relative z-10">Quick Prompts</h3>
            <div className="space-y-4 relative z-10">
              {[
                "Analyze recent vitals",
                "Health trend report",
                "Hydration optimization",
                "Sleep cycle review"
              ].map((topic, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(topic)}
                  className="w-full text-left p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group/item"
                >
                  {topic}
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl opacity-50" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
