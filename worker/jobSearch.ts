export interface WorkerJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workArrangement: 'On-site' | 'Hybrid' | 'Remote';
  employmentType: 'Full Time' | 'Contract' | 'Part Time';
  applyUrl: string;
  source: string;
  description: string;
  requiredSkills: string[];
}

export async function discoverJobs(): Promise<WorkerJob[]> {
  // Intentionally empty for the zero-cost starter.
  // Add permitted employer career-site APIs/RSS/structured feeds here.
  // Avoid hardcoding private keys or scraping sources that prohibit automation.
  return [];
}
