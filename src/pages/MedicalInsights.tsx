import { useState } from 'react';
import { searchMedicalKnowledge } from '../lib/ai';
import { Search, Globe, Loader2, ArrowRight, Shield, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function MedicalInsights() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchMedicalKnowledge(query);
      setResult(data);
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Medical engine unavailable. Verify your API key in settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
            <Globe className="w-4 h-4" />
            Real-time Medical Grounding
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">AI Medical Insights</h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
            Search the global medical knowledge base with AI-powered grounding. Get verified insights from clinical research and recent health developments.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-3xl p-2 shadow-2xl shadow-slate-200/50 group-focus-within:border-blue-600 transition-all">
            <div className="pl-6 pr-4">
              <Search className="w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for medical conditions, research, or treatments..."
              className="flex-1 bg-transparent border-none outline-none py-6 text-lg font-medium text-slate-900 placeholder:text-slate-400"
            />
            <button 
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Search
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <Shield className="w-8 h-8 text-emerald-500/20" />
                </div>
                <div className="prose prose-slate max-w-none">
                  <div className="text-slate-900 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                    {result.text}
                  </div>
                </div>
              </div>

              {result.sources.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Verified Sources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.sources.map((source: any, i: number) => (
                      <a 
                        key={i}
                        href={source.web?.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            <Globe className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                            {source.web?.title || 'Medical Source'}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
