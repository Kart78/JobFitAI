import type { Job } from '../types/Job';

export function jobFingerprint(job: Job): string {
  const normalized = [job.company, job.title, job.location]
    .map((value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim())
    .join('|');
  return `${normalized}|${job.applyUrl.split('?')[0]}`;
}

export function deduplicateJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const fingerprint = jobFingerprint(job);
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint);
    return true;
  });
}
