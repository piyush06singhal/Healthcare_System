import { Search, Filter, Star, MapPin, Calendar, ArrowRight, CheckCircle2, Heart, Shield, Users, Clock, MessageSquare, BookOpen, TrendingUp, Zap } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const posts = [
  {
    title: "The Future of AI in Modern Healthcare",
    excerpt: "Exploring how artificial intelligence is revolutionizing diagnostics and patient care delivery.",
    author: "Dr. Sarah Johnson",
    date: "Mar 24, 2026",
    readTime: "8 min read",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "10 Tips for Maintaining a Healthy Heart",
    excerpt: "Simple lifestyle changes that can significantly reduce your risk of cardiovascular diseases.",
    author: "Dr. Michael Chen",
    date: "Mar 22, 2026",
    readTime: "5 min read",
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1505751172107-573957a003df?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Understanding Mental Health in the Digital Age",
    excerpt: "How social media and constant connectivity are impacting our psychological well-being.",
    author: "Dr. Lisa Garcia",
    date: "Mar 20, 2026",
    readTime: "12 min read",
    category: "Mental Health",
    image: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee1?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "The Importance of Regular Health Checkups",
    excerpt: "Why preventive care is the most effective way to manage long-term health outcomes.",
    author: "Dr. Emily Brown",
    date: "Mar 18, 2026",
    readTime: "6 min read",
    category: "Prevention",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Nutrition Myths Debunked by Science",
    excerpt: "Separating fact from fiction in the world of dietary advice and popular health trends.",
    author: "Dr. David Wilson",
    date: "Mar 15, 2026",
    readTime: "10 min read",
    category: "Nutrition",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17051?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Advances in Pediatric Vaccination",
    excerpt: "New developments in vaccines that are helping protect children from emerging diseases.",
    author: "Dr. James Miller",
    date: "Mar 12, 2026",
    readTime: "7 min read",
    category: "Pediatrics",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800"
  }
];

export default function BlogPage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const { scrollYProgress: heroScrollY } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(heroScrollY, [0, 0.5], [1, 0]);
  const scale = useTransform(heroScrollY, [0, 0.5], [1, 0.9]);
  const bgY = useTransform(heroScrollY, [0, 1], ["0%", "50%"]);
  const heroTextY = useTransform(heroScrollY, [0, 1], ["0%", "100%"]);

  const { scrollYProgress: featuredScrollY } = useScroll({
    target: featuredRef,
    offset: ["start end", "end start"]
  });
  const featuredY = useTransform(featuredScrollY, [0, 1], [100, -100]);

  const { scrollYProgress: gridScrollY } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"]
  });
  const gridY = useTransform(gridScrollY, [0, 1], [50, -50]);

  const { scrollYProgress: newsletterScrollY } = useScroll({
    target: newsletterRef,
    offset: ["start end", "end start"]
  });
  const newsletterY = useTransform(newsletterScrollY, [0, 1], [100, -100]);

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
            <BookOpen className="w-3 h-3 fill-current" />
            Health Insights
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8 text-slate-900"
          >
            Latest News <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">& Expert Advice.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Stay informed with the latest medical research, health tips, and industry news from our team of experts.
          </motion.p>
        </motion.div>
      </section>

      {/* Featured Post */}
      <section ref={featuredRef} className="py-12 px-6 relative overflow-hidden">
        <motion.div 
          style={{ x: useTransform(featuredScrollY, [0, 1], [-100, 100]) }}
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-5 pointer-events-none select-none flex items-center"
        >
          <div className="text-[20rem] font-black text-slate-900 whitespace-nowrap uppercase">FEATURED STORY</div>
        </motion.div>
        <motion.div style={{ y: featuredY }} className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative"
          >
            <div className="lg:w-1/2 relative h-80 lg:h-auto overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000" 
                alt="Featured Post"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-8 left-8 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                Featured Post
              </div>
            </div>
            <div className="lg:w-1/2 p-12 lg:p-24 text-white flex flex-col justify-center">
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-blue-400 mb-6">
                <TrendingUp className="w-4 h-4" />
                Trending Now
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-tight">The Impact of Telemedicine on Global Health Access</h2>
              <p className="text-slate-400 mb-10 text-lg font-medium leading-relaxed">How remote consultations are breaking down geographical barriers and providing quality healthcare to underserved populations worldwide.</p>
              <button className="flex items-center gap-4 font-black text-xs uppercase tracking-widest group">
                Read Full Article
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mb-32 blur-3xl"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Blog Grid */}
      <section ref={gridRef} className="py-24 px-6 relative overflow-hidden">
        <motion.div 
          style={{ x: useTransform(gridScrollY, [0, 1], [100, -100]) }}
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-5 pointer-events-none select-none flex items-center"
        >
          <div className="text-[20rem] font-black text-slate-900 whitespace-nowrap uppercase">HEALTH INSIGHTS</div>
        </motion.div>
        <motion.div style={{ y: gridY }} className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((post, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i % 3 * 0.1, duration: 0.8, ease: "easeOut" }}
                whileHover={{ y: -15 }}
                className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-slate-100 group transition-all duration-500 hover:shadow-2xl hover:shadow-blue-600/10"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={post.image} 
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700" 
                    alt={post.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
                    {post.category}
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">{post.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8 line-clamp-2">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-[10px]">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs font-black text-slate-900">{post.author}</span>
                    </div>
                    <button className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl flex items-center justify-center transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Newsletter Section */}
      <section ref={newsletterRef} className="py-40 px-6 relative overflow-hidden">
        <motion.div 
          style={{ y: newsletterY }}
          className="max-w-7xl mx-auto bg-slate-50 rounded-[4rem] p-16 lg:p-24 relative overflow-hidden"
        >
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[100px] animate-pulse"></div>
          <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Subscribe to Our <br /> Health Newsletter</h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">Get the latest health insights and expert advice delivered straight to your inbox every week.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="flex-1 px-8 py-6 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium shadow-xl"
              />
              <button className="px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 group">
                Subscribe
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
