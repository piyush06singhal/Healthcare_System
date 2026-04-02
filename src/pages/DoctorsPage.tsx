import { Search, Filter, Star, MapPin, Calendar, ArrowRight, CheckCircle2, Heart, Shield, Users, ChevronRight, X, Clock, Activity, Phone, Award, BookOpen } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const doctors = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 124,
    location: "New York, USA",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
    tags: ["Heart Health", "Surgery"]
  },
  {
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    rating: 4.8,
    reviews: 98,
    location: "San Francisco, USA",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800",
    tags: ["Brain", "Nerves"]
  },
  {
    name: "Dr. Emily Brown",
    specialty: "Pediatrician",
    rating: 5.0,
    reviews: 215,
    location: "Chicago, USA",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
    tags: ["Children", "Vaccination"]
  },
  {
    name: "Dr. David Wilson",
    specialty: "Dermatologist",
    rating: 4.7,
    reviews: 86,
    location: "Los Angeles, USA",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800",
    tags: ["Skin", "Laser"]
  },
  {
    name: "Dr. Lisa Garcia",
    specialty: "Psychiatrist",
    rating: 4.9,
    reviews: 156,
    location: "Miami, USA",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=800",
    tags: ["Mental Health", "Therapy"]
  },
  {
    name: "Dr. James Miller",
    specialty: "Orthopedic",
    rating: 4.8,
    reviews: 112,
    location: "Seattle, USA",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800",
    tags: ["Bones", "Sports"]
  }
];

export default function DoctorsPage() {
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

  const featuredRef = useRef(null);
  const { scrollYProgress: featuredScrollY } = useScroll({
    target: featuredRef,
    offset: ["start end", "end start"]
  });
  const featuredX = useTransform(featuredScrollY, [0, 1], [100, -100]);

  const gridRef = useRef(null);
  const { scrollYProgress: gridScrollY } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"]
  });
  const gridY = useTransform(gridScrollY, [0, 1], [50, -50]);

  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Cardiologist", "Neurologist", "Pediatrician", "Dermatologist", "Psychiatrist", "Orthopedic"];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || doc.specialty === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <Users className="w-3 h-3 fill-current" />
            Our Specialists
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8 text-slate-900"
          >
            Find The Best <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">Medical Experts.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Connect with world-class healthcare professionals across various specialties. Your health is our top priority.
          </motion.p>
        </motion.div>
      </section>

      {/* Featured Doctors Horizontal Scroll */}
      <section ref={featuredRef} className="py-20 px-6 bg-slate-50 overflow-hidden relative">
        <motion.div 
          style={{ x: featuredX }}
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-5 pointer-events-none select-none flex items-center"
        >
          <div className="text-[20rem] font-black text-slate-900 whitespace-nowrap">TOP RATED SPECIALISTS</div>
        </motion.div>
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Featured Specialists</h2>
              <p className="text-slate-500 font-medium">Top-rated doctors with exceptional patient feedback.</p>
            </div>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-lg transition-all">
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-lg transition-all">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8 overflow-x-auto pb-12 px-6 no-scrollbar snap-x snap-mandatory">
          {doctors.slice(0, 4).map((doc, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[300px] md:min-w-[400px] bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 snap-center group hover:glow-primary transition-all duration-500"
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden flex-shrink-0 border-4 border-slate-50">
                  <img src={doc.image} className="w-full h-full object-cover" alt={doc.name} referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">{doc.name}</h3>
                  <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest">{doc.specialty}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-black text-slate-900">{doc.rating}</span>
                    <span className="text-xs text-slate-400 font-bold">({doc.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                Expert in {doc.tags.join(", ")} with a focus on patient-centered clinical excellence.
              </p>
              <button className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white transition-all">
                View Full Profile
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, specialty, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <button 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(() => {
                      setSearchQuery("New York"); // Mocking location search
                      toast.success("Finding specialists near you...");
                    }, () => {
                      toast.error("Location access denied. Please search manually.");
                    });
                  }
                }}
                className="flex items-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-[10px] whitespace-nowrap hover:bg-emerald-100 transition-all"
              >
                <MapPin className="w-3 h-3" />
                Find Near Me
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section ref={gridRef} className="py-24 px-6 relative">
        <motion.div style={{ y: gridY }} className="max-w-7xl mx-auto">
          {filteredDoctors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredDoctors.map((doc, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i % 3 * 0.1, duration: 0.8, ease: "easeOut" }}
                whileHover={{ y: -15 }}
                onClick={() => setSelectedDoctor(doc)}
                className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-slate-100 group transition-all duration-500 hover:shadow-2xl hover:shadow-blue-600/10 cursor-pointer"
              >
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={doc.image} 
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700" 
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <div className="flex gap-3 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                      <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors">
                        Quick Book
                      </button>
                      <button className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl flex items-center gap-2 shadow-lg border border-white/50">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="font-black text-sm text-slate-900">{doc.rating}</span>
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{doc.name}</h3>
                      <p className="text-blue-600 font-black text-xs uppercase tracking-widest">{doc.specialty}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Shield className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-500 font-medium mb-8">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{doc.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {doc.tags.map((tag, j) => (
                      <span key={j} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 group/btn shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20">
                    Book Appointment
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No specialists found</h3>
              <p className="text-slate-500 font-medium">Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="py-40 px-6 bg-slate-50 relative overflow-hidden">
        <motion.div 
          style={{ y: useTransform(pageScrollY, [1500, 3000], [0, 200]) }}
          className="absolute top-0 right-0 w-full h-full -z-10 opacity-5 pointer-events-none"
        >
          <div className="text-[25rem] font-black text-blue-900/10 whitespace-nowrap rotate-12">TRUSTED CARE</div>
        </motion.div>
        <motion.div 
          style={{ y: useTransform(pageScrollY, [2000, 3500], [0, -100]) }}
          className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center"
        >
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 tracking-tight">Why Choose Our <br /> Specialists?</h2>
            <div className="space-y-6">
              {[
                "Verified and highly experienced professionals.",
                "Real-time availability and instant booking.",
                "Secure and private consultations.",
                "Comprehensive follow-up care."
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-slate-600 font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1505751172107-573957a003df?auto=format&fit=crop&q=80&w=1200" 
                className="w-full h-auto" 
                alt="Medical Care"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certified</div>
                  <div className="text-lg font-black text-slate-900">100% Verified</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />

      {/* Doctor Profile Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoctor(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-2/5 relative h-64 md:h-auto">
                <img 
                  src={selectedDoctor.image} 
                  className="w-full h-full object-cover" 
                  alt={selectedDoctor.name} 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                    <Award className="w-3 h-3" />
                    Top Specialist
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">{selectedDoctor.name}</h2>
                  <p className="text-blue-300 font-bold text-sm uppercase tracking-widest">{selectedDoctor.specialty}</p>
                </div>
              </div>

              <div className="flex-1 p-10 overflow-y-auto max-h-[80vh] no-scrollbar">
                <div className="flex justify-end mb-4 absolute top-6 right-6 z-10">
                  <button 
                    onClick={() => setSelectedDoctor(null)}
                    className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white md:text-slate-400 md:bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-10">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</div>
                      <div className="text-lg font-black text-slate-900">12+ Years</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</div>
                      <div className="text-lg font-black text-slate-900 flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        {selectedDoctor.rating}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reviews</div>
                      <div className="text-lg font-black text-slate-900">{selectedDoctor.reviews}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      About Specialist
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {selectedDoctor.name} is a world-renowned {selectedDoctor.specialty} with over 12 years of clinical experience. 
                      Specializing in advanced medical procedures and patient-centered care, they have successfully treated thousands of patients 
                      with complex conditions. Their approach combines cutting-edge technology with compassionate care.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.tags.map((tag: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100">
                          {tag}
                        </span>
                      ))}
                      <span className="px-4 py-2 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100">
                        Clinical Research
                      </span>
                      <span className="px-4 py-2 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100">
                        Diagnostics
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Availability
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                          <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{day}</div>
                          <div className="text-xs font-bold text-slate-900">9:00 AM</div>
                        </div>
                      ))}
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center ring-2 ring-blue-600 ring-offset-2">
                        <div className="text-[10px] font-black text-blue-600 uppercase mb-1">Today</div>
                        <div className="text-xs font-black text-blue-600">2:30 PM</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center opacity-50">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Sun</div>
                        <div className="text-xs font-bold text-slate-400">Closed</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-6">
                    <button className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3">
                      Book Appointment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                      <Heart className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
