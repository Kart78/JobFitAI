interface AdzunaJob {
  id: string;
  title: string;
  description?: string;
  redirect_url: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
}

declare const process: { env: Record<string, string | undefined> };

interface AdzunaResponse {
  results?: AdzunaJob[];
}

const skills = [
  'Power BI', 'Microsoft Fabric', 'DAX', 'Power Query', 'SQL', 'Python',
  'Tableau', 'Databricks', 'Snowflake', 'Power Automate', 'Data Governance',
  'Azure', 'Cognos', 'GenAI',
];

const excludedEmployerTerms = [
  'staffing', 'recruiting', 'recruitment', 'consultancy', 'consulting services',
  'capgemini', 'accenture', 'cognizant', 'infosys', 'tata consultancy', 'tcs',
  'wipro', 'hcltech', 'deloitte',
];

function inferSkills(text: string): string[] {
  const normalized = text.toLowerCase();
  const found = skills.filter((skill) => normalized.includes(skill.toLowerCase()));
  return found.length ? found : ['Business Intelligence'];
}

function workArrangement(text: string): 'On-site' | 'Hybrid' | 'Remote' {
  const value = text.toLowerCase();
  if (value.includes('remote')) return 'Remote';
  if (value.includes('hybrid')) return 'Hybrid';
  return 'On-site';
}

function salary(job: AdzunaJob, country: string): string | undefined {
  if (!job.salary_min && !job.salary_max) return undefined;
  const currency = country === 'in' ? 'INR' : 'USD';
  const formatter = new Intl.NumberFormat(country === 'in' ? 'en-IN' : 'en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  });
  if (job.salary_min && job.salary_max) return `${formatter.format(job.salary_min)}–${formatter.format(job.salary_max)}`;
  return formatter.format(job.salary_min ?? job.salary_max ?? 0);
}

async function searchCountry(country: 'us' | 'in', appId: string, appKey: string) {
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '30',
    what_or: 'Power BI Microsoft Fabric BI Architect Analytics Architect Business Intelligence',
    sort_by: 'date',
    full_time: '1',
    permanent: '1',
    'content-type': 'application/json',
  });

  if (country === 'us') params.set('where', 'Dallas, TX');

  const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`);
  if (!response.ok) throw new Error(`Adzuna ${country.toUpperCase()} request failed: ${response.status}`);
  const payload = await response.json() as AdzunaResponse;

  return (payload.results ?? []).filter((job) => {
    const company = job.company?.display_name?.toLowerCase() ?? '';
    return !excludedEmployerTerms.some((term) => company.includes(term));
  }).map((job) => {
    const description = job.description ?? '';
    const location = job.location?.display_name ?? (country === 'in' ? 'India' : 'United States');
    const text = `${job.title} ${description} ${location}`;
    return {
      id: `adzuna-${country}-${job.id}`,
      title: job.title,
      company: job.company?.display_name ?? 'Employer not listed',
      location,
      workArrangement: workArrangement(text),
      employmentType: 'Full Time' as const,
      salary: salary(job, country),
      postedDate: job.created,
      freshness: job.created ? `Posted ${job.created.slice(0, 10)}` : 'Live listing',
      applyUrl: job.redirect_url,
      source: 'Adzuna live jobs',
      description,
      requiredSkills: inferSkills(text),
      status: 'New' as const,
    };
  }).filter((job) => /^https?:\/\//i.test(job.applyUrl));
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;
  if (!appId || !appKey) {
    return response.status(503).json({ error: 'Live job search is not configured.' });
  }

  try {
    const results = await Promise.allSettled([
      searchCountry('us', appId, appKey),
      searchCountry('in', appId, appKey),
    ]);
    const jobs = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
    if (!jobs.length) return response.status(502).json({ error: 'No live job sources responded.' });

    response.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return response.status(200).json({ jobs, live: true, fetchedAt: new Date().toISOString() });
  } catch (error) {
    return response.status(502).json({ error: error instanceof Error ? error.message : 'Job search failed.' });
  }
}
