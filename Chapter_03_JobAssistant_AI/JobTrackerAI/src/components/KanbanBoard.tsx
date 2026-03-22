import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { JobItem, JobBoardStatus } from '../types';
import { KanbanColumn, type ColumnDef } from './KanbanColumn';
import { JobCard } from './JobCard';

const FLAT_BOARD_COLUMNS: ColumnDef[] = [
  { id: 'col-to-apply', title: 'To Apply', status: 'To Apply', dotColor: 'bg-indigo-400' },
  { id: 'col-applied', title: 'Applied', status: 'Applied', dotColor: 'bg-blue-400' },
  { id: 'col-screening', title: 'Screening', status: 'Screening', dotColor: 'bg-amber-400' },
  { id: 'col-interviewing', title: 'Interviewing', status: 'Interviewing', dotColor: 'bg-emerald-400' },
  { id: 'col-offer', title: 'Offer', status: 'Offer', dotColor: 'bg-purple-400' },
  { id: 'col-rejected', title: 'Rejected', status: 'Rejected', dotColor: 'bg-rose-400' },
];

interface KanbanBoardProps {
  jobs: JobItem[];
  setJobs: React.Dispatch<React.SetStateAction<JobItem[]>>;
  onUpdateJob: (job: JobItem) => Promise<void>;
  onEdit: (job: JobItem) => void;
  onDelete: (id: string) => void;
  selectedRoles?: string[];
  nextInterviewId?: string;
}

export function KanbanBoard({ jobs, setJobs, onUpdateJob, onEdit, onDelete, selectedRoles, nextInterviewId }: KanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<JobItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find((j) => j.id === active.id);
    if (job) setActiveJob(job);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    setJobs((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      const activeTask = prev[activeIndex];

      if (isOverTask) {
        const overIndex = prev.findIndex((t) => t.id === overId);
        const overTask = prev[overIndex];
        
        if (activeTask.status !== overTask.status) {
          activeTask.status = overTask.status;
          return arrayMove(prev, activeIndex, overIndex);
        }
        return arrayMove(prev, activeIndex, overIndex);
      }

      if (isOverColumn) {
        const targetStatus = over.data.current?.status as JobBoardStatus;
        if (targetStatus && activeTask.status !== targetStatus) {
          activeTask.status = targetStatus;
          return arrayMove(prev, activeIndex, activeIndex);
        }
      }

      return prev;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      setJobs((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);
        return arrayMove(prev, activeIndex, overIndex >= 0 ? overIndex : activeIndex);
      });
    }

    const finalJob = jobs.find((t) => t.id === activeId);
    if (finalJob) {
      await onUpdateJob(finalJob);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col min-h-full">
         <div className="flex gap-5 items-start min-h-[500px] px-2 pb-6">
            {FLAT_BOARD_COLUMNS.map((col) => (
               <KanbanColumn
                  key={col.id}
                  column={col}
                  jobs={jobs.filter((j) => j.status === col.status)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  selectedRoles={selectedRoles}
                  nextInterviewId={nextInterviewId}
               />
            ))}
         </div>
      </div>

      <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
        {activeJob ? (
          <JobCard job={activeJob} onEdit={onEdit} onDelete={onDelete} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
