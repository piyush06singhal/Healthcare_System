import { 
  Users, 
  Plus, 
  Shield, 
  Baby, 
  User, 
  Heart,
  ChevronRight,
  MoreVertical,
  Activity,
  Calendar,
  Pill,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { switchProfile } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

export default function PatientFamily() {
  const { user, activeProfile } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dbMembers, setDbMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (!error && data) setDbMembers(data);
    };

    fetchMembers();

    const channel = supabase
      .channel('family_members_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'family_members',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDbMembers(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setDbMembers(prev => prev.filter(m => m.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setDbMembers(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const familyMembers = useMemo(() => {
    const primary = { 
      id: user?.id || 'primary', 
      name: user?.name || 'Primary User', 
      role: 'patient', 
      relation: 'Self', 
      avatar: (user as any)?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
      health_score: 95,
      active_meds: 1
    };

    const members = dbMembers.map(m => ({
      id: m.id,
      name: m.name,
      role: 'patient',
      relation: m.relation,
      avatar: m.avatar_url || `https://i.pravatar.cc/150?u=${m.id}`,
      health_score: m.health_score,
      active_meds: m.active_meds
    }));

    return [primary, ...members];
  }, [user, dbMembers]);

  const handleAddMember = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('family_members').insert([{
        user_id: user.id,
        name: 'New Dependent',
        relation: 'Dependent',
        blood_group: 'Pending',
        last_checkup: new Date().toLocaleDateString()
      }]);

      if (error) throw error;
      toast.success('New dependent profile initialized in clinical vault.');
    } catch (err) {
      toast.error('Failed to synchronize family record.');
    }
  };

  const handleSwitch = (member: any) => {
    dispatch(switchProfile({
      id: member.id,
      name: member.name,
      role: member.role as 'patient' | 'doctor',
      avatar: member.avatar,
      relation: member.relation
    }));
    toast.success(`Profile switched to ${member.name}`, {
      description: `Now viewing ${member.relation}'s clinical records.`,
      icon: <Users className="w-4 h-4 text-indigo-500" />
    });
    navigate('/dashboard');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-24"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
              Family Vault
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              Secure Dependent Access
            </div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">Family & Dependents</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            Manage healthcare protocols for your loved ones from a single unified hub.
          </p>
        </div>
        <button 
          onClick={handleAddMember}
          className="px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all flex items-center gap-4 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Add Dependent
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {familyMembers.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              onClick={() => handleSwitch(member)}
              className={`group relative bg-white p-8 rounded-[3.5rem] border transition-all cursor-pointer overflow-hidden ${
                activeProfile?.id === member.id 
                  ? 'border-indigo-600 ring-4 ring-indigo-600/5 shadow-2xl' 
                  : 'border-slate-100 hover:border-indigo-200 shadow-xl'
              }`}
            >
              <div className="relative z-10 flex items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                      <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                    </div>
                    {activeProfile?.id === member.id && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Users className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{member.relation}</div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{member.name}</h3>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        <Activity className="w-3.5 h-3.5" />
                        {member.health_score}/100 Core Health
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Pill className="w-3.5 h-3.5" />
                        {member.active_meds} Active Med{member.active_meds !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Switch to Profile</div>
                    <ChevronRight className="w-6 h-6 text-indigo-600" />
                  </div>
                  <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors">
                    <MoreVertical className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000" />
            </motion.div>
          ))}
        </div>

        <div className="space-y-8">
          <motion.div 
            variants={itemVariants}
            className="bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-black mb-4 tracking-tight">Access Permissions</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8">
                You have primary administrative access to manage health records for all family dependents under this vault.
              </p>
              <div className="space-y-6">
                {[
                  { label: 'HIPAA Compliance', status: 'Verified', icon: <Users className="w-4 h-4 text-emerald-400" /> },
                  { label: 'Emergency Contact', status: 'Linked', icon: <Heart className="w-4 h-4 text-rose-400" /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded-lg uppercase tracking-tight">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 group"
          >
            <h3 className="text-xl font-black text-slate-900 mb-8">Clinical Timeline</h3>
            <div className="space-y-8">
              {dbMembers.length === 0 ? (
                 <p className="text-[10px] font-medium text-slate-400 italic">No recent family health activities recorded.</p>
              ) : (
                dbMembers.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex gap-4 group/item">
                    <div className="w-1 h-full bg-slate-100 rounded-full group-hover/item:bg-indigo-600 transition-colors" />
                    <div>
                      <div className="text-xs font-black text-slate-900 group-hover/item:text-indigo-600 transition-colors uppercase tracking-widest">Profile Sync</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">{item.name}</div>
                      <div className="text-[10px] font-black text-indigo-600 mt-2 uppercase tracking-widest">{item.relation} Protocol Active</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
