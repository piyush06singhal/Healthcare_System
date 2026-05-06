import { Mail, Phone, MapPin, Send, Globe, MessageSquare, Clock, Shield, Star, ChevronDown, Github, Twitter, Instagram, Linkedin, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { useState, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const { scrollYProgress: pageScrollY } = useScroll();
  const scaleX = useSpring(pageScrollY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const contactRef = useRef(null);
  const { scrollYProgress: contactScrollY } = useScroll({
    target: contactRef,
    offset: ["start end", "end start"]
  });
  const contactY = useTransform(contactScrollY, [0, 1], [50, -50]);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post('/api/contact', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error: any) {
      console.error('Contact form error:', error);
      const serverMsg = error.response?.data?.error;
      const details = error.response?.data?.details;
      
      if (serverMsg) {
        alert(`${serverMsg}${details ? '\n\nDetails: ' + details : ''}`);
      } else {
        alert('Failed to send message via secure relay. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    { q: "How do I book an appointment?", a: "You can book an appointment directly through our website by clicking the 'Book Now' button or via our mobile app." },
    { q: "What insurance plans do you accept?", a: "We accept most major insurance plans. Please contact our support team for a specific list of providers." },
    { q: "Is my medical data secure?", a: "Yes, we use enterprise-grade encryption and strictly follow HIPAA guidelines to ensure your data is safe." },
    { q: "Do you offer 24/7 support?", a: "Our AI assistant is available 24/7, and our emergency clinical team is on standby for urgent needs." },
  ];

  return (
    <div className="bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <Navbar />
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[100] origin-left"
        style={{ scaleX }}
      />
      
      {/* Hero Section */}
      <section ref={targetRef} className="relative pt-48 pb-32 px-6 overflow-hidden">
        <motion.div style={{ opacity, y: bgY }} className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/40 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </motion.div>

        <motion.div style={{ scale, y: heroTextY }} className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-100 shadow-sm"
          >
            <MessageSquare className="w-3 h-3 fill-current" />
            Get In Touch
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8 text-slate-900"
          >
            We're Here <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">To Help You.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Have questions about our services or need technical support? Our dedicated team is ready to assist you 24/7.
          </motion.p>
        </motion.div>
      </section>

      {/* Main Contact Section */}
      <section ref={contactRef} className="py-24 px-6 relative overflow-hidden">
        <motion.div 
          style={{ x: useTransform(contactScrollY, [0, 1], [100, -100]) }}
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-5 pointer-events-none select-none flex items-center"
        >
          <div className="text-[20rem] font-black text-slate-900 whitespace-nowrap">GET IN TOUCH NOW</div>
        </motion.div>
        <motion.div style={{ y: contactY }} className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-12">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-6">Contact Information</h2>
                  <p className="text-slate-500 font-medium text-lg">Reach out to us through any of these channels.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  {[
                    { icon: <Phone className="w-6 h-6" />, label: "Call Us", value: "+91 9694984312", color: "text-blue-600", link: "tel:+919694984312" },
                    { icon: <Mail className="w-6 h-6" />, label: "Email Us", value: "piyush.singhal.2004@gmail.com", color: "text-emerald-600", link: "mailto:piyush.singhal.2004@gmail.com" },
                    { icon: <MapPin className="w-6 h-6" />, label: "Visit Us", value: "Jaipur, Rajasthan, India", color: "text-purple-600", link: "https://maps.app.goo.gl/jaipur" },
                    { icon: <MessageSquare className="w-6 h-6" />, label: "WhatsApp", value: "+91 9694984312", color: "text-green-500", link: "https://wa.me/919694984312" },
                  ].map((item, i) => (
                    <a 
                      key={i} 
                      href={item.link}
                      target={item.link.startsWith('http') ? "_blank" : undefined}
                      rel={item.link.startsWith('http') ? "noopener noreferrer" : undefined}
                      className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group block"
                    >
                      <div className={`${item.color} mb-4 group-hover:scale-110 transition-transform`}>{item.icon}</div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-lg font-black text-slate-900 break-all">{item.value}</div>
                    </a>
                  ))}
                </div>

                <div className="p-10 bg-blue-600 rounded-[3rem] text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-4">Join Our Community</h3>
                    <p className="opacity-80 mb-8 font-medium">Follow us on social media for the latest updates and health tips.</p>
                    <div className="flex gap-4">
                      {[
                        { icon: Github, url: "https://github.com/piyush06singhal" },
                        { icon: Twitter, url: "https://x.com/PiyushS07508112" },
                        { icon: Instagram, url: "https://www.instagram.com/_piyush_singhal12/" },
                        { icon: Linkedin, url: "https://www.linkedin.com/in/piyush--singhal/" }
                      ].map((social, i) => (
                        <a 
                          key={i} 
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors"
                        >
                          <social.icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20"
                  >
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                      <Star className="w-10 h-10 fill-current" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-slate-900">Message Sent!</h3>
                      <p className="text-slate-500 font-medium">Thank you for reaching out. Our team will get back to you shortly.</p>
                    </div>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-blue-600 font-black uppercase tracking-widest text-xs hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                        <input 
                          required
                          type="email" 
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Subject</label>
                      <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none"
                      >
                        <option>General Inquiry</option>
                        <option>Technical Support</option>
                        <option>Billing Question</option>
                        <option>Partnership</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Message</label>
                      <textarea 
                        required
                        rows={6} 
                        placeholder="How can we help you?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
                      ></textarea>
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                      {!isSubmitting && <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Map/Visual Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <motion.div 
          style={{ y: useTransform(pageScrollY, [1000, 2500], [0, 200]) }}
          className="absolute top-0 right-0 w-full h-full -z-10 opacity-10 pointer-events-none"
        >
          <div className="text-[25rem] font-black text-blue-900/10 whitespace-nowrap rotate-12">GLOBAL REACH</div>
        </motion.div>
        <div className="max-w-7xl mx-auto h-[600px] rounded-[4rem] overflow-hidden relative group shadow-2xl border-8 border-slate-50">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227748.3825624477!2d75.65046970865716!3d26.88544791796718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63d0cf22e09!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1711962643123!5m2!1sen!2sin" 
            className="w-full h-full border-0 grayscale group-hover:grayscale-0 transition-all duration-1000" 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          <div className="absolute bottom-12 left-12 z-[10] glass-card p-8 rounded-[2rem] border border-white/20 shadow-2xl pointer-events-none">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Our Location</h2>
            <p className="text-slate-500 font-medium">Jaipur, Rajasthan, India <br />Serving patients globally with distributed AI infrastructure.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-40 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium">Quick answers to common questions.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-8 flex items-center justify-between text-left"
                >
                  <span className="text-lg font-black text-slate-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8"
                    >
                      <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
