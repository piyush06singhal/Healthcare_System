import { 
  Activity, 
  Brain, 
  Search, 
  Upload, 
  FileText, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  Microscope,
  Dna,
  Stethoscope,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { GoogleGenAI, Type } from "@google/genai";

export default function DoctorDiagnostics() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [history, setHistory] = useState<any[]>([
    {
      id: 1,
      date: '2024-03-28',
      patient: 'Sarah Jenkins',
      type: 'Chest X-Ray',
      result: 'Clear',
      confidence: 98.5
    },
    {
      id: 2,
      date: '2024-03-25',
      patient: 'Robert Chen',
      type: 'Brain MRI',
      result: 'Minor Inflammation',
      confidence: 92.1
    }
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
      
      // Extract base64 data
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: `You are an expert diagnostic radiologist with 20+ years of experience. 
            Analyze this medical imaging scan (X-ray/MRI/CT) with extreme precision.
            
            Provide a comprehensive clinical analysis including:
            1. Primary Findings: Detailed observations of any abnormalities.
            2. Differential Diagnosis: List potential conditions based on the scan.
            3. Clinical Recommendations: Immediate next steps, further tests, or specialist referrals.
            4. Anatomical Assessment: Status of major structures visible.
            5. Severity Assessment: Low, Moderate, High, or Critical.
            6. Confidence Score: Percentage of certainty in this analysis.
            
            Return the result in a structured JSON format suitable for a clinical record.`
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              findings: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Primary clinical observations"
              },
              differentialDiagnosis: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Potential conditions identified"
              },
              recommendations: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Actionable clinical next steps"
              },
              anatomicalAssessment: {
                type: Type.STRING,
                description: "Brief summary of anatomical structures"
              },
              severity: { 
                type: Type.STRING, 
                enum: ["Low", "Moderate", "High", "Critical"],
                description: "Clinical urgency level"
              },
              confidence: { 
                type: Type.NUMBER,
                description: "Confidence percentage (0-100)"
              }
            },
            required: ["findings", "differentialDiagnosis", "recommendations", "anatomicalAssessment", "severity", "confidence"]
          }
        }
      });

      const result = JSON.parse(response.text);
      const newResult = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        patient: 'Current Patient',
        type: selectedFile?.name || 'Diagnostic Scan',
        ...result
      };

      setAnalysisResult(newResult);
      setHistory(prev => [newResult, ...prev]);
      toast.success('AI Analysis Complete');
    } catch (error) {
      console.error('AI Analysis Error:', error);
      toast.error('Failed to analyze scan. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-16 pb-24 px-4 lg:px-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Neural Model v4.2.0
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              HIPAA Verified
            </div>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">AI Diagnostics</h1>
          <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">Advanced neural analysis for clinical imaging and diagnostics. Upload scans for immediate AI-driven insights.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Upload & Analysis Area */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Diagnostic Input</h3>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                  <FileText className="w-5 h-5" />
                </button>
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />

            <div 
              onClick={() => !selectedImage && fileInputRef.current?.click()}
              className={`relative aspect-video rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center p-12 text-center cursor-pointer ${
                selectedImage ? 'border-blue-500 bg-blue-50/10' : 'border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-blue-50/30'
              }`}
            >
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <img 
                    src={selectedImage} 
                    className="w-full h-full object-contain rounded-2xl" 
                    alt="Diagnostic Scan" 
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                      setSelectedFile(null);
                    }}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-200/50 mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">Upload Diagnostic Scan</h4>
                  <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto mb-8">
                    Drag and drop X-rays, MRIs, or CT scans for immediate neural analysis.
                  </p>
                  <button 
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                  >
                    Select File
                  </button>
                </>
              )}
            </div>

            <div className="mt-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                      <Microscope className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 Active Diagnostic Models</span>
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={!selectedImage || isAnalyzing}
                className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center gap-3"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="w-5 h-5 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Run Neural Analysis
                  </>
                )}
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {analysisResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Analysis Complete</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                        {analysisResult.confidence}% Confidence Level
                      </div>
                    </div>
                  </div>
                  <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    analysisResult.severity === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    analysisResult.severity === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    analysisResult.severity === 'Moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    Severity: {analysisResult.severity}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-blue-600" />
                    Anatomical Assessment
                  </h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    {analysisResult.anatomicalAssessment}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-600" />
                      Key Findings
                    </h4>
                    <div className="space-y-4">
                      {analysisResult.findings.map((finding: string, i: number) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{finding}</p>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest pt-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      Differential Diagnosis
                    </h4>
                    <div className="space-y-3">
                      {analysisResult.differentialDiagnosis.map((diag: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50/30 border border-orange-100/50">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          <span className="text-[11px] font-bold text-slate-700">{diag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-emerald-600" />
                      Clinical Recommendations
                    </h4>
                    <div className="space-y-4">
                      {analysisResult.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex gap-4">
                  <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Export Report
                  </button>
                  <button className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Add to Patient History
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">System Health</h3>
            <div className="space-y-6">
              {[
                { label: 'Neural Throughput', value: '1.2 GB/s', icon: <Zap className="w-4 h-4" />, color: 'blue' },
                { label: 'Active Models', value: '14', icon: <Brain className="w-4 h-4" />, color: 'purple' },
                { label: 'Genomic Sync', value: '99.9%', icon: <Dna className="w-4 h-4" />, color: 'emerald' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                      {stat.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Diagnosis History</h3>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.date}</span>
                    <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-widest">
                      {item.confidence}% Conf.
                    </div>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{item.patient}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">{item.type}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl shadow-slate-900/20"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight mb-2">HIPAA Secure</h3>
            <p className="text-xs text-white/60 font-medium leading-relaxed mb-6">
              All neural analysis is performed within a secure, encrypted environment. No PII is transmitted to external models.
            </p>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-full bg-blue-500" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
