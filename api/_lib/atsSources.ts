import { arrangement, parseBoards } from './normalize';
import type { BoardConfig, SourceJob } from './types';

async function json(url: string): Promise<any> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

export async function greenhouse(configs: BoardConfig[]): Promise<SourceJob[]> {
  const results = await Promise.allSettled(configs.map(async ({ company, token }) => {
    const data = await json(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs?content=true`);
    return (data.jobs ?? []).map((job: any): SourceJob => ({
      source: 'Greenhouse', sourceJobId: String(job.id), title: job.title, company,
      location: job.location?.name ?? 'Location not listed',
      workArrangement: arrangement(`${job.title} ${job.location?.name ?? ''} ${job.content ?? ''}`),
      employmentType: 'Full Time', description: job.content ?? '', postedAt: job.updated_at,
      applyUrl: job.absolute_url, employerDirect: true,
    }));
  }));
  return results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
}

export async function lever(configs: BoardConfig[]): Promise<SourceJob[]> {
  const results = await Promise.allSettled(configs.map(async ({ company, token, region }) => {
    const host = region === 'eu' ? 'https://api.eu.lever.co' : 'https://api.lever.co';
    const jobs: any[] = [];
    for (let skip = 0; skip < 600; skip += 200) {
      const page = await json(`${host}/v0/postings/${encodeURIComponent(token)}?mode=json&limit=200&skip=${skip}`);
      jobs.push(...(page ?? []));
      if (!Array.isArray(page) || page.length < 200) break;
    }
    return jobs.map((job: any): SourceJob => ({
      source: 'Lever', sourceJobId: String(job.id), title: job.text, company,
      location: job.categories?.location ?? 'Location not listed',
      workArrangement: arrangement(`${job.workplaceType ?? ''} ${job.categories?.location ?? ''}`),
      employmentType: /part.?time/i.test(job.categories?.commitment ?? '') ? 'Part Time' : /contract/i.test(job.categories?.commitment ?? '') ? 'Contract' : 'Full Time',
      description: job.descriptionPlain ?? job.description ?? '',
      postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
      applyUrl: job.applyUrl ?? job.hostedUrl, employerDirect: true,
    }));
  }));
  return results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
}

export async function ashby(configs: BoardConfig[]): Promise<SourceJob[]> {
  const results = await Promise.allSettled(configs.map(async ({ company, token }) => {
    const data = await json(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(token)}?includeCompensation=true`);
    return (data.jobs ?? []).map((job: any): SourceJob => ({
      source: 'Ashby', sourceJobId: String(job.id ?? job.jobUrl), title: job.title, company,
      location: job.location ?? 'Location not listed',
      workArrangement: arrangement(`${job.workplaceType ?? ''} ${job.location ?? ''}`),
      employmentType: /part.?time/i.test(job.employmentType ?? '') ? 'Part Time' : /contract/i.test(job.employmentType ?? '') ? 'Contract' : 'Full Time',
      salary: job.compensation?.compensationTierSummary,
      description: job.descriptionPlain ?? job.descriptionHtml ?? '', postedAt: job.publishedAt,
      applyUrl: job.applyUrl ?? job.jobUrl, employerDirect: true,
    }));
  }));
  return results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
}

export function configuredBoards(env: Record<string, string | undefined>) {
  return {
    greenhouse: parseBoards(env.GREENHOUSE_BOARDS_JSON),
    lever: parseBoards(env.LEVER_SITES_JSON),
    ashby: parseBoards(env.ASHBY_BOARDS_JSON),
  };
}
