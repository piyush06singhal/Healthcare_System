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
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateAIResponse } from '../lib/ai';

export default function PatientAIChat() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your MediFlow AI assistant. How can I help you with your health today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateAIResponse(input, messages, 'patient');
      const assistantMessage = { sender: 'ai', text: response || "I'm sorry, I couldn't process that request." };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Health Assistant</h1>
          <p className="text-slate-500 font-medium mt-1">Get instant answers to your health questions powered by advanced AI.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
            <Shield className="w-3 h-3" />
            Secure & Private
          </div>
          <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-blue-100">
            <Info className="w-3 h-3" />
            Gemini 3.1 Pro
          </div>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-10 overflow-hidden">
        {/* Chat Interface */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">MediFlow AI</h3>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  Always Online
                </div>
              </div>
            </div>
            <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                      msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={`p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-100'
                    }`}>
                      <div className="prose prose-sm prose-slate max-w-none text-inherit">
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
                <div className="flex gap-4 items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <Bot className="w-6 h-6 text-blue-600 animate-bounce" />
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-slate-100">
            <form onSubmit={handleSend} className="relative flex items-center gap-4">
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask anything about your health, symptoms, or medications..."} 
                  className={`w-full pl-8 pr-24 py-5 rounded-[2rem] bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm ${isListening ? 'animate-pulse border-blue-400 bg-blue-50' : ''}`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={toggleListening}
                    className={`p-2 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <Sparkles className="w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 shrink-0"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h3 className="text-xl font-black text-slate-900 mb-8">Suggested Topics</h3>
            <div className="space-y-4">
              {[
                "Analyze my recent blood test",
                "Explain my medication side effects",
                "Suggest a healthy diet plan",
                "How to improve sleep quality",
                "Understanding my symptoms"
              ].map((topic, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(topic)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-100 text-xs font-bold transition-all flex items-center justify-between group"
                >
                  {topic}
                  <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Medical Disclaimer</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              MediFlow AI provides general information and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
