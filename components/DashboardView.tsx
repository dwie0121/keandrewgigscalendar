import React, { useMemo } from 'react';
import { StudioEvent, Staff } from '../types';
import { Icons } from '../constants';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';

interface DashboardProps {
  events: StudioEvent[];
  staff: Staff[];
}

const DashboardView: React.FC<DashboardProps> = ({ events, staff }) => {
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    const staffFees: Record<string, { earned: number, paid: number }> = {};

    staff.forEach(s => {
      staffFees[s.id] = { earned: 0, paid: 0 };
    });

    events.forEach(event => {
      totalRevenue += Number(event.revenue || 0);
      event.assignments.forEach(a => {
        totalExpenses += Number(a.fee || 0);
        if (staffFees[a.staffId]) {
          staffFees[a.staffId].earned += Number(a.fee || 0);
          if (a.isPaid) staffFees[a.staffId].paid += Number(a.fee || 0);
        }
      });
    });

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      staffFees
    };
  }, [events, staff]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    return months.map((month, idx) => {
      const filtered = events.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === idx && d.getFullYear() === currentYear;
      });
      const revenue = filtered.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0);
      const expense = filtered.reduce((acc, curr) => {
        return acc + curr.assignments.reduce((sum, a) => sum + Number(a.fee || 0), 0);
      }, 0);
      return {
        name: month,
        Revenue: revenue,
        Profit: revenue - expense
      };
    });
  }, [events]);

  const StatCard = ({ label, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800">₱{value.toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Studio Pulse</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Performance Metrics</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{new Date().getFullYear()} Annual Summary</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={stats.totalRevenue} 
          icon={Icons.Money} 
          colorClass="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          label="Staff Expenses" 
          value={stats.totalExpenses} 
          icon={Icons.Staff} 
          colorClass="bg-rose-50 text-rose-600" 
        />
        <StatCard 
          label="Net Earnings" 
          value={stats.netProfit} 
          icon={Icons.Growth} 
          colorClass="bg-indigo-50 text-indigo-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Monthly Growth Trends</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} tickFormatter={(v) => `₱${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <Tooltip 
                  formatter={(value: number) => [`₱${value.toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '8px', color: '#1e293b', textTransform: 'uppercase', fontSize: '10px' }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Team Compensation Ledger</h3>
          <div className="overflow-y-auto max-h-[320px] pr-2 space-y-4 hide-scrollbar">
            {staff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                <Icons.Staff size={48} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">No staff records initialized</p>
              </div>
            ) : (
              staff.map(member => {
                const s = stats.staffFees[member.id] || { earned: 0, paid: 0 };
                const unpaid = s.earned - s.paid;
                return (
                  <div key={member.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-lg">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{member.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.baseDesignation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-sm">₱{s.earned.toLocaleString()}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${unpaid > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {unpaid > 0 ? `Balance: ₱${unpaid.toLocaleString()}` : 'Settled'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;