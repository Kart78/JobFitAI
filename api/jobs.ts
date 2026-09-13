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

function inferSkills(text: string): string[] {
  const normalized = text.toLowerCase();
  const found = skills.filter((skill) => normalized.includes(skill.toLowerCase()));
  if (found.length) return found;
  return normalized.includes('business intelligence') ? ['Business Intelligence'] : [];
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

async function searchCountry(country: Country, appId: string, appKey: string, roles: string[], locations: string[], radius: number): Promise<SourceJob[]> {
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

  return (payload.results ?? []).map((job): SourceJob => {
    const description = job.description ?? '';
    const location = job.location?.display_name ?? (country === 'in' ? 'India' : 'United States');
    const text = `${job.title} ${description} ${location}`;
    return {
      source: 'Adzuna', sourceJobId: `${country}-${job.id}`,
      title: job.title,
      company: job.company?.display_name ?? 'Employer not listed',
      location,
      workArrangement: arrangement(text),
      employmentType: 'Full Time' as const,
      salary: salary(job, country),
      postedAt: job.created,
      applyUrl: job.redirect_url,
      description,
      employerDirect: false,
    };
  });
}

function toClientJob(job: SourceJob) {
  const text = `${job.title} ${job.description}`;
  return {
    id: `${job.source.toLowerCase()}-${job.sourceJobId}`,
    title: job.title, company: job.company, location: job.location,
    workArrangement: job.workArrangement, employmentType: job.employmentType,
    salary: job.salary, postedDate: job.postedAt,
    freshness: job.postedAt ? `Posted ${job.postedAt.slice(0, 10)}` : 'Live listing',
    applyUrl: job.applyUrl, source: job.employerDirect ? `${job.source} · Direct employer` : `${job.source} live jobs`,
    description: job.description, requiredSkills: inferSkills(text), status: 'New' as const,
    isPriority: job.employerDirect,
  };
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;
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

    const input: SearchInput = { roles, locations, radius };
    const boards = configuredBoards(process.env);
    const sourceCalls: Array<Promise<SourceJob[]>> = [
      greenhouse(boards.greenhouse), lever(boards.lever), ashby(boards.ashby), jooble(process.env.JOOBLE_API_KEY, input),
    ];
    if (appId && appKey) sourceCalls.push(...countries.map((country) => searchCountry(country, appId, appKey, roles, locations, radius)));
    const results = await Promise.allSettled(sourceCalls);
    const normalized = deduplicate(results.flatMap((result) => result.status === 'fulfilled' ? result.value : []));
    const jobs = normalized.map(toClientJob);
    if (!jobs.length) return response.status(502).json({ error: 'No live job sources responded.' });

    response.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return response.status(200).json({ jobs, live: true, fetchedAt: new Date().toISOString() });
  } catch (error) {
    return response.status(502).json({ error: error instanceof Error ? error.message : 'Job search failed.' });
  }
}
type WorkArrangement = 'On-site' | 'Hybrid' | 'Remote';
interface SearchInput { roles: string[]; locations: string[]; radius: number }
interface SourceJob { source: string; sourceJobId: string; title: string; company: string; location: string; workArrangement: WorkArrangement; employmentType: 'Full Time' | 'Contract' | 'Part Time'; salary?: string; description: string; postedAt?: string; applyUrl: string; employerDirect: boolean }
interface BoardConfig { company: string; token: string }

const excludedEmployerTerms = ['staffing','recruiting','recruitment','consultancy','consulting services','capgemini','accenture','cognizant','infosys','tata consultancy','tcs','wipro','hcltech','deloitte'];
function arrangement(value: string): WorkArrangement { const text=value.toLowerCase(); return text.includes('remote')?'Remote':text.includes('hybrid')?'Hybrid':'On-site'; }
function parseBoards(raw?: string): BoardConfig[] { if(!raw)return []; try { const value=JSON.parse(raw); return Array.isArray(value)?value.filter((item)=>item?.company&&item?.token):[]; } catch { return []; } }
function isRelevant(job: SourceJob): boolean { const title=job.title.toLowerCase(); const text=`${title} ${job.description}`.toLowerCase(); const tech=['power bi','microsoft fabric','business intelligence','analytics architect','bi architect','data architect','power platform','tableau'].some((term)=>text.includes(term)); const role=['analyst','analytics','architect','business intelligence','bi ','developer','reporting','data ','manager','director','consultant'].some((term)=>title.includes(term)); const company=job.company.toLowerCase(); return tech&&role&&!excludedEmployerTerms.some((term)=>company.includes(term))&&/^https?:\/\//i.test(job.applyUrl); }
function deduplicate(jobs: SourceJob[]): SourceJob[] { const seen=new Set<string>(); return jobs.filter(isRelevant).sort((a,b)=>Number(b.employerDirect)-Number(a.employerDirect)).filter((job)=>{ const clean=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]/g,''); const key=`${clean(job.title)}|${clean(job.company)}|${clean(job.location)}`; if(seen.has(key))return false; seen.add(key); return true; }); }
async function fetchJson(url:string):Promise<any>{ const response=await fetch(url,{headers:{Accept:'application/json'}}); if(!response.ok)throw new Error(`${url} returned ${response.status}`); return response.json(); }

async function greenhouse(configs:BoardConfig[]):Promise<SourceJob[]>{ const results=await Promise.allSettled(configs.map(async({company,token})=>{ const data=await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs?content=true`); return (data.jobs??[]).map((job:any):SourceJob=>({source:'Greenhouse',sourceJobId:String(job.id),title:job.title,company,location:job.location?.name??'Location not listed',workArrangement:arrangement(`${job.title} ${job.location?.name??''} ${job.content??''}`),employmentType:'Full Time',description:job.content??'',postedAt:job.updated_at,applyUrl:job.absolute_url,employerDirect:true})); })); return results.flatMap((result)=>result.status==='fulfilled'?result.value:[]); }
async function lever(configs:BoardConfig[]):Promise<SourceJob[]>{ const results=await Promise.allSettled(configs.map(async({company,token})=>{ const jobs=await fetchJson(`https://api.lever.co/v0/postings/${encodeURIComponent(token)}?mode=json`); return (jobs??[]).map((job:any):SourceJob=>({source:'Lever',sourceJobId:String(job.id),title:job.text,company,location:job.categories?.location??'Location not listed',workArrangement:arrangement(`${job.workplaceType??''} ${job.categories?.location??''}`),employmentType:/part.?time/i.test(job.categories?.commitment??'')?'Part Time':/contract/i.test(job.categories?.commitment??'')?'Contract':'Full Time',description:job.descriptionPlain??job.description??'',postedAt:job.createdAt?new Date(job.createdAt).toISOString():undefined,applyUrl:job.applyUrl??job.hostedUrl,employerDirect:true})); })); return results.flatMap((result)=>result.status==='fulfilled'?result.value:[]); }
async function ashby(configs:BoardConfig[]):Promise<SourceJob[]>{ const results=await Promise.allSettled(configs.map(async({company,token})=>{ const data=await fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(token)}?includeCompensation=true`); return (data.jobs??[]).map((job:any):SourceJob=>({source:'Ashby',sourceJobId:String(job.id??job.jobUrl),title:job.title,company,location:job.location??'Location not listed',workArrangement:arrangement(`${job.workplaceType??''} ${job.location??''}`),employmentType:/part.?time/i.test(job.employmentType??'')?'Part Time':/contract/i.test(job.employmentType??'')?'Contract':'Full Time',salary:job.compensation?.compensationTierSummary,description:job.descriptionPlain??job.descriptionHtml??'',postedAt:job.publishedAt,applyUrl:job.applyUrl??job.jobUrl,employerDirect:true})); })); return results.flatMap((result)=>result.status==='fulfilled'?result.value:[]); }
async function jooble(apiKey:string|undefined,input:SearchInput):Promise<SourceJob[]>{ if(!apiKey)return []; const response=await fetch(`https://jooble.org/api/${encodeURIComponent(apiKey)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({keywords:input.roles.join(' OR '),location:input.locations.join(', '),page:1})}); if(!response.ok)throw new Error(`Jooble returned ${response.status}`); const data=await response.json() as any; return (data.jobs??[]).map((job:any):SourceJob=>({source:'Jooble',sourceJobId:String(job.id??job.link),title:job.title,company:job.company??'Employer not listed',location:job.location??'Location not listed',workArrangement:arrangement(`${job.title} ${job.location??''} ${job.snippet??''}`),employmentType:/part.?time/i.test(job.type??'')?'Part Time':/contract/i.test(job.type??'')?'Contract':'Full Time',salary:job.salary||undefined,description:job.snippet??'',postedAt:job.updated,applyUrl:job.link,employerDirect:false})); }
function configuredBoards(env:Record<string,string|undefined>){ return {greenhouse:parseBoards(env.GREENHOUSE_BOARDS_JSON),lever:parseBoards(env.LEVER_SITES_JSON),ashby:parseBoards(env.ASHBY_BOARDS_JSON)}; }
