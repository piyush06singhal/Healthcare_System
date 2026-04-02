import { FileText, CheckCircle2, ChevronRight, ArrowLeft, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsOfService() {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: <Scale className="w-6 h-6 text-blue-600" />,
      content: "By accessing or using MediFlow AI, you agree to be bound by these Terms of Service and all applicable laws and regulations."
    },
    {
      title: "User Responsibilities",
      icon: <CheckCircle2 className="w-6 h-6 text-purple-600" />,
      content: "You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer."
    },
    {
      title: "Service Limitations",
      icon: <FileText className="w-6 h-6 text-emerald-600" />,
      content: "MediFlow AI provides AI-driven health insights, which are not a substitute for professional medical advice, diagnosis, or treatment."
    }
  ];

  return (
    <div className="bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-purple-100">
              <Scale className="w-3 h-3 fill-current" />
              Legal & Compliance
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-none">Terms of Service</h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
              Please read these terms carefully before using our platform. Your use of MediFlow AI constitutes your agreement to these terms.
            </p>
          </motion.div>

          <div className="grid gap-8 mb-20">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 hover:shadow-xl transition-all group"
              >
                <div className="flex gap-8">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4">{section.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-3xl font-black text-slate-900 mb-8">Detailed Terms</h2>
            <div className="space-y-8 text-slate-500 font-medium leading-relaxed">
              <h3 className="text-xl font-black text-slate-900">1. Use License</h3>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on MediFlow AI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose, or for any public display (commercial or non-commercial); attempt to decompile or reverse engineer any software contained on MediFlow AI's website; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or "mirror" the materials on any other server.
              </p>
              <h3 className="text-xl font-black text-slate-900">2. Disclaimer</h3>
              <p>
                The materials on MediFlow AI's website are provided on an 'as is' basis. MediFlow AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <h3 className="text-xl font-black text-slate-900">3. Limitations</h3>
              <p>
                In no event shall MediFlow AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MediFlow AI's website, even if MediFlow AI or a MediFlow AI authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
