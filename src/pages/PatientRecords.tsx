import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Plus, 
  MoreVertical,
  Shield,
  FlaskConical,
  Stethoscope,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const medicalRecords = [
  { id: 'REC-001', name: 'Annual Physical Report', date: 'Oct 12, 2026', type: 'Report', doctor: 'Dr. Sarah Mitchell', size: '2.4 MB', icon: <FileText className="w-6 h-6" />, color: 'blue' },
  { id: 'REC-002', name: 'Blood Chemistry Panel', date: 'Sep 28, 2026', type: 'Lab', doctor: 'Dr. James Wilson', size: '1.8 MB', icon: <FlaskConical className="w-6 h-6" />, color: 'emerald' },
  { id: 'REC-003', name: 'Chest X-Ray Analysis', date: 'Aug 15, 2026', type: 'Imaging', doctor: 'Dr. Elena Rodriguez', size: '15.2 MB', icon: <Activity className="w-6 h-6" />, color: 'indigo' },
  { id: 'REC-004', name: 'Cardiology Consultation', date: 'Jul 22, 2026', type: 'Consultation', doctor: 'Dr. Sarah Mitchell', size: '0.8 MB', icon: <Stethoscope className="w-6 h-6" />, color: 'rose' },
];

export default function PatientRecords() {
  const [search, setSearch] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Medical Records</h1>
          <p className="text-slate-500 font-medium mt-1">Secure access to your clinical history and lab results.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records..." 
              className="pl-12 pr-6 py-4 rounded-[2rem] bg-white border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all w-80 text-slate-900 shadow-sm"
            />
          </div>
          <button className="px-8 py-4 bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload New
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {medicalRecords.map((record, i) => (
            <motion.div
              key={record.id}
              variants={itemVariants}
              whileHover={{ x: 10 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 group flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl bg-${record.color}-50 text-${record.color}-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                  {record.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{record.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{record.type}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{record.date}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{record.doctor}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-10">
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Data Privacy</h3>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
              All your medical records are encrypted with 256-bit AES encryption and stored in HIPAA-compliant servers.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Logs</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sharing</span>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Disabled</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
