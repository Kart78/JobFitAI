export type WorkArrangement = 'On-site' | 'Hybrid' | 'Remote';

export interface SearchInput {
  roles: string[];
  locations: string[];
  radius: number;
}

export interface SourceJob {
  source: string;
  sourceJobId: string;
  title: string;
  company: string;
  location: string;
  workArrangement: WorkArrangement;
  employmentType: 'Full Time' | 'Contract' | 'Part Time';
  salary?: string;
  description: string;
  postedAt?: string;
  applyUrl: string;
  employerDirect: boolean;
}

export interface BoardConfig {
  company: string;
  token: string;
}
