import { MessageSquare, Search, Book, HelpCircle, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HelpCenter() {
  const categories = [
    {
      title: "Getting Started",
      icon: <Book className="w-6 h-6 text-blue-600" />,
      articles: ["Setting up your account", "Connecting your medical records", "First appointment guide"]
    },
    {
      title: "Using the Platform",
      icon: <HelpCircle className="w-6 h-6 text-purple-600" />,
      articles: ["Booking appointments", "Using AI Symptom Predictor", "Managing your profile"]
    },
    {
      title: "Security & Privacy",
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
      articles: ["Data encryption details", "HIPAA compliance", "Managing your data"]
    }
  ];

  return (
    <div className="bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 mb-24"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 mx-auto">
              <HelpCircle className="w-3 h-3 fill-current" />
              Support Center
            </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 leading-none">How can we <br /> help you?</h1>
            
            <div className="max-w-2xl mx-auto relative group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search for articles, guides, or help..."
                className="w-full pl-20 pr-8 py-8 bg-slate-50 border-none rounded-[2.5rem] focus:ring-2 focus:ring-blue-600 transition-all font-medium text-lg shadow-inner"
              />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-6">{cat.title}</h3>
                <ul className="space-y-4">
                  {cat.articles.map((article, j) => (
                    <li key={j}>
                      <button className="flex items-center justify-between w-full text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group/item">
                        {article}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="bg-blue-600 rounded-[4rem] p-16 lg:p-24 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-8 leading-none">Still need help?</h2>
                <p className="text-xl text-white/80 font-medium mb-12">
                  Our dedicated support team is available 24/7 to assist you with any technical or clinical questions.
                </p>
                <Link to="/contact" className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all inline-flex items-center gap-4 group">
                  Contact Support
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                  <div className="text-3xl font-black mb-2">24/7</div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Availability</div>
                </div>
                <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                  <div className="text-3xl font-black mb-2">&lt; 15m</div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Response Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
