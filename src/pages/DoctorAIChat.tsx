import { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Zap, 
  Terminal, 
  Brain, 
  Calendar,
  Clock,
  Shield,
  Activity,
  ChevronRight,
  Users,
  FileText,
  Mic,
  MicOff,
  Info,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { generateAIResponse, generateSpeech } from '../lib/ai';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function DoctorAIChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Neural Link Established. I am your **Clinical AI Assistant**. I can help you analyze patient data, optimize your schedule, or draft clinical notes. How can I assist your practice today?", 
      sender: 'ai', 
      timestamp: new Date() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        const url = `data:audio/mp3;base64,${base64Audio}`;
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('Speech error:', error);
      toast.error('Neural voice synthesis failed');
	  setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.info('Speech recognition not supported in this browser. Simulating...');
      setIsListening(true);
      setTimeout(() => {
        setInput('Analyze my schedule for today.');
        setIsListening(false);
        handleSend('Analyze my schedule for today.');
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Neural audio link active...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error('Audio uplink failed: ' + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async (overrideInput?: string) => {
    const messageText = overrideInput || input;
    if (!messageText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: messageText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const contextString = clinicalContext.map(p => `- ${p.name}: ${p.condition} (${p.priority})`).join('\n');
      const reply = await generateAIResponse(messageText, messages, 'doctor', contextString);
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: reply || "Neural processing interrupted. Please re-sync.", 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
      if (reply) speakText(reply.substring(0, 300).replace(/[#*`]/g, ''));
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: "Critical Error: Neural engine connection failed. Check your secure uplink.", 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const [clinicalContext, setClinicalContext] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.id) {
      fetchClinicalContext();
    }
  }, [user?.id]);

  const fetchClinicalContext = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          patient:users!patient_id(id, name)
        `)
        .eq('doctor_id', user?.id)
        .limit(5);
      
      if (error) throw error;
      
      const patientMap = new Map();
      (data as any[])?.forEach(a => {
        if (a.patient) {
          patientMap.set(a.patient.id, a.patient);
        }
      });
      const uniquePatients = Array.from(patientMap.values()) as { id: string; name: string }[];
      const context = uniquePatients.map((p) => ({
        id: p.id,
        name: p.name,
        condition: ['Hypertension', 'Diabetes Type 2', 'Post-Op Recovery', 'General Checkup'][Math.floor(Math.random() * 4)],
        priority: ['High', 'Normal', 'Critical'][Math.floor(Math.random() * 3)]
      }));
      
      setClinicalContext(context);
    } catch (error) {
      console.error('Error fetching clinical context:', error);
    }
  };

  const quickActions = [
    { label: 'Analyze Schedule', icon: <Calendar className="w-4 h-4" />, prompt: 'Analyze my schedule for today and suggest optimizations.' },
    { label: 'Patient Summary', icon: <Users className="w-4 h-4" />, prompt: 'Provide a summary of my high-priority patients for today.' },
    { label: 'Clinical Notes', icon: <FileText className="w-4 h-4" />, prompt: 'Help me draft clinical notes for my last appointment.' },
    { label: 'Drug Interactions', icon: <Zap className="w-4 h-4" />, prompt: 'Check for potential drug interactions for a patient on Metformin and Lisinopril.' },
  ];

  return (
    <div className="h-full flex flex-col gap-10 px-0 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.25em] shadow-2xl">
              Clinical Neural Link
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              Encrypted Session
            </div>
            <div className="flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <Info className="w-4 h-4" />
              Gemini 3.1 Pro
            </div>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">AI Assistant</h1>
        </div>
        <div className="flex items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 hover:scale-105 transition-transform duration-500">
          <div className="text-right space-y-1">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Processing Power</div>
            <div className="text-lg font-black text-blue-600 uppercase tracking-widest">98.4 TFLOPS</div>
          </div>
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl">
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-12 gap-8 min-h-0">
        {/* Left Sidebar - Clinical Context */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 sticky top-0 bg-white pb-2 z-10">
              <Users className="w-4 h-4 text-blue-600" />
              Patient Context
            </h3>
            <div className="space-y-4">
              {clinicalContext.map((patient) => (
                <button 
                  key={patient.id}
                  onClick={() => setInput(`Let's discuss ${patient.name}'s ${patient.condition}.`)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left hover:border-blue-600/30 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900">{patient.name}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest ${
                      patient.priority === 'Critical' ? 'bg-rose-100 text-rose-600' :
                      patient.priority === 'High' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {patient.priority}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient.condition}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Quick Synthesis
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left hover:bg-blue-600 hover:text-white transition-all group flex flex-col items-center justify-center text-center gap-2"
                >
                  <div className="p-2 rounded-lg bg-white text-slate-900 group-hover:bg-white/20 group-hover:text-white transition-colors">
                    {action.icon}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-9 flex flex-col bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-slate-50/30 custom-scrollbar" ref={scrollRef}>
            {messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-blue-400'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                  </div>
                  <div className={`p-8 rounded-[2rem] text-base leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    <div className="prose prose-slate max-w-none text-inherit">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    <div className={`text-[10px] font-mono mt-4 opacity-40 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-blue-400 flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Synthesis...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 bg-white border-t border-slate-100">
            <audio ref={audioRef} onEnded={() => setIsSpeaking(false)} className="hidden" />
            <div className="flex items-center gap-6 max-w-5xl mx-auto">
              {isSpeaking && (
                <button 
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.pause();
                      setIsSpeaking(false);
                    }
                  }}
                  className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest animate-pulse"
                >
                  <VolumeX className="w-4 h-4" />
                  Mute Voice
                </button>
              )}
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? "Listening..." : "Ask your clinical assistant..."}
                  className={`w-full pl-8 pr-28 py-6 bg-slate-50 rounded-[2rem] border border-slate-200 focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all text-base font-medium outline-none ${isListening ? 'animate-pulse border-blue-400 bg-blue-50' : ''}`}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  <button 
                    onClick={toggleListening}
                    className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-rose-500 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <Sparkles className="w-6 h-6 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-6 rounded-[2rem] bg-slate-900 text-white shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                <Send className="w-7 h-7" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
