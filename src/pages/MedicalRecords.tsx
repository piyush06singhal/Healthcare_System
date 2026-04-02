import { useState, useRef } from 'react';
import { FileText, Download, Eye, Search, Filter, Plus, File, Trash2, ChevronRight, Share2, MoreVertical, Shield, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';

export default function MedicalRecords() {
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const [records, setRecords] = useState([
    { id: '1', name: 'Blood Test Report', date: 'Oct 12, 2026', type: 'PDF', size: '2.4 MB', doctor: 'Dr. Sarah Mitchell', category: 'Laboratory' },
    { id: '2', name: 'X-Ray Chest', date: 'Oct 05, 2026', type: 'Image', size: '5.1 MB', doctor: 'Dr. Robert Fox', category: 'Radiology' },
    { id: '3', name: 'Prescription - Fever', date: 'Sep 28, 2026', type: 'PDF', size: '1.2 MB', doctor: 'Dr. Sarah Mitchell', category: 'Prescription' },
    { id: '4', name: 'MRI Brain Scan', date: 'Sep 15, 2026', type: 'DICOM', size: '124 MB', doctor: 'Dr. Emily Chen', category: 'Radiology' },
  ]);

  const filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    record.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-purple-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Parallax Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          style={{ y: y1, rotate }}
          className="absolute top-20 -left-20 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2, rotate: -rotate }}
          className="absolute bottom-40 -right-20 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
            <Shield className="w-3 h-3" />
            Secure Repository
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Medical Records</h1>
          <p className="text-slate-500 font-medium max-w-md">Access and manage your diagnostic reports, imaging assets, and clinical documentation.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12 py-3 w-64 text-sm bg-white border-slate-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/5 transition-all" 
              placeholder="Search records..." 
            />
          </div>
          <button className="btn-primary py-3 px-8 shadow-lg shadow-purple-600/20 group bg-gradient-to-r from-purple-600 to-blue-600 border-none">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Upload Record
          </button>
        </div>
      </div>

      {/* Categories / Filters */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {['All Records', 'Laboratory', 'Radiology', 'Prescription', 'Vaccinations'].map((cat, i) => (
          <button 
            key={cat}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              i === 0 ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-purple-600 hover:text-purple-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Records Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredRecords.map((record, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              key={record.id}
              className="card p-0 overflow-hidden group hover:shadow-2xl hover:shadow-purple-200/50 transition-all border-none bg-white"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 ${
                    record.type === 'PDF' ? 'bg-red-50 text-red-600' :
                    record.type === 'Image' ? 'bg-blue-50 text-blue-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-all flex items-center justify-center border border-slate-100">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center border border-slate-100">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest">
                      {record.category}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      {record.size}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors truncate">
                    {record.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${record.doctor}`} alt="Doctor" />
                    </div>
                    {record.doctor}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {record.date}
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black text-purple-600 uppercase tracking-widest hover:gap-3 transition-all">
                  View Details
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredRecords.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-32 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200"
        >
          <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[32px] flex items-center justify-center mx-auto mb-8">
            <FileText className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3">No Records Found</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">We couldn't find any medical records matching your search. Try adjusting your filters or search terms.</p>
          <button className="btn-primary px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 border-none shadow-xl shadow-purple-600/20">
            Upload New Record
          </button>
        </motion.div>
      )}

      {/* Storage Info Card */}
      <div className="card p-8 bg-slate-900 text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Cloud Storage Status</h3>
                <p className="text-white/60 text-sm font-medium">Your medical data is encrypted and stored securely.</p>
              </div>
            </div>
            <div className="w-full max-w-md bg-white/10 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              ></motion.div>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
              <span>6.5 GB Used</span>
              <span>10 GB Total</span>
            </div>
          </div>
          <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-purple-50 transition-colors">
            Upgrade Storage
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
