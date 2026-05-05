import { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Video, Play, Loader2, Download, AlertCircle, Shield, Info, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VideoGeneration() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 1, label: 'Initializing', description: 'Setting up AI engine...' },
    { id: 2, label: 'Generating', description: 'Creating video frames...' },
    { id: 3, label: 'Processing', description: 'Finalizing composition...' },
    { id: 4, label: 'Downloading', description: 'Retrieving video file...' }
  ];

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setVideoUrl(null);
    setCurrentStep(1);
    setStatus('Initializing AI engine...');

    try {
      const apiKey = (window as any).process?.env?.API_KEY || process.env.GEMINI_API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      
      setCurrentStep(2);
      setStatus('Generating video frames...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: `Medical educational video: ${prompt}. High quality, professional clinical style.`,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      setCurrentStep(3);
      while (!operation.done) {
        setStatus('Processing video (this may take a few minutes)...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await (ai as any).operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setCurrentStep(4);
        setStatus('Finalizing video download...');
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey,
          },
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error('Video generation error:', error);
      if (error.message?.includes('Requested entity was not found')) {
        setHasKey(false);
      }
    } finally {
      setLoading(false);
      setStatus('');
      setCurrentStep(0);
    }
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-12 text-center space-y-8 backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-blue-600/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <Shield className="w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tighter">Secure Access Required</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              To use the Veo Video Generation engine, you must select an API key from a paid Google Cloud project.
            </p>
          </div>
          <button 
            onClick={handleOpenKey}
            className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg group"
          >
            Select API Key
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <Info className="w-3 h-3" />
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-blue-400 transition-colors">Billing Documentation</a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[140px]"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-16">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest border border-blue-600/30">
            <Sparkles className="w-4 h-4" />
            Veo AI Engine v3.1
          </div>
          <h1 className="text-6xl font-black tracking-tighter">Educational Video Generation</h1>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Create high-fidelity medical educational videos from simple text prompts. Powered by the latest Veo video generation models.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Video Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the medical procedure or educational concept..."
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-lg font-medium text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none min-h-[200px] resize-none"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-6 rounded-2xl flex items-center justify-center gap-4 text-xl group relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-6 h-6" />
                    <span>Generate Video</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-8 bg-blue-600/5 border border-blue-600/20 rounded-[2rem] space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest">Generation Progress</h4>
                    <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest">Step {currentStep} of 4</span>
                  </div>
                  
                  <div className="space-y-6">
                    {steps.map((step) => (
                      <div key={step.id} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${
                          currentStep >= step.id 
                            ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                            : 'bg-white/5 text-slate-600 border border-white/10'
                        }`}>
                          {currentStep > step.id ? '✓' : step.id}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-black transition-colors duration-500 ${
                            currentStep >= step.id ? 'text-white' : 'text-slate-600'
                          }`}>{step.label}</p>
                          <p className={`text-[10px] font-medium transition-colors duration-500 ${
                            currentStep === step.id ? 'text-blue-400' : 'text-slate-700'
                          }`}>{step.description}</p>
                        </div>
                        {currentStep === step.id && (
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 text-blue-400/80">
                      <Info className="w-4 h-4 shrink-0" />
                      <p className="text-[10px] font-medium leading-relaxed italic">
                        {status || 'Preparing your cinematic medical visualization...'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-12 h-12 text-blue-400" />
              </div>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Generation Tips
              </h4>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { title: 'Be Descriptive', text: 'Include specific medical terms like "cellular level", "MRI scan style", or "3D anatomical model".' },
                  { title: 'Cinematic Style', text: 'Add keywords like "4K", "highly detailed", "professional lighting", or "slow motion".' },
                  { title: 'Patient Focus', text: 'Describe the patient demographic if relevant for more accurate educational context.' }
                ].map((tip, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs font-black text-slate-300">{tip.title}</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group">
              {videoUrl ? (
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full h-full object-cover rounded-[2.5rem]"
                  autoPlay
                />
              ) : (
                <div className="text-center space-y-6 p-12">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                    <Play className="w-10 h-10 text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Preview Window</p>
                    <p className="text-slate-600 font-medium">Your generated video will appear here.</p>
                  </div>
                </div>
              )}
              
              {videoUrl && (
                <div className="absolute bottom-8 right-8">
                  <a 
                    href={videoUrl} 
                    download="medical-video.mp4"
                    className="p-4 bg-white text-slate-950 rounded-2xl shadow-2xl hover:scale-110 transition-transform flex items-center gap-3 font-black uppercase tracking-widest text-[10px]"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
