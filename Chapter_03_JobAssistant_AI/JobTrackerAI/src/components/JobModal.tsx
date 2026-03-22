import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { JobItem, JobPriority, WorkModel, JobBoardStatus } from '../types';
import { cn } from '../utils';

interface JobModalProps {
  job: JobItem | null; // null means create new
  onClose: () => void;
  onSave: (job: JobItem) => void;
  existingRoles: string[];
}

export function JobModal({ job, onClose, onSave, existingRoles }: JobModalProps) {
  const [formData, setFormData] = useState<Partial<JobItem>>({
    companyName: '',
    jobTitle: '',
    roleDomain: existingRoles[0] || 'Engineering',
    priority: 'Medium',
    workModel: 'Remote',
    salary: '',
    location: '',
    jobUrl: '',
    resumeUsed: '',
    notes: '',
    status: 'Applied',
    tags: [],
  });
  const [tagsStr, setTagsStr] = useState('');

  useEffect(() => {
    if (job) {
      setFormData(job);
      setTagsStr(job.tags?.join(', ') || '');
    }
  }, [job]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalJob: JobItem = {
      ...(job || { id: crypto.randomUUID(), dateApplied: Date.now() }),
      ...formData,
      tags: tagsStr.split(',').map(s => s.trim()).filter(Boolean)
    } as JobItem;
    onSave(finalJob);
    onClose();
  };

  const statuses: JobBoardStatus[] = ['To Apply', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected'];
  const priorities: JobPriority[] = ['Low', 'Medium', 'High'];
  const workModels: WorkModel[] = ['Remote', 'Hybrid', 'On-site'];
  const colorSchemes = ['purple', 'blue', 'emerald', 'orange', 'pink', 'cyan'];

  const inputClass = "w-full bg-[#f8fafc] dark:bg-[#0B0F19] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-700/80 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400";
  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#131A2A] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-[#f8fafc] dark:bg-[#0B0F19]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{job ? 'Edit Application' : 'Track New Job'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-white dark:bg-[#111827] p-1.5 rounded-lg border border-gray-200 dark:border-gray-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Company Name *</label>
              <input required name="companyName" value={formData.companyName} onChange={handleChange} className={inputClass} placeholder="e.g. Stripe" />
            </div>
            <div>
              <label className={labelClass}>Job Title *</label>
              <input required name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={inputClass} placeholder="e.g. Senior Software Engineer" />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Card Theme Color</label>
              <select name="colorScheme" value={formData.colorScheme || 'blue'} onChange={handleChange} className={inputClass}>
                {colorSchemes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Work Model</label>
              <select name="workModel" value={formData.workModel} onChange={handleChange} className={inputClass}>
                {workModels.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="e.g. San Francisco or Remote" />
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className={inputClass}>
                {priorities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Salary Details</label>
              <input name="salary" value={formData.salary || ''} onChange={handleChange} className={inputClass} placeholder="e.g. $200k - $250k" />
            </div>
          </div>

          <div>
             <label className={labelClass}>Tags (comma separated)</label>
             <input value={tagsStr} onChange={e => setTagsStr(e.target.value)} className={inputClass} placeholder="e.g. Python, AI/ML, Rust" />
          </div>

          <div>
            <label className={labelClass}>Job Post URL</label>
            <input type="url" name="jobUrl" value={formData.jobUrl || ''} onChange={handleChange} className={inputClass} placeholder="https://..." />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className={cn(inputClass, "resize-none h-24")} placeholder="Add specific notes, interview feedback..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-800">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white bg-[#111827] border border-gray-800 hover:border-gray-600 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-900 shadow hover:shadow-cyan-500/20 transition-all">
              Save Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
