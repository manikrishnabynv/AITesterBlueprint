import { BarChart3, FileText, TrendingUp, CheckCircle, Clock, Briefcase, XCircle, Send } from 'lucide-react';
import type { JobItem } from '../types';

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
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ReportsView({ allJobs }: { allJobs: JobItem[] }) {

  // 1. Monthly Application Volume (last 15 months)
  const monthlyData: { label: string; count: number }[] = [];
  // iterate 2025 m1-12 then 2026 m1-3
  for (let y = 2025; y <= 2026; y++) {
    const maxM = y === 2026 ? 3 : 12;
    for (let m = 0; m < maxM; m++) {
      const count = allJobs.filter(j => {
        const d = new Date(j.dateApplied);
        return d.getFullYear() === y && d.getMonth() === m;
      }).length;
      monthlyData.push({ label: `${MONTH_LABELS[m]} ${y.toString().slice(2)}`, count });
    }
  }
  const maxMonthly = Math.max(...monthlyData.map(d => d.count), 1);

  // 2. Status breakdown
  const statusCounts = {
    'To Apply': allJobs.filter(j => j.status === 'To Apply').length,
    'Applied': allJobs.filter(j => j.status === 'Applied').length,
    'Screening': allJobs.filter(j => j.status === 'Screening').length,
    'Interviewing': allJobs.filter(j => j.status === 'Interviewing').length,
    'Offer': allJobs.filter(j => j.status === 'Offer').length,
    'Rejected': allJobs.filter(j => j.status === 'Rejected').length,
  };
  const totalJobs = allJobs.length || 1;

  const statusColors: Record<string, string> = {
    'To Apply': 'bg-indigo-500',
    'Applied': 'bg-blue-500',
    'Screening': 'bg-amber-500',
    'Interviewing': 'bg-emerald-500',
    'Offer': 'bg-purple-500',
    'Rejected': 'bg-rose-500',
  };

  // 3. Role breakdown
  const roleCounts: Record<string, number> = {};
  allJobs.forEach(j => {
    roleCounts[j.jobTitle] = (roleCounts[j.jobTitle] || 0) + 1;
  });
  const roleEntries = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);
  const maxRole = Math.max(...roleEntries.map(e => e[1]), 1);

  const roleColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500', 'bg-orange-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];

  // 4. Priority breakdown
  const priCounts = {
    High: allJobs.filter(j => j.priority === 'High').length,
    Medium: allJobs.filter(j => j.priority === 'Medium').length,
    Low: allJobs.filter(j => j.priority === 'Low').length,
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 gap-6 pb-8">
       <div className="flex justify-between items-center">
           <h2 className="text-xl font-extrabold text-[#111827] dark:text-gray-100">Analytics & Reports</h2>
           <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">Jan 2025 – Mar 2026</span>
       </div>

       {/* ---- Monthly Volume Bar Chart ---- */}
       <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
           <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-blue-500" /> Monthly Application Volume</h4>
           <div className="h-44 flex items-end gap-1.5">
              {monthlyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                   <span className="text-[9px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition">{d.count}</span>
                   <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 dark:from-blue-600 dark:to-blue-400 rounded-t-md hover:from-blue-600 hover:to-blue-500 transition-all shadow-sm cursor-default"
                      style={{ height: `${(d.count / maxMonthly) * 100}%`, minHeight: d.count > 0 ? '8px' : '2px' }}
                   />
                   <span className="text-[8px] font-bold text-gray-400 mt-1 truncate w-full text-center">{d.label}</span>
                </div>
              ))}
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ---- Status Pipeline ---- */}
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
             <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-emerald-500" /> Status Pipeline</h4>
             <div className="flex flex-col gap-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status}>
                     <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{status}</span>
                        <span className="text-xs font-bold text-gray-400">{count} ({Math.round(count / totalJobs * 100)}%)</span>
                     </div>
                     <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${statusColors[status]} transition-all duration-700`} style={{ width: `${(count / totalJobs) * 100}%` }} />
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* ---- Priority Breakdown ---- */}
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
             <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Clock size={16} className="text-orange-500" /> Priority Breakdown</h4>
             <div className="flex items-end gap-8 h-40 justify-center">
                {Object.entries(priCounts).map(([pri, count]) => {
                  const pct = Math.round(count / totalJobs * 100);
                  const color = pri === 'High' ? 'from-rose-500 to-rose-400' : pri === 'Medium' ? 'from-amber-500 to-amber-400' : 'from-emerald-500 to-emerald-400';
                  return (
                    <div key={pri} className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
                       <span className="text-xs font-bold text-gray-400">{pct}%</span>
                       <div className={`w-full bg-gradient-to-t ${color} rounded-t-lg transition-all`} style={{ height: `${pct}%`, minHeight: '12px' }} />
                       <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{pri}</span>
                       <span className="text-[10px] text-gray-400">{count}</span>
                    </div>
                  );
                })}
             </div>
          </div>
       </div>

       {/* ---- Role Breakdown ---- */}
       <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Briefcase size={16} className="text-purple-500" /> Applications by Role</h4>
          <div className="flex flex-col gap-3">
             {roleEntries.map(([role, count], i) => (
               <div key={role}>
                  <div className="flex justify-between mb-1">
                     <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{role}</span>
                     <span className="text-xs font-bold text-gray-400">{count}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                     <div className={`h-full rounded-full ${roleColors[i % roleColors.length]} transition-all duration-700`} style={{ width: `${(count / maxRole) * 100}%` }} />
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}
