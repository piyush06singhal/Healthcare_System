import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { supabase } from '../lib/supabase';
import { 
  addPractitioner, 
  updatePractitioner, 
  deletePractitioner, 
  addNotification 
} from '../store/healthSlice';
import { toast } from 'sonner';
import GenericModal from '../components/GenericModal';

export default function StaffManagement() {
  const { practitioners } = useSelector((state: RootState) => state.health);
  const dispatch = useDispatch();
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
    status: 'Active' as const
  });

  const filteredPractitioners = practitioners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (p?: any) => {
    if (p) {
      setEditingId(p.id);
      setFormData({
        name: p.name,
        specialty: p.specialty,
        email: p.email,
        status: p.status
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        specialty: '',
        email: '',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.specialty || !formData.email) {
      toast.error('Clinical credentialing requires all fields.');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('practitioners').update(formData).eq('id', editingId);
        if (error) throw error;
        dispatch(updatePractitioner({ id: editingId, ...formData }));
        toast.success(`${formData.name}'s medical profile updated in cloud nodes.`);
      } else {
        const { data, error } = await supabase.from('practitioners').insert([formData]).select();
        if (error) throw error;
        const newPractitioner = data[0];
        dispatch(addPractitioner(newPractitioner));
        dispatch(addNotification({
          id: `notif-${Date.now()}`,
          title: 'Network Expansion',
          message: `${formData.name} has been onboarded to the clinical team.`,
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false
        }));
        toast.success(`New clinician protocol active for ${formData.name}.`);
      }
    } catch (error) {
      console.error("Staff management error:", error);
      toast.error("Synchronization failure. Local cache only.");
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Revoke ${name}'s clinical access? This will pause all associated neural links.`)) {
      try {
        const { error } = await supabase.from('practitioners').delete().eq('id', id);
        if (error) throw error;
        dispatch(deletePractitioner(id));
        toast.error(`Practitioner ${name} removed from active roster.`);
      } catch (error) {
        toast.error("De-provisioning failed at cloud level.");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              Medical Staff
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-black text-slate-950 tracking-tight">Practitioner Roster</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Manage encrypted clinical credentials and staff permissions.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-8 py-5 bg-blue-600 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 group"
        >
          <UserPlus className="w-5 h-5" />
          Onboard Clinician
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search credentials, specialties, nodes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-6 py-4 rounded-3xl bg-slate-50 border-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <div className="flex gap-2">
           <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
              <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredPractitioners.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-white rounded-[3.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                    <img 
                      src={`https://i.pravatar.cc/150?u=${p.id}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={p.name} 
                    />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                    p.status === 'Active' ? 'bg-emerald-500' : p.status === 'On Leave' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}>
                    {p.status === 'Active' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(p)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-white hover:text-blue-600 hover:shadow-lg transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:shadow-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{p.name}</h3>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{p.specialty}</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs font-bold">{p.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold">Node Access Level: Alpha</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black">
                        P{i}
                      </div>
                    ))}
                  </div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">124 Active Cases</div>
                </div>
              </div>

              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <GenericModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Clinical Node' : 'Initialize Clinician Onboarding'}
        description="Encrypted staff directory credentialing"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Clinical Name</label>
            <input 
              type="text" 
              placeholder="Dr. Alexander Vance"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Specialization</label>
              <input 
                type="text" 
                placeholder="Cardiologist"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5"
                value={formData.specialty}
                onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Status</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 appearance-none"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Emergency Only">Emergency Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Encrypted ID Email</label>
            <input 
              type="email" 
              placeholder="vance.a@mediflow.ai"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
          >
            {editingId ? 'Push Updates to Node' : 'Initialize Clinical Node'}
          </button>
        </div>
      </GenericModal>
    </div>
  );
}
