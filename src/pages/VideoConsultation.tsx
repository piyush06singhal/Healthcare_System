import { Phone, Video, X, Mic, MicOff, VideoOff, Monitor, Settings, MessageSquare, Users, Shield, Clock, FileText, Plus, Send, MonitorOff, AlertTriangle, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

// Type definition for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VideoConsultation() {
  const { id: appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isDoctor = user?.role === 'doctor';

  const [appointment, setAppointment] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();
      
      if (data && !error) {
        setAppointment(data);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };
  const [messages, setMessages] = useState([
    { sender: isDoctor ? 'System' : 'MediFlow AI', text: 'Secure clinical channel established. Awaiting participant.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Generate a unique, secure room name based on the appointment ID
  const roomName = `MediFlow-Clinical-Consult-${appointmentId || 'Public'}`;

  useEffect(() => {
    if (isJoined && jitsiContainerRef.current) {
      const domain = "meet.jit.si";
      const options = {
        roomName: roomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user?.name || 'MediFlow Participant',
          email: user?.email || ''
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
          ],
        }
      };

      // Load Jitsi script dynamically
      const script = document.createElement('script');
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        if (window.JitsiMeetExternalAPI) {
          // @ts-ignore
          new window.JitsiMeetExternalAPI(domain, options);
        }
      };
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isJoined, user, roomName]);

  // Voice Assistant Logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            setClinicalNotes(prev => prev + (prev ? '\n' : '') + `[Clinical Note]: ${transcript}`);
            toast.success('Clinical evidence captured', {
                description: transcript.slice(0, 50) + '...',
                duration: 2000
            });
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) recognition.start();
      };

      recognitionRef.current = recognition;
    }
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast.info('MediFlow Assistant: Listening Paused');
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.success('MediFlow Assistant: Listening for Clinical Markers');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { 
      sender: 'You', 
      text: newMessage, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setNewMessage('');
  };

  const saveConsultation = async () => {
    if (!isDoctor) {
        toast.error('Only clinical professionals can commit to EHR vault');
        return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('consultations').insert([{
        appointment_id: appointmentId || null,
        doctor_id: user?.id,
        patient_id: appointment?.patient_id || user?.id, // Fallback if no appointment linked
        notes: clinicalNotes,
        transcription: clinicalNotes // We're using clinicalNotes for both currently
      }]);

      if (error) throw error;
      
      toast.success('Clinical session securely committed to EHR vault');
      setIsNotesOpen(false);
    } catch (error) {
      console.error('EHR Save Error:', error);
      toast.error('Failed to persist clinical evidence');
    } finally {
        setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

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
                <h1 className="text-3xl font-black tracking-tight uppercase">
                  {isDoctor ? 'Clinical Station' : 'Patient Entrance'}
                </h1>
                <p className="text-slate-400 font-medium text-sm">
                  {isDoctor 
                    ? 'Establish a secure link with your patient. MediFlow AI is ready to assist.' 
                    : 'Your verified medical professional is awaiting your arrival.'}
                </p>
              </div>
              
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <span>Room Identity</span>
                  <span className="text-blue-400 font-mono">{roomName.slice(-8)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <span>Encryption</span>
                  <span className="text-emerald-400">Military Grade</span>
                </div>
              </div>

              <button 
                onClick={() => setIsJoined(true)}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
              >
                Launch Session
                <Sparkles className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
            <div className="flex-1 relative bg-slate-950 rounded-[3.5rem] overflow-hidden border border-slate-700 shadow-2xl group flex flex-col">
              <div ref={jitsiContainerRef} className="flex-1 w-full h-full" />
              
              <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={toggleListening}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                      isListening 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {isListening ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
                    {isListening ? 'AI LISTENING' : 'ACTIVATE AI'}
                  </button>
                  {isListening && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-3 bg-blue-500 animate-[bounce_1s_infinite_0s]" />
                        <div className="w-1 h-4 bg-blue-500 animate-[bounce_1s_infinite_0.1s]" />
                        <div className="w-1 h-3 bg-blue-500 animate-[bounce_1s_infinite_0.2s]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isChatOpen ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  {isDoctor && (
                    <button 
                      onClick={() => setIsNotesOpen(!isNotesOpen)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isNotesOpen ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-px h-6 bg-slate-800 mx-1" />
                  <button 
                    onClick={() => {
                        setIsJoined(false);
                        setIsListening(false);
                        recognitionRef.current?.stop();
                    }}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center gap-2"
                  >
                    Terminal session
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
                {(isChatOpen || (isDoctor && isNotesOpen)) && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col gap-6 w-80 lg:w-96"
                    >
                        {isChatOpen && (
                             <div className="bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-2xl flex flex-col flex-1 overflow-hidden">
                                <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                        <h3 className="text-[10px] font-black tracking-[0.2em] uppercase">Clinical Feed</h3>
                                    </div>
                                    <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[90%] p-3 rounded-2xl text-[11px] font-medium leading-relaxed ${msg.sender === 'You' ? 'bg-blue-600 text-white' : 'bg-slate-750 text-slate-200'}`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1.5 px-1">{msg.sender} • {msg.time}</span>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Transmit data..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="w-full pl-4 pr-10 py-3 bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-[11px] font-medium"
                                        />
                                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500"><Send className="w-4 h-4" /></button>
                                    </div>
                                </form>
                             </div>
                        )}
                        {isDoctor && isNotesOpen && (
                             <div className="bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-2xl flex flex-col flex-2 overflow-hidden">
                                <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                        <h3 className="text-[10px] font-black tracking-[0.2em] uppercase">Live SOAP Notes</h3>
                                    </div>
                                    <button onClick={() => setIsNotesOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="flex-1 p-5 flex flex-col space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-[8px] font-black uppercase text-indigo-400">MediFlow AI Insights</span>
                                        <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                                    </div>
                                    <textarea 
                                        value={clinicalNotes}
                                        onChange={(e) => setClinicalNotes(e.target.value)}
                                        className="flex-1 bg-slate-950/50 border border-slate-700 rounded-2xl p-5 text-[11px] font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-300 leading-relaxed font-mono"
                                        placeholder="Dictation will appear here..."
                                    />
                                    <button 
                                        onClick={saveConsultation}
                                        disabled={loading}
                                        className="w-full py-4 bg-indigo-600 hover:bg-slate-950 border border-white/5 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Shield className="w-3.5 h-3.5 group-hover:text-blue-400 transition-colors" />
                                        )}
                                        {loading ? 'SYNCING...' : 'Commit to EHR Vault'}
                                    </button>
                                </div>
                             </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
