import { Link } from 'react-router-dom';
import { Activity, Globe, Lock, Cpu, Shield, Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white py-24 px-6 overflow-hidden relative border-t border-white/5">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[140px] animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-10">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-blue-600/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Activity className="w-7 h-7" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-white">MediFlow</span>
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              Revolutionizing healthcare through <span className="text-white font-bold">AI-driven insights</span> and secure medical data management. Precision-engineered for clinical excellence.
            </p>
            <div className="flex gap-5">
              {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -8, scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500">Platform</h4>
              <ul className="space-y-5 text-slate-400 font-bold text-sm">
                <li><Link to="/services" className="hover:text-white hover:translate-x-2 transition-all inline-block">Our Services</Link></li>
                <li><Link to="/about" className="hover:text-white hover:translate-x-2 transition-all inline-block">About Us</Link></li>
                <li><Link to="/doctors" className="hover:text-white hover:translate-x-2 transition-all inline-block">Find Doctors</Link></li>
                <li><Link to="/blog" className="hover:text-white hover:translate-x-2 transition-all inline-block">Health Blog</Link></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-purple-500">Support</h4>
              <ul className="space-y-5 text-slate-400 font-bold text-sm">
                <li><Link to="/help" className="hover:text-white hover:translate-x-2 transition-all inline-block">Help Center</Link></li>
                <li><Link to="/privacy" className="hover:text-white hover:translate-x-2 transition-all inline-block">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white hover:translate-x-2 transition-all inline-block">Terms of Service</Link></li>
                <li><Link to="/security" className="hover:text-white hover:translate-x-2 transition-all inline-block">Security</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4 space-y-10">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Mail className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-white tracking-tight">Stay in the Loop</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Join 10,000+ medical professionals receiving our weekly AI health insights.
                </p>
              </div>
              <form className="relative" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                />
                <button className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                  Subscribe
                </button>
              </form>
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Encrypted & Secure
              </div>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white/5 border border-white/10 rounded-[2rem]">
          <div className="flex items-center gap-5 group">
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Support</div>
              <div className="text-white font-bold text-sm">hello@mediflow.ai</div>
            </div>
          </div>
          <div className="flex items-center gap-5 group">
            <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Emergency Line</div>
              <div className="text-white font-bold text-sm">+1 (800) MEDI-HELP</div>
            </div>
          </div>
          <div className="flex items-center gap-5 group">
            <div className="w-12 h-12 bg-rose-600/20 text-rose-400 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Global HQ</div>
              <div className="text-white font-bold text-sm">San Francisco, CA</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-slate-500 font-bold text-xs flex items-center gap-2">
            &copy; {currentYear} MediFlow AI.
            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
            Precision-engineered for clinical excellence.
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-slate-500 font-bold text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <Globe className="w-3.5 h-3.5" />
              English (US)
            </div>
            <div className="flex items-center gap-3 text-emerald-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
