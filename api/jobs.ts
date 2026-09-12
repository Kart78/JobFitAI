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
  const currency = country === 'in' ? 'INR' : country === 'ca' ? 'CAD' : 'USD';
  const formatter = new Intl.NumberFormat(country === 'in' ? 'en-IN' : country === 'ca' ? 'en-CA' : 'en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  });
  if (job.salary_min && job.salary_max) return `${formatter.format(job.salary_min)}–${formatter.format(job.salary_max)}`;
  return formatter.format(job.salary_min ?? job.salary_max ?? 0);
}

type Country = 'us' | 'ca' | 'in';

function firstLocationFor(country: Country, locations: string[]): string | undefined {
  const match = locations.find((location) => {
    const value = location.toLowerCase();
    if (country === 'in') return value.includes('india') || ['bengaluru', 'hyderabad', 'chennai', 'pune', 'mumbai', 'delhi'].some((city) => value.includes(city));
    if (country === 'ca') return value.includes('canada') || ['toronto', 'vancouver', 'calgary', 'ottawa', 'montreal'].some((city) => value.includes(city));
    return !value.includes('india') && !value.includes('canada') && !value.includes('north america') && !value.includes('remote');
  });
  return match?.replace(/remote,?\s*/i, '').trim();
}

function searchPhrase(roles: string[]): string {
  const text = roles.join(' ').toLowerCase();
  if (text.includes('power bi')) return 'Power BI';
  if (text.includes('fabric')) return 'Microsoft Fabric';
  if (text.includes('tableau')) return 'Tableau';
  if (text.includes('analytics')) return 'Data Analytics';
  return 'Business Intelligence';
}

async function searchCountry(country: Country, appId: string, appKey: string, roles: string[], locations: string[], radius: number) {
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '30',
    what_phrase: searchPhrase(roles),
    sort_by: 'date',
    full_time: '1',
    permanent: '1',
    distance: String(Math.min(Math.max(radius, 10), 100)),
    'content-type': 'application/json',
  });

  const where = firstLocationFor(country, locations);
  if (where) params.set('where', where);

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
    const roles = String(request.query?.roles ?? '').split('|').map((value) => value.trim()).filter(Boolean).slice(0, 8);
    const locations = String(request.query?.locations ?? '').split('|').map((value) => value.trim()).filter(Boolean);
    const radius = Number(request.query?.radius) || 40;
    const locationText = locations.join(' ').toLowerCase();
    const countries: Country[] = [];
    if (!locations.length || locationText.includes('north america') || locationText.includes('united states') || locations.some((location) => /\b[A-Z]{2}\b/.test(location))) countries.push('us');
    if (locationText.includes('canada') || locationText.includes('north america')) countries.push('ca');
    if (locationText.includes('india') || ['bengaluru', 'hyderabad', 'chennai', 'pune', 'mumbai', 'delhi'].some((city) => locationText.includes(city))) countries.push('in');
    if (!countries.length) countries.push('us');

    const results = await Promise.allSettled(countries.map((country) => searchCountry(country, appId, appKey, roles, locations, radius)));
    const jobs = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
    if (!jobs.length) return response.status(502).json({ error: 'No live job sources responded.' });

    response.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return response.status(200).json({ jobs, live: true, fetchedAt: new Date().toISOString() });
  } catch (error) {
    return response.status(502).json({ error: error instanceof Error ? error.message : 'Job search failed.' });
  }
}
