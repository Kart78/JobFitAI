export type JobStatus = 'New' | 'Seen' | 'Shortlisted' | 'Applied' | 'Interview' | 'Rejected' | 'Offer' | 'Closed';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workArrangement: 'On-site' | 'Hybrid' | 'Remote';
  employmentType: 'Full Time' | 'Contract' | 'Part Time';
  salary?: string;
  postedDate?: string;
  freshness?: string;
  applyUrl: string;
  source: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  industry?: string;
  minYearsExperience?: number;
  fitment?: number;
  matchReasons?: string[];
  gaps?: string[];
  status?: JobStatus;
  isPriority?: boolean;
}
