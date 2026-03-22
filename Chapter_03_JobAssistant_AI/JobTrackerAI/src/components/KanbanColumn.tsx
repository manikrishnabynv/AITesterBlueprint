import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { JobItem, JobBoardStatus } from '../types';
import { JobCard } from './JobCard';
import { cn } from '../utils';
import { ChevronRight, Plus, MoreVertical } from 'lucide-react';

export interface ColumnDef {
  id: string;
  title: string;
  status: JobBoardStatus;
  dotColor?: string;
}

interface KanbanColumnProps {
  column: ColumnDef;
  jobs: JobItem[];
  onEdit: (job: JobItem) => void;
  onDelete: (id: string) => void;
  selectedRoles?: string[];
  nextInterviewId?: string;
}

export function KanbanColumn({ column, jobs, onEdit, onDelete, selectedRoles, nextInterviewId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'Column', status: column.status },
  });

  return (
        <div className={cn(
      "flex flex-col shrink-0 w-[300px] bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800/80 rounded-[20px] shadow-sm overflow-hidden transition-all duration-300",
      isOver ? "ring-2 ring-blue-400 dark:ring-blue-500/50" : ""
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-[5px]">
            <ChevronRight size={12} className="text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="font-extrabold text-[#111827] dark:text-gray-100 tracking-tight text-[15px]">{column.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
           <button onClick={() => onEdit({} as JobItem)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
             <Plus size={14} strokeWidth={3} />
           </button>
           <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
             <MoreVertical size={14} strokeWidth={3} />
           </button>
        </div>
      </div>

      {/* Drop Zone / Cards List */}
      <div
        ref={setNodeRef}
        className="px-4 space-y-4 min-h-[150px] pb-4 pt-2"
      >
        <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onEdit={onEdit} 
              onDelete={onDelete}
              isHighlighted={selectedRoles?.includes(job.jobTitle)}
              isNextInterview={job.id === nextInterviewId}
            />
          ))}
        </SortableContext>
        
        {/* Placeholder if empty */}
        {jobs.length === 0 && !isOver && (
          <div className="h-24 m-1 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs font-semibold">
             Drop here
          </div>
        )}
      </div>
    </div>
  );
}
