import { 
  Users, 
  ShieldCheck, 
  Calendar, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  MoreVertical,
  Search,
  Check,
  X
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const userData = [
  { name: 'Patients', value: 850 },
  { name: 'Doctors', value: 120 },
  { name: 'Admins', value: 15 },
];

const growthData = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 600 },
  { name: 'Mar', users: 800 },
  { name: 'Apr', users: 1000 },
  { name: 'May', users: 1200 },
  { name: 'Jun', users: 1500 },
];

const COLORS = ['#000', '#666', '#999'];

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '985', icon: <Users className="w-4 h-4" />, trend: '+15%', status: 'nominal' },
    { label: 'Pending Approvals', value: '12', icon: <ShieldCheck className="w-4 h-4" />, trend: 'Action Required', status: 'critical' },
    { label: 'Total Appointments', value: '4,284', icon: <Calendar className="w-4 h-4" />, trend: '+22%', status: 'nominal' },
    { label: 'System Health', value: '99.9%', icon: <Activity className="w-4 h-4" />, trend: 'Stable', status: 'nominal' },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-line pb-12">
        <div>
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] mb-4 block">01 / System Administration</span>
          <h1 className="text-5xl font-bold text-primary tracking-tighter uppercase">Platform Control</h1>
          <p className="text-text-muted font-medium mt-2">Global system monitoring and user authorization terminal.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 border border-line text-[10px] font-mono uppercase tracking-widest font-bold text-primary hover:bg-primary hover:text-white transition-all">
            Export Reports
          </button>
          <button className="btn-primary px-8 py-4 text-[10px] font-mono uppercase tracking-widest">
            System Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 data-grid">
        {stats.map((stat, i) => (
          <div key={i} className="data-cell bg-white">
            <div className="flex items-center justify-between mb-8">
              <div className="text-primary">{stat.icon}</div>
              <span className={`text-[9px] font-mono uppercase tracking-widest ${stat.status === 'critical' ? 'text-red-600' : 'text-emerald-500'}`}>
                {stat.status}
              </span>
            </div>
            <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">{stat.label}</div>
            <div className="text-2xl font-bold text-primary mb-4">{stat.value}</div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 border border-line p-10 bg-white">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Growth Metrics</h3>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-1">User Acquisition (6 Month Window)</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="0" vertical={true} stroke="#eee" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{stroke: '#000'}} 
                  tickLine={false} 
                  tick={{fill: '#000', fontSize: 10, fontWeight: 'bold'}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={{stroke: '#000'}} 
                  tickLine={false} 
                  tick={{fill: '#000', fontSize: 10, fontWeight: 'bold'}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #000',
                    borderRadius: '0',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#000" strokeWidth={3} dot={{ r: 4, fill: '#000', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="border border-line p-10 bg-white">
          <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-10">User Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {userData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #000',
                    borderRadius: '0',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Doctor Approvals */}
      <div className="border border-line bg-white">
        <div className="p-8 border-b border-line flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Authorization Queue: Practitioners</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3" />
            <input type="text" className="bg-background border border-line text-[10px] font-mono uppercase tracking-widest pl-10 pr-4 py-2 focus:ring-0" placeholder="Search Database..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background">
                <th className="p-6 text-[10px] font-mono text-text-muted uppercase tracking-widest border-b border-line">Practitioner Identity</th>
                <th className="p-6 text-[10px] font-mono text-text-muted uppercase tracking-widest border-b border-line">Specialization</th>
                <th className="p-6 text-[10px] font-mono text-text-muted uppercase tracking-widest border-b border-line">Experience</th>
                <th className="p-6 text-[10px] font-mono text-text-muted uppercase tracking-widest border-b border-line text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-background transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={`https://picsum.photos/seed/doc${i}/100/100`} className="w-8 h-8 grayscale border border-line" alt="Doctor" referrerPolicy="no-referrer" />
                      <div>
                        <div className="text-xs font-bold text-primary uppercase tracking-widest">Dr. Robert Fox</div>
                        <div className="text-[9px] font-mono text-text-muted uppercase tracking-widest">robert.fox@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-[10px] font-mono text-text-muted uppercase tracking-widest">Neurology</td>
                  <td className="p-6 text-[10px] font-mono text-text-muted uppercase tracking-widest">12 Years</td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button className="p-2 border border-line text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"><Check className="w-3 h-3" /></button>
                      <button className="p-2 border border-line text-red-600 hover:bg-red-600 hover:text-white transition-all"><X className="w-3 h-3" /></button>
                      <button className="p-2 border border-line text-text-muted hover:bg-primary hover:text-white transition-all"><MoreVertical className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
