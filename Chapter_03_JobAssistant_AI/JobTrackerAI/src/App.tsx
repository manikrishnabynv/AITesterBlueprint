import { useState, useEffect, useMemo } from 'react';
import type { JobItem } from './types';
import { addJob, updateJob, deleteJob, getAllJobs } from './db';
import { KanbanBoard } from './components/KanbanBoard';
import { JobModal } from './components/JobModal';
import { OverviewView, ScheduleView, NoteView, ReportsView } from './components/Views';
import { Search, Bell, CheckCircle2, LayoutGrid, Calendar, FileText, BarChart3, ChevronDown, Video, Phone, MoreHorizontal, Check, X, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from './utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = [2024, 2025, 2026];

export default function App() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);

  const [activeTab, setActiveTab] = useState('Jobs');
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isDark, setIsDark] = useState(true); // default Dark
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Slide-over states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter states
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [workModelFilter, setWorkModelFilter] = useState<string[]>([]);

  const uniqueRoles = useMemo(() => Array.from(new Set(jobs.map(j => j.jobTitle))), [jobs]);
  
  const toggleRole = (role: string) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  useEffect(() => {
    const hasSeeded = localStorage.getItem('jobpilot_sprint3_v1');
    if (!hasSeeded) {
      import('./db').then(m => m.forceSeedExampleJobs()).then(() => {
        localStorage.setItem('jobpilot_sprint3_v1', 'true');
        getAllJobs().then(setJobs).catch(console.error);
      });
    } else {
      getAllJobs().then(setJobs).catch(console.error);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) { root.classList.add('dark'); } else { root.classList.remove('dark'); }
  }, [isDark]);

  // Current month stats
  const monthStats = useMemo(() => {
    const monthJobs = jobs.filter(j => {
      const d = new Date(j.dateApplied);
      return d.getMonth() === selectedMonthIdx && d.getFullYear() === selectedYear;
    });
    return {
      total: monthJobs.length,
      interviewing: monthJobs.filter(j => j.status === 'Interviewing').length,
      offers: monthJobs.filter(j => j.status === 'Offer').length,
    };
  }, [jobs, selectedMonthIdx, selectedYear]);

  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(j => j.companyName.toLowerCase().includes(lowerQ) || j.jobTitle.toLowerCase().includes(lowerQ));
    }
    result = result.filter(j => {
      const jd = new Date(j.dateApplied);
      return jd.getMonth() === selectedMonthIdx && jd.getFullYear() === selectedYear;
    });
    if (priorityFilter.length > 0) {
      result = result.filter(j => priorityFilter.includes(j.priority));
    }
    if (workModelFilter.length > 0) {
      result = result.filter(j => workModelFilter.includes(j.workModel));
    }
    return result;
  }, [jobs, searchQuery, selectedMonthIdx, selectedYear, priorityFilter, workModelFilter]);

  const nextInterviewJob = useMemo(() => {
    const upcoming = jobs.filter(j => j.interviewDate && j.interviewDate > Date.now()).sort((a, b) => a.interviewDate! - b.interviewDate!);
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [jobs]);

  // Notifications mock data
  const notifications = useMemo(() => {
    const notes: { type: string; message: string; time: string; color: string }[] = [];
    const interviewJobs = jobs.filter(j => j.interviewDate && j.interviewDate > Date.now()).slice(0, 3);
    interviewJobs.forEach(j => {
      notes.push({ type: 'Interview', message: `Interview reminder: ${j.jobTitle} at ${j.companyName}`, time: '2h ago', color: 'bg-blue-500' });
    });
    const offerJobs = jobs.filter(j => j.status === 'Offer').slice(0, 2);
    offerJobs.forEach(j => {
      notes.push({ type: 'Offer', message: `Offer received from ${j.companyName} for ${j.jobTitle}`, time: '1d ago', color: 'bg-emerald-500' });
    });
    const rejectedJobs = jobs.filter(j => j.status === 'Rejected').slice(0, 2);
    rejectedJobs.forEach(j => {
      notes.push({ type: 'Update', message: `Application update: ${j.companyName} - ${j.jobTitle}`, time: '3d ago', color: 'bg-rose-500' });
    });
    notes.push({ type: 'System', message: 'Weekly application summary is ready', time: '5d ago', color: 'bg-purple-500' });
    notes.push({ type: 'Tip', message: 'Update your resume for DevOps roles', time: '1w ago', color: 'bg-orange-500' });
    return notes;
  }, [jobs]);

  const handleSaveJob = async (job: JobItem): Promise<void> => {
    const isEditing = jobs.some(t => t.id === job.id);
    if (isEditing) { await updateJob(job); setJobs(prev => prev.map(t => t.id === job.id ? job : t)); }
    else { await addJob(job); setJobs(prev => [...prev, job]); }
  };

  const handleDeleteJob = async (id: string) => {
    await deleteJob(id);
    setJobs(prev => prev.filter(t => t.id !== id));
  };

  // Toggle helpers for filters
  const togglePriority = (p: string) => setPriorityFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleWorkModel = (w: string) => setWorkModelFilter(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);

  // ========== NavItem ==========
  const TAB_COLORS: Record<string, string> = {
    'Overview': 'text-purple-700 dark:text-purple-400 bg-purple-100/70 dark:bg-purple-500/15',
    'Jobs': 'text-blue-700 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-500/15',
    'Schedule': 'text-orange-700 dark:text-orange-400 bg-orange-100/70 dark:bg-orange-500/15',
    'Note': 'text-pink-700 dark:text-pink-400 bg-pink-100/70 dark:bg-pink-500/15',
    'Reports': 'text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-500/15',
  };
  const TAB_INDICATORS: Record<string, string> = {
    'Overview': 'bg-purple-500 shadow-[0_0_12px] shadow-purple-500/60',
    'Jobs': 'bg-blue-500 shadow-[0_0_12px] shadow-blue-500/60',
    'Schedule': 'bg-orange-500 shadow-[0_0_12px] shadow-orange-500/60',
    'Note': 'bg-pink-500 shadow-[0_0_12px] shadow-pink-500/60',
    'Reports': 'bg-emerald-500 shadow-[0_0_12px] shadow-emerald-500/60',
  };

  const NavItem = ({ icon, label, id }: { icon: React.ReactNode, label: string, id: string }) => {
    const isActive = activeTab === id;
    return (
      <div onClick={() => setActiveTab(id)} className={cn("group relative flex items-center gap-3 px-4 py-2.5 cursor-pointer font-bold transition-all duration-300 mx-2 rounded-xl mb-1", isActive ? (TAB_COLORS[id] || '') : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-700 dark:hover:text-gray-200")}>
        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent dark:from-white/5 opacity-50 rounded-xl pointer-events-none" />}
        <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-3/5 rounded-r-lg transition-all duration-300 z-10", isActive ? `opacity-100 ${TAB_INDICATORS[id] || ''}` : "opacity-0 scale-y-0")} />
        <div className={cn("flex items-center gap-3 transition-transform duration-300 z-10", !isActive && "group-hover:translate-x-1.5")}>
          <div className={cn("transition-colors duration-300", isActive ? "drop-shadow-sm" : "text-gray-400")}>{icon}</div>
          <span className="text-sm tracking-wide">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#fdfdfd] dark:bg-[#0B0F19] text-gray-800 dark:text-gray-200 font-sans transition-colors duration-200 overflow-hidden">
      
      {/* ===== LEFT SIDEBAR ===== */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 bg-[#f9fafc] dark:bg-[#0B0F19]/50 transition-colors">
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Target size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white">Job Tracker</span>
          </div>
        </div>

        {/* Monthly Stats Mini-Section (replaces Tasks) */}
        <div className="px-5 mb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center shadow-sm">
              <div className="text-lg font-black text-blue-600 dark:text-blue-400">{monthStats.total}</div>
              <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Applied</div>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center shadow-sm">
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{monthStats.interviewing}</div>
              <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Interview</div>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center shadow-sm">
              <div className="text-lg font-black text-purple-600 dark:text-purple-400">{monthStats.offers}</div>
              <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Offers</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-1 px-4 mb-6">
          <span className="text-[10px] font-bold tracking-widest text-[#a8b3c6] dark:text-gray-600 uppercase px-3 mb-2">Main</span>
          <NavItem id="Overview" icon={<LayoutGrid size={18} strokeWidth={2.5} />} label="Overview" />
          <NavItem id="Jobs" icon={<CheckCircle2 size={18} strokeWidth={2.5} />} label="Jobs" />
          <NavItem id="Schedule" icon={<Calendar size={18} strokeWidth={2.5} />} label="Schedule" />
          <NavItem id="Note" icon={<FileText size={18} strokeWidth={2.5} />} label="Note" />
          <NavItem id="Reports" icon={<BarChart3 size={18} strokeWidth={2.5} />} label="Reports" />
        </div>

        {/* Applications checkboxes */}
        <div className="flex flex-col gap-2 px-4 flex-1 overflow-y-auto">
          <span className="text-[10px] font-bold tracking-widest text-[#a8b3c6] dark:text-gray-600 uppercase px-3 mb-2 mt-2">Applications</span>
          <div className="px-3 flex flex-col gap-2.5 mt-1">
             {uniqueRoles.map(role => (
               <label key={role} className="flex items-center gap-3 cursor-pointer group select-none">
                  <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors shadow-sm shrink-0", selectedRoles.includes(role) ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] group-hover:border-blue-400")}>
                    {selectedRoles.includes(role) && <Check size={12} className="text-white" strokeWidth={4} />}
                  </div>
                  <span className={cn("text-xs font-bold transition-colors leading-snug truncate", selectedRoles.includes(role) ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200")}>{role}</span>
                  <input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => toggleRole(role)} className="hidden" />
               </label>
             ))}
          </div>
        </div>

        {/* Profile */}
        <div className="p-4 mt-auto">
           <div className="flex items-center justify-between bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-2 shadow-sm cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 transition">
              <div className="flex items-center gap-2 overflow-hidden">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 border-2 border-white shrink-0" />
                 <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">yeswanth</span>
                    <span className="text-[10px] text-gray-500 font-medium truncate">yeswanth@gmail.com</span>
                 </div>
              </div>
              <ChevronDown size={14} className="text-gray-400 shrink-0" />
           </div>
        </div>
      </aside>

      {/* ===== CENTER MAIN ===== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#fdfdfd] dark:bg-[#0B0F19] transition-colors relative">
        {/* Header */}
        <header className="h-20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 bg-white dark:bg-[#0B0F19] z-10">
           <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider">Welcome,</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white">yeswanth</span>
           </div>
           
           <div className="hidden md:flex relative w-1/3 max-w-sm">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                 value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                 placeholder="Find something"
                 className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#fafafa] dark:bg-[#111827] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-gray-300 dark:focus:border-gray-600 text-sm font-medium transition-colors"
              />
           </div>

           <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              {/* Theme Switch */}
              <div className="flex items-center gap-2.5 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-full px-3 py-1.5 cursor-pointer select-none" onClick={() => setIsDark(!isDark)}>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Theme</span>
                <div className={cn("w-10 h-5 rounded-full relative transition-colors duration-300", isDark ? "bg-blue-500" : "bg-gray-300")}>
                  <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300", isDark ? "left-[22px]" : "left-0.5")} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 w-8">{isDark ? 'Dark' : 'Light'}</span>
              </div>

              {/* Bell Icon */}
              <button onClick={() => setIsNotificationsOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
                  <Bell size={20} />
                  <div className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 border-2 border-white dark:border-[#0B0F19]" />
              </button>
           </div>
        </header>

        {/* Jobs sub-header */}
        {activeTab === 'Jobs' && (
          <div className="px-8 py-6 flex items-center justify-between shrink-0">
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 w-fit">
                   <div className="flex items-center gap-1 group cursor-pointer relative">
                      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{MONTHS[selectedMonthIdx]}</h2>
                      <ChevronDown size={20} className="text-gray-400 group-hover:text-gray-700 transition" />
                      <select className="absolute opacity-0 cursor-pointer w-full h-full" value={selectedMonthIdx} onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}>
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                      </select>
                   </div>
                   <div className="flex items-center gap-1 group cursor-pointer relative">
                      <h2 className="text-3xl font-extrabold text-gray-400 dark:text-gray-500">{selectedYear}</h2>
                      <ChevronDown size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 transition" />
                      <select className="absolute opacity-0 cursor-pointer w-full h-full" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                   </div>
                </div>
                <span className="text-xs font-semibold text-gray-400 tracking-wide">
                   Filtering {filteredJobs.length} applications for {MONTHS[selectedMonthIdx]} {selectedYear}
                </span>
             </div>

             <div className="flex items-center gap-3">
                <div className="flex -space-x-2 mr-4">
                   <div className="w-8 h-8 rounded-full bg-pink-300 border-2 border-white dark:border-[#0B0F19] z-30" />
                   <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-white dark:border-[#0B0F19] z-20" />
                   <div className="w-8 h-8 rounded-full bg-emerald-300 border-2 border-white dark:border-[#0B0F19] z-10" />
                </div>
                <button onClick={() => setIsFiltersOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-300 shadow-sm hover:border-gray-300 transition">
                  ⧉ Filters {(priorityFilter.length + workModelFilter.length) > 0 && <span className="bg-blue-500 text-white text-[10px] px-1.5 rounded-full">{priorityFilter.length + workModelFilter.length}</span>}
                </button>
                <button 
                   onClick={() => { setEditingJob(null); setIsModalOpen(true); }}
                   className="flex items-center gap-2 px-5 py-2 bg-[#1b1c20] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  + Create Job
                </button>
             </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar px-6 pb-4">
           {activeTab === 'Jobs' && (
              <KanbanBoard 
                jobs={filteredJobs} setJobs={setJobs} 
                onUpdateJob={async (job) => { await updateJob(job); }}
                onEdit={(job) => { setEditingJob(job); setIsModalOpen(true); }}
                onDelete={handleDeleteJob}
                selectedRoles={selectedRoles}
                nextInterviewId={nextInterviewJob?.id}
              />
           )}
           {activeTab === 'Overview' && <OverviewView jobs={filteredJobs} />}
           {activeTab === 'Schedule' && <ScheduleView jobs={jobs} />}
           {activeTab === 'Note' && <NoteView />}
           {activeTab === 'Reports' && <ReportsView allJobs={jobs} />}
        </div>
      </main>

      {/* ===== RIGHT SIDEBAR ===== */}
      <aside className="w-[300px] border-l border-gray-200 dark:border-gray-800 bg-[#fbfcfc] dark:bg-[#0B0F19]/80 shrink-0 flex flex-col">
         {nextInterviewJob ? (
           <div className="p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                 <span className="font-extrabold text-sm text-gray-900 dark:text-white tracking-wide">Next interview</span>
              </div>
              <div className="flex flex-col items-center justify-center mb-8">
                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-200 to-pink-300 mb-4 p-1 shadow-md">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                       <span className="text-3xl font-extrabold text-pink-400">
                          {nextInterviewJob.interviewName?.charAt(0).toUpperCase() || nextInterviewJob.companyName.charAt(0)}
                       </span>
                    </div>
                 </div>
                 <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">
                    {nextInterviewJob.interviewName || 'Interview Team'}
                 </h3>
                 <span className="text-xs font-bold text-blue-500 mb-4 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    {nextInterviewJob.companyName}
                 </span>
                 <span className="text-xs font-semibold text-gray-500 tracking-wide mb-2 uppercase">
                    {format(new Date(nextInterviewJob.interviewDate!), "EEEE, MMM do, yyyy")}
                 </span>
                 <span className="text-3xl font-black text-gray-800 dark:text-white tracking-tighter">
                    {format(new Date(nextInterviewJob.interviewDate!), "h:mm a")}
                 </span>
              </div>

              <div className="flex items-center justify-center gap-4 mb-10">
                 <button className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all text-gray-600 dark:text-gray-300"><Phone size={18} strokeWidth={2.5} /></div>
                    <span className="text-[10px] font-bold text-gray-500">Call</span>
                 </button>
                 <button className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#1b1c20] text-white border border-[#1b1c20] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all"><Video size={18} strokeWidth={2.5} /></div>
                    <span className="text-[10px] font-bold text-gray-500">Video</span>
                 </button>
                 <button className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all text-gray-600 dark:text-gray-300"><MoreHorizontal size={18} strokeWidth={2.5} /></div>
                    <span className="text-[10px] font-bold text-gray-500">More</span>
                 </button>
              </div>

              <div className="flex flex-col gap-3">
                 <span className="text-[11px] font-bold text-gray-400 tracking-wider">Personal reminder:</span>
                 <ul className="text-xs font-medium text-gray-600 dark:text-gray-400 flex flex-col gap-2">
                    <li className="flex gap-2"><div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" /> Review {nextInterviewJob.companyName} products</li>
                    <li className="flex gap-2"><div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" /> Prepare Portfolio presentation</li>
                    <li className="flex gap-2"><div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" /> Ask about Work Model ({nextInterviewJob.workModel})</li>
                 </ul>
              </div>
           </div>
         ) : (
           <div className="p-8 flex flex-col h-full items-center justify-center text-center text-gray-400 gap-4">
              <Calendar size={48} strokeWidth={1} />
              <div className="flex flex-col gap-1">
                 <span className="text-sm font-bold text-gray-600 dark:text-gray-300">No interviews scheduled</span>
                 <span className="text-xs">Your next upcoming interview will appear here.</span>
              </div>
           </div>
         )}
      </aside>

      {/* ===== NOTIFICATIONS SLIDE-OVER ===== */}
      {isNotificationsOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsNotificationsOpen(false)} />
          <div className="fixed top-0 right-0 w-[380px] h-full bg-white dark:bg-[#111827] border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Notifications</h3>
              <button onClick={() => setIsNotificationsOpen(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-[#f8fafc] dark:bg-[#0B0F19] border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-md transition-shadow cursor-pointer">
                  <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", n.color)} />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{n.type}</span>
                      <span className="text-[10px] font-semibold text-gray-400">{n.time}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">{n.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ===== FILTERS SLIDE-OVER ===== */}
      {isFiltersOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsFiltersOpen(false)} />
          <div className="fixed top-0 right-0 w-[340px] h-full bg-white dark:bg-[#111827] border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Filters</h3>
              <button onClick={() => setIsFiltersOpen(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Priority */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Priority</span>
                <div className="flex flex-col gap-2">
                  {['High', 'Medium', 'Low'].map(p => (
                    <label key={p} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0", priorityFilter.includes(p) ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B0F19] group-hover:border-blue-400")}>
                        {priorityFilter.includes(p) && <Check size={12} className="text-white" strokeWidth={4} />}
                      </div>
                      <span className={cn("text-sm font-semibold", priorityFilter.includes(p) ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400")}>{p}</span>
                      <input type="checkbox" checked={priorityFilter.includes(p)} onChange={() => togglePriority(p)} className="hidden" />
                    </label>
                  ))}
                </div>
              </div>
              {/* Work Model */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Work Model</span>
                <div className="flex flex-col gap-2">
                  {['Remote', 'Hybrid', 'On-site'].map(w => (
                    <label key={w} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0", workModelFilter.includes(w) ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B0F19] group-hover:border-blue-400")}>
                        {workModelFilter.includes(w) && <Check size={12} className="text-white" strokeWidth={4} />}
                      </div>
                      <span className={cn("text-sm font-semibold", workModelFilter.includes(w) ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400")}>{w}</span>
                      <input type="checkbox" checked={workModelFilter.includes(w)} onChange={() => toggleWorkModel(w)} className="hidden" />
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={() => { setPriorityFilter([]); setWorkModelFilter([]); }} className="mt-auto text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
                Clear all filters
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===== JOB MODAL ===== */}
      {(isModalOpen || editingJob) && (
        <JobModal 
          job={editingJob} 
          onClose={() => { setIsModalOpen(false); setEditingJob(null); }} 
          onSave={(j) => { handleSaveJob(j); }}
          existingRoles={[]}
        />
      )}
    </div>
  );
}
