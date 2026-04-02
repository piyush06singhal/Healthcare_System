import { Shield, Lock, Eye, FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Data Collection",
      icon: <Eye className="w-6 h-6 text-blue-600" />,
      content: "We collect information that you provide directly to us, including personal identifiers, health records, and contact information when you register for an account or use our services."
    },
    {
      title: "How We Use Your Data",
      icon: <FileText className="w-6 h-6 text-purple-600" />,
      content: "Your data is used to provide clinical insights, manage appointments, and improve our AI models. We never sell your personal health information to third parties."
    },
    {
      title: "Data Security",
      icon: <Shield className="w-6 h-6 text-emerald-600" />,
      content: "We implement enterprise-grade encryption and follow strict HIPAA guidelines to ensure your medical data remains confidential and secure at all times."
    },
    {
      title: "Your Rights",
      icon: <Lock className="w-6 h-6 text-rose-600" />,
      content: "You have the right to access, correct, or delete your personal data. You can also request a copy of your medical records stored on our platform."
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
              <Shield className="w-3 h-3 fill-current" />
              Legal & Privacy
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-none">Privacy Policy</h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
              Your privacy is our technical priority. We've built MediFlow AI with a privacy-first architecture to protect your most sensitive data.
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
            <h2 className="text-3xl font-black text-slate-900 mb-8">Detailed Information</h2>
            <div className="space-y-8 text-slate-500 font-medium leading-relaxed">
              <p>
                This Privacy Policy describes how MediFlow AI collects, uses, and shares your personal information. By using our services, you agree to the collection and use of information in accordance with this policy.
              </p>
              <h3 className="text-xl font-black text-slate-900">1. Information Collection</h3>
              <p>
                We collect several different types of information for various purposes to provide and improve our Service to you. Types of data collected include Email address, First name and last name, Phone number, Address, State, Province, ZIP/Postal code, City, and Cookies and Usage Data.
              </p>
              <h3 className="text-xl font-black text-slate-900">2. Use of Data</h3>
              <p>
                MediFlow AI uses the collected data for various purposes: To provide and maintain our Service, to notify you about changes to our Service, to allow you to participate in interactive features of our Service when you choose to do so, to provide customer support, to gather analysis or valuable information so that we can improve our Service, to monitor the usage of our Service, and to detect, prevent and address technical issues.
              </p>
              <h3 className="text-xl font-black text-slate-900">3. Security of Data</h3>
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
