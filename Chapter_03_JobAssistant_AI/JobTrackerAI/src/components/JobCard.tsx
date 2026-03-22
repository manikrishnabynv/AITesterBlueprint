import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { JobItem, ColorScheme } from '../types';
import { cn } from '../utils';
import { MoreVertical, CheckCircle2, Circle } from 'lucide-react';

interface JobCardProps {
  job: JobItem;
  onEdit: (job: JobItem) => void;
  onDelete: (id: string) => void;
  isHighlighted?: boolean;
  isNextInterview?: boolean;
}

const THEME_MAP: Record<ColorScheme, { bg: string, tagBg: string, textPrimary: string, textSecondary: string, dot: string }> = {
  purple: {
    bg: 'bg-[#EFEDFD] dark:bg-[#1C1A2E]',
    tagBg: 'bg-white/60 dark:bg-black/30',
    textPrimary: 'text-[#5B4CB5] dark:text-[#A79CFF]',
    textSecondary: 'text-[#8778E0] dark:text-[#7A6EC2]',
    dot: 'bg-[#5B4CB5] dark:bg-[#A79CFF]'
  },
  blue: {
    bg: 'bg-[#E1F5FE] dark:bg-[#162736]',
    tagBg: 'bg-white/60 dark:bg-black/30',
    textPrimary: 'text-[#1B84AE] dark:text-[#7FD3FA]',
    textSecondary: 'text-[#63B1D1] dark:text-[#4A8BAA]',
    dot: 'bg-[#1B84AE] dark:bg-[#7FD3FA]'
  },
  emerald: {
    bg: 'bg-[#E3F2E8] dark:bg-[#162A1F]',
    tagBg: 'bg-white/60 dark:bg-black/30',
    textPrimary: 'text-[#3E7C57] dark:text-[#83D1A5]',
    textSecondary: 'text-[#72A687] dark:text-[#528C6D]',
    dot: 'bg-[#3E7C57] dark:bg-[#83D1A5]'
  },
  orange: {
    bg: 'bg-[#FEF1DF] dark:bg-[#3B2513]',
    tagBg: 'bg-white/60 dark:bg-black/30',
    textPrimary: 'text-[#B57C26] dark:text-[#F3BC67]',
    textSecondary: 'text-[#D0A25C] dark:text-[#B8873E]',
    dot: 'bg-[#B57C26] dark:bg-[#F3BC67]'
  },
  pink: {
    bg: 'bg-[#FDE8F4] dark:bg-[#381B2D]',
    tagBg: 'bg-white/60 dark:bg-black/30',
    textPrimary: 'text-[#B54189] dark:text-[#F08FC9]',
    textSecondary: 'text-[#CB72A8] dark:text-[#B55792]',
    dot: 'bg-[#B54189] dark:bg-[#F08FC9]'
  },
  cyan: {
    bg: 'bg-[#E0F7F6] dark:bg-[#17302F]',
    tagBg: 'bg-white/60 dark:bg-black/30',
    textPrimary: 'text-[#2A9592] dark:text-[#76E0DE]',
    textSecondary: 'text-[#5EBBB9] dark:text-[#409B9A]',
    dot: 'bg-[#2A9592] dark:bg-[#76E0DE]'
  }
};

export function JobCard({ job, onEdit, onDelete, isHighlighted, isNextInterview }: JobCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: job.id,
    data: { type: 'Task', job },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-2xl h-[200px]"
      />
    );
  }

  const themeVars = THEME_MAP[job.colorScheme || 'blue'];
  
  // Calculate match percentage dots. Full = 15 dots.
  const activeDots = Math.floor((job.matchPercentage || 0) / 6.66);
  const totalDots = 15;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative rounded-2xl p-4 transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col min-w-[240px] shadow-sm hover:shadow-md",
        themeVars.bg,
        isHighlighted && "ring-4 ring-blue-500 dark:ring-blue-400 shadow-2xl scale-[1.03] z-20",
        isNextInterview && "ring-4 ring-rose-500 dark:ring-rose-400 shadow-lg shadow-rose-500/30 animate-pulse z-20"
      )}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 z-10 transition-opacity">
        <button
           onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(job); }}
           className="text-gray-500 bg-white/50 dark:bg-black/50 p-1.5 rounded-md hover:bg-white dark:hover:bg-black transition"
        >
          ✎
        </button>
        <button
           onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(job.id); }}
           className="text-red-500 bg-white/50 dark:bg-black/50 p-1.5 rounded-md hover:bg-white dark:hover:bg-black transition"
        >
          ×
        </button>
      </div>

      {/* Tags & Action row */}
      <div className="flex justify-between items-start mb-3">
         <div className="flex flex-wrap gap-1.5">
           {job.tags?.slice(0, 2).map((tag, idx) => (
             <span key={idx} className={cn("px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide", themeVars.tagBg, themeVars.textSecondary)}>
               #{tag}
             </span>
           ))}
         </div>
         <button className={cn("opacity-50 hover:opacity-100 transition", themeVars.textSecondary)}>
           <MoreVertical size={14} strokeWidth={3} />
         </button>
      </div>

      <h4 className={cn("text-base font-extrabold pr-4 leading-snug mb-1", themeVars.textPrimary)}>
         {job.jobTitle}
      </h4>
      <span className={cn("text-xs font-bold mb-3 flex items-center gap-1.5", themeVars.textSecondary)}>
        <span className="w-4 h-4 rounded-md bg-white/30 dark:bg-white/10 flex items-center justify-center text-[9px] font-black shrink-0">{job.companyName.charAt(0)}</span>
        {job.companyName}
      </span>

      {/* Task List (if available) */}
      {job.tasks && job.tasks.length > 0 ? (
        <div className="flex flex-col gap-1.5 mb-3">
          {job.tasks.map((task, idx) => (
             <div key={idx} className="flex items-start gap-1.5">
               {task.completed ? 
                  <CheckCircle2 size={12} className={cn("mt-0.5 shrink-0", themeVars.textSecondary)} /> : 
                  <Circle size={12} className={cn("mt-0.5 shrink-0 text-white dark:text-gray-600")} fill="currentColor" />
               }
               <span className={cn("text-[11px] font-semibold leading-tight", task.completed ? themeVars.textSecondary : themeVars.textPrimary)}>
                 {task.title}
               </span>
             </div>
          ))}
        </div>
      ) : (
        <div className={cn("text-[11px] font-semibold mb-3", themeVars.textSecondary)}>
          {job.companyName}
        </div>
      )}

      {/* Note Preview */}
      {job.notes && (
         <div className={cn("text-[10px] font-bold leading-tight mb-3 line-clamp-1", themeVars.textSecondary)}>
           Note: {job.notes}
         </div>
      )}

      {/* Match Dots */}
      <div className="flex items-center justify-between mb-1 mt-auto">
         <span className={cn("text-[10px] font-extrabold", themeVars.textPrimary)}>
           Match 
         </span>
         <span className={cn("text-[10px] font-extrabold", themeVars.textPrimary)}>
           {job.matchPercentage || 0}%
         </span>
      </div>
      <div className="flex justify-between w-full mb-4">
         {Array.from({ length: totalDots }).map((_, i) => (
             <div key={i} className={cn("w-[4px] h-[4px] rounded-full", i < activeDots ? themeVars.dot : themeVars.tagBg)} />
         ))}
      </div>

      {/* Footer (Avatars / Stats) */}
      <div className="flex items-center justify-between mt-1">
         <div className="flex -space-x-1.5">
           <div className="w-5 h-5 rounded-full bg-orange-300 border-2 border-white/50 z-20" />
           <div className="w-5 h-5 rounded-full bg-blue-300 border-2 border-white/50 z-10" />
           <div className="w-5 h-5 rounded-full bg-pink-300 border-2 border-white/50 z-0" />
         </div>
         <div className="flex items-center gap-1.5">
            <div className={cn("px-1.5 py-0.5 rounded flex items-center gap-1", themeVars.tagBg)}>
               <span className={cn("text-[9px] font-bold", themeVars.textSecondary)}>💬 12</span>
            </div>
            <div className={cn("px-1.5 py-0.5 rounded flex items-center gap-1", themeVars.tagBg)}>
               <span className={cn("text-[9px] font-bold", themeVars.textSecondary)}>🔗 8</span>
            </div>
         </div>
      </div>

    </div>
  );
}
