import { FileText, TrendingUp, CheckCircle, Clock, Briefcase, XCircle, Send } from 'lucide-react';
import type { JobItem } from '../types';
import { cn } from '../utils';

// ========== OVERVIEW ==========
export function OverviewView({ jobs }: { jobs: JobItem[] }) {
  const totalApps = jobs.length;
  const interviews = jobs.filter(j => j.status === 'Interviewing').length;
  const offers = jobs.filter(j => j.status === 'Offer').length;
  const rejected = jobs.filter(j => j.status === 'Rejected').length;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 gap-6 pb-8">
       <div className="flex justify-between items-center mb-2">
           <h2 className="text-xl font-extrabold text-[#111827] dark:text-gray-100">Overview Dashboard</h2>
       </div>
       
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
             <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-blue-50 dark:bg-blue-900/40 rounded-lg text-blue-500"><Send size={18} /></div>
             </div>
             <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-1">{totalApps}</h3>
             <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Total Applications</span>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
             <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-emerald-50 dark:bg-emerald-900/40 rounded-lg text-emerald-500"><CheckCircle size={18} /></div>
             </div>
             <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-1">{interviews}</h3>
             <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Interviewing</span>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
             <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-purple-50 dark:bg-purple-900/40 rounded-lg text-purple-500"><Briefcase size={18} /></div>
             </div>
             <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-1">{offers}</h3>
             <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Offers</span>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
             <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-rose-50 dark:bg-rose-900/40 rounded-lg text-rose-500"><XCircle size={18} /></div>
             </div>
             <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-1">{rejected}</h3>
             <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Rejected</span>
          </div>
       </div>
    </div>
  );
}

// ========== SCHEDULE ==========
export function ScheduleView({ jobs }: { jobs: JobItem[] }) {
  const interviewJobs = jobs.filter(j => j.interviewDate && j.interviewDate > Date.now()).sort((a, b) => a.interviewDate! - b.interviewDate!);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 gap-6 pb-8">
       <h2 className="text-xl font-extrabold text-[#111827] dark:text-gray-100">Interview Schedule</h2>
       <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-2 flex flex-col gap-2">
          {interviewJobs.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm font-semibold">No upcoming interviews for this period.</div>
          )}
          {interviewJobs.map(j => (
            <div key={j.id} className="p-4 bg-[#F8FAFC] dark:bg-[#0B0F19] border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center text-purple-600 font-bold text-sm">
                    {new Date(j.interviewDate!).getDate()}
                  </div>
                  <div className="flex flex-col">
                     <span className="font-bold text-gray-800 dark:text-gray-200">{j.jobTitle}</span>
                     <span className="text-xs font-semibold text-gray-500">{j.companyName} • {j.interviewType} Interview</span>
                  </div>
               </div>
               <span className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#111827] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800">
                  {new Date(j.interviewDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
          ))}
       </div>
    </div>
  );
}

// ========== NOTES ==========
export function NoteView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-4">
       <FileText size={48} strokeWidth={1} />
       <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">Global Notes</h2>
       <p className="text-sm">Scratchpad and preparation notes.</p>
    </div>
  );
}

// ========== REPORTS ==========
export function ReportsView({ allJobs, selectedMonthIdx, selectedYear }: { allJobs: JobItem[], selectedMonthIdx: number, selectedYear: number }) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Filter jobs for THE SELECTED MONTH ONLY
  const monthJobs = allJobs.filter(j => {
    const d = new Date(j.dateApplied);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonthIdx;
  });

  // 1. Quick Stats for the month
  const totalMonth = monthJobs.length;
  const interviewsMonth = monthJobs.filter(j => j.status === 'Interviewing' || j.status === 'Offer').length;
  const offersMonth = monthJobs.filter(j => j.status === 'Offer').length;
  const rejectionsMonth = monthJobs.filter(j => j.status === 'Rejected').length;
  const successRate = totalMonth > 0 ? Math.round((offersMonth / totalMonth) * 100) : 0;

  // 2. Trend Data (15 months) - Highlight selected
  const trendData: { label: string; count: number; isSelected: boolean }[] = [];
  for (let y = 2025; y <= 2026; y++) {
    const maxM = y === 2026 ? 3 : 12;
    for (let m = 0; m < maxM; m++) {
      const count = allJobs.filter(j => {
        const d = new Date(j.dateApplied);
        return d.getFullYear() === y && d.getMonth() === m;
      }).length;
      trendData.push({ 
        label: `${MONTHS[m]} ${y.toString().slice(2)}`, 
        count, 
        isSelected: y === selectedYear && m === selectedMonthIdx 
      });
    }
  }
  const maxTrend = Math.max(...trendData.map(d => d.count), 1);

  // 3. Status Donut Chart Data
  const statusGroups = [
    { label: 'Applied', count: monthJobs.filter(j => j.status === 'Applied' || j.status === 'To Apply').length, color: '#3b82f6' },
    { label: 'Screening', count: monthJobs.filter(j => j.status === 'Screening').length, color: '#f59e0b' },
    { label: 'Interview', count: monthJobs.filter(j => j.status === 'Interviewing').length, color: '#10b981' },
    { label: 'Offer', count: monthJobs.filter(j => j.status === 'Offer').length, color: '#8b5cf6' },
  ];
  const totalStatuses = statusGroups.reduce((acc, s) => acc + s.count, 0) || 1;
  
  // Create conic gradient string
  let cumulativePct = 0;
  const gradientParts = statusGroups.map(s => {
    const pct = (s.count / totalStatuses) * 100;
    const start = cumulativePct;
    cumulativePct += pct;
    return `${s.color} ${start}% ${cumulativePct}%`;
  }).join(', ');

  // 4. Top Roles (Month)
  const roleMap: Record<string, number> = {};
  monthJobs.forEach(j => { roleMap[j.jobTitle] = (roleMap[j.jobTitle] || 0) + 1; });
  const topRoles = Object.entries(roleMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 gap-6 pb-8 animate-slide-in">
       {/* Header Snapshot */}
       <div className="flex flex-col gap-1">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-black text-[#111827] dark:text-gray-100 italic">Monthly Snapshot</h2>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800/50">
               {MONTHS[selectedMonthIdx]} {selectedYear} Report
            </span>
          </div>
          <div className="h-1 w-20 bg-blue-500 rounded-full mt-1 shrink-0" />
       </div>

       {/* Quick Stats Grid */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Apps Sent', val: totalMonth, icon: <Send size={16} />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Interviews', val: interviewsMonth, icon: <Clock size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Success Rate', val: `${successRate}%`, icon: <TrendingUp size={16} />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { label: 'Rejections', val: rejectionsMonth, icon: <XCircle size={16} />, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
               <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>{stat.icon}</div>
               <div className="flex flex-col">
                  <span className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{stat.val}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
               </div>
            </div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart Component */}
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex flex-col items-center">
             <h4 className="w-full font-bold text-gray-800 dark:text-white mb-6 text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Composition</h4>
             <div className="relative w-40 h-40 rounded-full flex items-center justify-center mb-6" style={{ background: `conic-gradient(${gradientParts || '#eee 0% 100%'})` }}>
                <div className="absolute inset-4 bg-white dark:bg-[#111827] rounded-full flex flex-col items-center justify-center shadow-inner">
                   <span className="text-2xl font-black text-gray-800 dark:text-white">{totalMonth}</span>
                   <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Total Items</span>
                </div>
             </div>
             <div className="w-full grid grid-cols-2 gap-y-3 gap-x-4">
                {statusGroups.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 leading-tight">{s.label}</span>
                        <span className="text-[10px] font-bold text-gray-400 leading-tight">{s.count}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Trend Chart Component */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-2"><TrendingUp size={16} className="text-blue-500" /> Application Trends</h4>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[10px] font-bold text-gray-400">Monthly</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" /><span className="text-[10px] font-bold text-gray-400">Current</span></div>
                </div>
             </div>
             <div className="h-48 flex items-end gap-1.5">
                {trendData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                     <div className={cn(
                        "w-full rounded-t-lg transition-all duration-300 cursor-default",
                        d.isSelected 
                          ? "bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                          : "bg-blue-100 dark:bg-gray-800 hover:bg-blue-200 dark:hover:bg-gray-700"
                     )} style={{ height: `${(d.count / maxTrend) * 100}%`, minHeight: d.count > 0 ? '6px' : '2px' }} />
                     <span className={`text-[8px] font-bold mt-2 ${d.isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} scroll-x`}>{d.label.split(' ')[0]}</span>
                     {d.isSelected && <div className="absolute -top-6 bg-[#111827] text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl">{d.count}</div>}
                  </div>
                ))}
             </div>
             <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50 flex justify-between">
                <span className="text-[10px] font-bold text-gray-400">JAN 2025</span>
                <span className="text-[10px] font-bold text-gray-400">MAR 2026</span>
             </div>
          </div>
       </div>

       {/* Top Roles (Month) */}
       <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
          <h4 className="font-bold text-gray-800 dark:text-white mb-6 text-sm flex items-center gap-2"><Briefcase size={16} className="text-purple-500" /> Focus Areas this Month</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
             {topRoles.length === 0 && <div className="col-span-5 p-4 text-center text-gray-400 text-xs font-bold italic">No category data for this period.</div>}
             {topRoles.map(([role, count], i) => (
               <div key={role} className="bg-[#fcfdff] dark:bg-[#0B0F19] border border-gray-50 dark:border-gray-800 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-purple-300 dark:hover:border-purple-900/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full mb-3 flex items-center justify-center text-xs font-black text-white ${['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'][i % 5]}`}>{count}</div>
                  <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 leading-tight mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{role}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{Math.round((count / totalMonth) * 100)}% Volume</span>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}
