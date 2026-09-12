import { demoJobs } from '../data/demo';
import { calculateFitment } from '../engine/fitment';
import { deduplicateJobs } from '../engine/deduplicate';
import type { Job } from '../types/Job';
import type { ResumeProfile } from '../types/Resume';
import type { SearchPreferences } from '../types/User';

export async function getJobMatches(profile: ResumeProfile, preferences: SearchPreferences): Promise<Job[]> {
  const workerUrl = import.meta.env.VITE_WORKER_API_URL as string | undefined;
  let jobs: Job[] = demoJobs;

  try {
    const endpoint = workerUrl ? `${workerUrl}/api/jobs` : '/api/jobs';
    const response = await fetch(endpoint);
    if (response.ok) {
      const payload = await response.json() as { jobs?: Job[] };
      if (payload.jobs?.length) jobs = payload.jobs;
    }
  } catch {
    // Keep the app usable when the live provider is temporarily unavailable.
  }

  return deduplicateJobs(jobs)
    .map((job) => ({ ...job, ...calculateFitment(job, profile, preferences) }))
    .filter((job) => (job.fitment ?? 0) >= preferences.minimumFitment)
    .sort((a, b) => (b.fitment ?? 0) - (a.fitment ?? 0));
}
