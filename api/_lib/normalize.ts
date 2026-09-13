import type { SourceJob, WorkArrangement } from './types';

export const excludedEmployerTerms = [
  'staffing', 'recruiting', 'recruitment', 'consultancy', 'consulting services',
  'capgemini', 'accenture', 'cognizant', 'infosys', 'tata consultancy', 'tcs',
  'wipro', 'hcltech', 'deloitte',
];

export function arrangement(value: string): WorkArrangement {
  const text = value.toLowerCase();
  if (text.includes('remote')) return 'Remote';
  if (text.includes('hybrid')) return 'Hybrid';
  return 'On-site';
}

export function isAllowedEmployer(company: string): boolean {
  const normalized = company.toLowerCase();
  return !excludedEmployerTerms.some((term) => normalized.includes(term));
}

export function isRelevant(job: SourceJob): boolean {
  const title = job.title.toLowerCase();
  const text = `${title} ${job.description}`.toLowerCase();
  const technology = ['power bi', 'microsoft fabric', 'business intelligence', 'analytics architect', 'bi architect', 'data architect', 'power platform', 'tableau']
    .some((term) => text.includes(term));
  const role = ['analyst', 'analytics', 'architect', 'business intelligence', 'bi ', 'developer', 'reporting', 'data ', 'manager', 'director', 'consultant']
    .some((term) => title.includes(term));
  return technology && role && isAllowedEmployer(job.company) && /^https?:\/\//i.test(job.applyUrl);
}

function keyPart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function deduplicate(jobs: SourceJob[]): SourceJob[] {
  const seen = new Set<string>();
  return jobs
    .filter(isRelevant)
    .sort((a, b) => Number(b.employerDirect) - Number(a.employerDirect))
    .filter((job) => {
      const key = `${keyPart(job.title)}|${keyPart(job.company)}|${keyPart(job.location)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function parseBoards(raw?: string): Array<{ company: string; token: string }> {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item) => item?.company && item?.token) : [];
  } catch {
    return [];
  }
}
