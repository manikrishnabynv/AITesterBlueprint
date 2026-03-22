export type JobPriority = 'High' | 'Medium' | 'Low';
export type WorkModel = 'Remote' | 'Hybrid' | 'On-site';

export type JobBoardStatus = 
  | 'To Apply'
  | 'Applied'
  | 'Screening'
  | 'Interviewing'
  | 'Offer'
  | 'Rejected';

export type ColorScheme = 'purple' | 'blue' | 'emerald' | 'orange' | 'pink' | 'cyan';

export interface JobItem {
  id: string; // UUID
  companyName: string;
  jobTitle: string;
  roleDomain: string; 
  priority: JobPriority;
  workModel: WorkModel;
  salary: string; 
  location: string;
  jobUrl: string;
  resumeUsed: string;
  notes: string;
  status: JobBoardStatus;
  dateApplied: number;
  tags?: string[];
  
  // JobPilot specifics
  colorScheme?: ColorScheme;
  matchPercentage?: number;
  interviewDate?: number; // timestamp
  interviewName?: string;
  interviewType?: 'Video' | 'Phone' | 'On-site';
  tasks?: { title: string; completed: boolean }[];
}
