import { arrangement } from './normalize';
import type { SearchInput, SourceJob } from './types';

export async function jooble(apiKey: string | undefined, input: SearchInput): Promise<SourceJob[]> {
  if (!apiKey) return [];
  const response = await fetch(`https://jooble.org/api/${encodeURIComponent(apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords: input.roles.join(' OR '), location: input.locations.join(', '), page: 1 }),
  });
  if (!response.ok) throw new Error(`Jooble returned ${response.status}`);
  const data = await response.json() as any;
  return (data.jobs ?? []).map((job: any): SourceJob => ({
    source: 'Jooble', sourceJobId: String(job.id ?? job.link), title: job.title,
    company: job.company ?? 'Employer not listed', location: job.location ?? 'Location not listed',
    workArrangement: arrangement(`${job.title} ${job.location ?? ''} ${job.snippet ?? ''}`),
    employmentType: /part.?time/i.test(job.type ?? '') ? 'Part Time' : /contract/i.test(job.type ?? '') ? 'Contract' : 'Full Time',
    salary: job.salary || undefined, description: job.snippet ?? '', postedAt: job.updated,
    applyUrl: job.link, employerDirect: false,
  }));
}
