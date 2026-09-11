import { discoverJobs } from './jobSearch';

export async function runDailyJobRefresh() {
  const jobs = await discoverJobs();
  // Future: upsert jobs into Supabase, score users, generate reports, send Gmail digest.
  return { discovered: jobs.length, ranAt: new Date().toISOString() };
}
