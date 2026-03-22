import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { JobItem, JobBoardStatus, ColorScheme } from './types';

interface AdvJobDB extends DBSchema {
  jobs: {
    key: string;
    value: JobItem;
    indexes: { 'by-date': number };
  };
}

let dbPromise: Promise<IDBPDatabase<AdvJobDB>>;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AdvJobDB>('advanced-job-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('jobs')) {
          const store = db.createObjectStore('jobs', { keyPath: 'id' });
          store.createIndex('by-date', 'dateApplied');
        }
      },
    });
  }
  return dbPromise;
}

export async function addJob(job: JobItem) {
  const db = await getDB();
  return db.add('jobs', job);
}

export async function updateJob(job: JobItem) {
  const db = await getDB();
  return db.put('jobs', job);
}

export async function deleteJob(id: string) {
  const db = await getDB();
  return db.delete('jobs', id);
}

export async function getAllJobs() {
  const db = await getDB();
  return db.getAll('jobs');
}

export async function clearAllJobs() {
  const db = await getDB();
  return db.clear('jobs');
}

// Helper types for seed generation
interface SeedTemplate {
  companyName: string;
  jobTitle: string;
  roleDomain: string;
  salary: string;
  location: string;
  workModel: 'Remote' | 'Hybrid' | 'On-site';
  tags: string[];
  colorScheme: ColorScheme;
}

const ROLES: SeedTemplate[] = [
  { companyName: 'Stripe', jobTitle: 'Senior DevOps Engineer', roleDomain: 'Engineering', salary: '$160k', location: 'Remote', workModel: 'Remote', tags: ['aws', 'terraform'], colorScheme: 'purple' },
  { companyName: 'Anthropic', jobTitle: 'ML Engineer', roleDomain: 'Data', salary: '$200k', location: 'SF', workModel: 'Hybrid', tags: ['python', 'llm'], colorScheme: 'blue' },
  { companyName: 'Linear', jobTitle: 'Automation Engineer', roleDomain: 'QA', salary: '$140k', location: 'Remote', workModel: 'Remote', tags: ['cypress', 'playwright'], colorScheme: 'pink' },
  { companyName: 'OpenAI', jobTitle: 'QAOps Lead', roleDomain: 'QA', salary: '$180k', location: 'SF', workModel: 'On-site', tags: ['kubernetes', 'testing'], colorScheme: 'emerald' },
  { companyName: 'Netflix', jobTitle: 'Senior SDET', roleDomain: 'Engineering', salary: '$190k', location: 'Remote', workModel: 'Remote', tags: ['java', 'performance'], colorScheme: 'cyan' },
  { companyName: 'Scale AI', jobTitle: 'ML Infrastructure Engineer', roleDomain: 'Data', salary: '$170k', location: 'Remote', workModel: 'Remote', tags: ['gpu', 'pytorch'], colorScheme: 'blue' },
  { companyName: 'Vercel', jobTitle: 'DevOps Engineer', roleDomain: 'Engineering', salary: '$130k', location: 'Remote', workModel: 'Remote', tags: ['nextjs', 'ci-cd'], colorScheme: 'orange' },
  { companyName: 'Notion', jobTitle: 'QAOps Engineer', roleDomain: 'QA', salary: '$120k', location: 'NY', workModel: 'Hybrid', tags: ['playwright', 'web'], colorScheme: 'purple' },
  { companyName: 'Datadog', jobTitle: 'Senior DevOps Engineer', roleDomain: 'Engineering', salary: '$175k', location: 'Boston', workModel: 'Hybrid', tags: ['docker', 'monitoring'], colorScheme: 'emerald' },
  { companyName: 'Snowflake', jobTitle: 'ML Engineer', roleDomain: 'Data', salary: '$185k', location: 'Remote', workModel: 'Remote', tags: ['spark', 'sql'], colorScheme: 'cyan' },
  { companyName: 'HashiCorp', jobTitle: 'Automation Engineer', roleDomain: 'QA', salary: '$145k', location: 'Remote', workModel: 'Remote', tags: ['terraform', 'go'], colorScheme: 'pink' },
  { companyName: 'Confluent', jobTitle: 'SDET', roleDomain: 'Engineering', salary: '$155k', location: 'Remote', workModel: 'Remote', tags: ['kafka', 'java'], colorScheme: 'orange' },
];

const STATUSES: JobBoardStatus[] = ['To Apply', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected'];

const PRIORITIES: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

const NOTES_POOL = [
  'Waiting for recruiter response.',
  'CV Sent, follow up by Friday.',
  'Great culture fit, excited about this one.',
  'Completed phone screen, positive feedback.',
  'Portfolio shared, waiting for design challenge.',
  'Need to prep for system design round.',
  'Reached out to internal referral.',
  'Offer negotiation in progress.',
  'Ghosted after 2nd round.',
  'Rejection email received, asked for feedback.',
  'Scheduled technical assessment.',
  'HR mentioned fast-track hiring.',
];

const TASKS_POOL = [
  [{ title: 'Update Resume', completed: true }, { title: 'Write Cover Letter', completed: false }],
  [{ title: 'Submit Application', completed: true }],
  [{ title: 'Initial HR Screen', completed: true }, { title: 'Technical Interview', completed: false }],
  [{ title: 'Take-home Assignment', completed: true }, { title: 'Panel Interview', completed: false }],
  [{ title: 'Background Check', completed: true }, { title: 'Sign Offer', completed: false }],
  [{ title: 'Negotiate Salary', completed: false }],
  [{ title: 'Prep Portfolio', completed: true }, { title: 'Design Challenge', completed: false }],
];

export async function forceSeedExampleJobs() {
  await clearAllJobs();

  const DAY = 86400000;
  const now = Date.now();
  const tomorrow = now + DAY;

  const examples: JobItem[] = [];
  let roleIdx = 0;

  // Generate jobs for Jan 2025 through March 2026 (15 months)
  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    const year = 2025 + yearOffset;
    const maxMonth = year === 2026 ? 3 : 12; // up to March for 2026

    for (let month = 1; month <= maxMonth; month++) {
      // For each month, generate 3-4 jobs across different statuses
      const jobsThisMonth = 3 + (month % 2); // 3 or 4

      for (let j = 0; j < jobsThisMonth; j++) {
        const template = ROLES[roleIdx % ROLES.length];
        const status = STATUSES[(roleIdx + j) % STATUSES.length];
        const priority = PRIORITIES[(roleIdx + j) % PRIORITIES.length];
        const matchPct = 50 + Math.floor(Math.random() * 50);
        const dayInMonth = 5 + (j * 7); // spread across month
        const dateApplied = new Date(year, month - 1, dayInMonth).getTime();

        const job: JobItem = {
          id: crypto.randomUUID(),
          companyName: template.companyName,
          jobTitle: template.jobTitle,
          roleDomain: template.roleDomain,
          priority,
          workModel: template.workModel,
          salary: template.salary,
          location: template.location,
          jobUrl: '',
          resumeUsed: '',
          notes: NOTES_POOL[(roleIdx + j) % NOTES_POOL.length],
          status,
          dateApplied,
          tags: template.tags,
          colorScheme: template.colorScheme,
          matchPercentage: matchPct,
          tasks: TASKS_POOL[(roleIdx + j) % TASKS_POOL.length],
        };

        // Add interview data for 'Interviewing' status jobs
        if (status === 'Interviewing') {
          // If the job is in a future month, put interview in the future
          if (dateApplied > now - 30 * DAY) {
            job.interviewDate = tomorrow + (roleIdx * 2 * DAY);
            job.interviewName = `Tech Screen - ${template.companyName}`;
            job.interviewType = 'Video';
          }
        }

        examples.push(job);
        roleIdx++;
      }
    }
  }

  for (const job of examples) {
    await addJob(job);
  }
}
