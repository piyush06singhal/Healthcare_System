import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, X, Check, Copy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceToTextProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

export default function VoiceToText({ onTranscript, placeholder = "Start speaking..." }: VoiceToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition?.start();
      setIsListening(true);
    }
  }, [isListening, recognition]);

  const handleConfirm = () => {
    onTranscript(transcript);
    setTranscript('');
    setIsListening(false);
    recognition?.stop();
  };

  const handleClear = () => {
    setTranscript('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleListening}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
            isListening 
              ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/40'
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <div className="flex-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {isListening ? 'Listening...' : 'Voice-to-Text'}
          </div>
          <div className="text-sm font-bold text-slate-900">
            {isListening ? 'Speak clearly into your microphone' : 'Click the mic to start dictating'}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(transcript || isListening) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-2xl shadow-slate-200/50 space-y-6"
          >
            <div className="min-h-[100px] text-lg font-medium text-slate-900 leading-relaxed">
              {transcript || <span className="text-slate-300 italic">{placeholder}</span>}
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClear}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all"
                  title="Clear"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleCopy}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsListening(false)}
                  className="px-6 py-3 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
