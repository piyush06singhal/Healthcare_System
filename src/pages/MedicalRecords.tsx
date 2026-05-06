import { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  File, 
  Trash2, 
  ChevronRight, 
  Share2, 
  MoreVertical, 
  Shield, 
  Star, 
  Clock,
  Share,
  X,
  UserPlus,
  Link as LinkIcon,
  TrendingUp,
  AlertTriangle,
  Activity as ActivityIcon
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';

interface Record {
  id: string;
  name: string;
  date: string;
  type: string;
  size: string;
  doctor: string;
  category: string;
}

export default function MedicalRecords() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingRecord, setSharingRecord] = useState<Record | null>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<Record | null>(null);
  const [shareEmail, setShareEmail] = useState('');
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

  const [records, setRecords] = useState<Record[]>([
    { id: '1', name: 'Blood Test Report', date: 'Oct 12, 2026', type: 'PDF', size: '2.4 MB', doctor: 'Dr. Sarah Mitchell', category: 'Laboratory' },
    { id: '2', name: 'X-Ray Chest', date: 'Oct 05, 2026', type: 'Image', size: '5.1 MB', doctor: 'Dr. Robert Fox', category: 'Radiology' },
    { id: '3', name: 'Prescription - Fever', date: 'Sep 28, 2026', type: 'PDF', size: '1.2 MB', doctor: 'Dr. Sarah Mitchell', category: 'Prescription' },
    { id: '4', name: 'MRI Brain Scan', date: 'Sep 15, 2026', type: 'DICOM', size: '124 MB', doctor: 'Dr. Emily Chen', category: 'Radiology' },
  ]);

  const filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    record.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = () => {
    // Simulate sharing
    console.log(`Sharing record ${sharingRecord?.id} with ${shareEmail}`);
    setSharingRecord(null);
    setShareEmail('');
    // You could add a toast here
  };

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
            <p className="text-slate-500 font-medium max-w-md">Access and manage clinical documentation and imaging assets.</p>
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
                      <button 
                        onClick={() => setSharingRecord(record)}
                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center border border-slate-100"
                        title="Share"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
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
                    <button 
                      onClick={() => setViewingAnalysis(record)}
                      className="flex items-center gap-2 text-[10px] font-black text-purple-600 uppercase tracking-widest hover:gap-3 transition-all"
                    >
                      View Details
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Share Modal */}
        <AnimatePresence>
          {viewingAnalysis && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingAnalysis(null)}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 50 }}
                className="relative bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              >
                {/* Modal Header */}
                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-purple-600/20">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{viewingAnalysis.name}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">{viewingAnalysis.category}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Analyzed by MediFlow AI Core 2.0</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setViewingAnalysis(null)}
                    className="w-14 h-14 bg-white text-slate-400 border border-slate-200 rounded-2xl flex items-center justify-center hover:text-slate-900 transition-all shrink-0"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                  {/* Analysis Summary */}
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-[2.5rem] bg-emerald-50 border border-emerald-100">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-black text-emerald-950">Normal</div>
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Status Overview</div>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-blue-50 border border-blue-100">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <ActivityIcon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-black text-blue-950">12 Markers</div>
                      <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Total Indicators</div>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-amber-50 border border-amber-100">
                      <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-black text-amber-950">1 Alert</div>
                      <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">Attention Required</div>
                    </div>
                  </div>

                  {/* Detailed Values */}
                  <div className="space-y-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                      Biometric Marker Analysis
                    </h3>

                    <div className="space-y-4">
                      {[
                        { name: 'Hemoglobin (Hgb)', value: '14.2', unit: 'g/dL', range: '13.5 - 17.5', status: 'normal', width: '70%' },
                        { name: 'White Blood Cell Count', value: '7.4', unit: 'x10³/µL', range: '4.5 - 11.0', status: 'normal', width: '45%' },
                        { name: 'Fasting Plasma Glucose', value: '105', unit: 'mg/dL', range: '70 - 99', status: 'high', width: '85%' },
                        { name: 'Vitamin D, 25-Hydroxy', value: '42', unit: 'ng/mL', range: '30 - 100', status: 'normal', width: '35%' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group hover:border-purple-200 transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.range} (Normal Range)</div>
                              <div className="text-lg font-black text-slate-900">{item.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-black text-slate-900 leading-none">
                                {item.value} <span className="text-sm text-slate-400 font-bold">{item.unit}</span>
                              </div>
                              <div className={`text-[10px] font-black uppercase tracking-widest mt-2 px-3 py-1 rounded-full inline-block ${
                                item.status === 'normal' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                              }`}>
                                {item.status}
                              </div>
                            </div>
                          </div>
                          <div className="h-3 bg-slate-200 rounded-full overflow-hidden relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: item.width }}
                              transition={{ duration: 1.5, delay: 0.5 + idx * 0.1 }}
                              className={`h-full ${item.status === 'normal' ? 'bg-purple-600' : 'bg-rose-500'}`}
                            />
                            <div className="absolute left-[30%] top-0 bottom-0 w-px bg-slate-400/20" />
                            <div className="absolute left-[80%] top-0 bottom-0 w-px bg-slate-400/20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-10 rounded-[3rem] bg-slate-950 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="text-xl font-black mb-4">AI Clinical Insight</h4>
                      <p className="text-slate-400 text-base leading-relaxed font-medium">
                        Based on your results, we recommend increasing your dietary fiber intake and scheduling a follow-up for your Fasting Plasma Glucose, which is slightly elevated. Your metabolic efficiency remains high at 88/100.
                      </p>
                      <button className="mt-8 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-colors">
                        Consult AI Agent
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
                  </div>
                </div>

                <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                  <button 
                    onClick={() => setViewingAnalysis(null)}
                    className="px-8 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                  >
                    Close Secure View
                  </button>
                  <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Analysis
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <AnimatePresence>
          {sharingRecord && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSharingRecord(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Share Record</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Record Link</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSharingRecord(null)}
                    className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:text-slate-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-100">
                    <FileText className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-black text-slate-900 truncate">{sharingRecord.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sharingRecord.size} • {sharingRecord.type}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Share via Email</label>
                    <input 
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="doctor@medical.net"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleShare}
                      disabled={!shareEmail}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
                    >
                      <UserPlus className="w-4 h-4" />
                      Send Invite
                    </button>
                    <button className="p-4 bg-white text-slate-900 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-lg shadow-slate-200/50">
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <p className="text-[10px] font-bold text-emerald-800 leading-tight">
                    Information shared is encrypted. Re-access can be revoked at any time.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
            <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-purple-50 transition-colors shadow-2xl shadow-white/5">
              Upgrade Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
