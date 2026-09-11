import { createGmailDraftPayload } from './emailReport';
import { discoverJobs } from './jobSearch';
import { runDailyJobRefresh } from './scheduler';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

    if (request.method === 'OPTIONS') return new Response(null, { headers: { ...headers, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    if (url.pathname === '/api/health') return new Response(JSON.stringify({ ok: true, service: 'jobfit-ai-worker' }), { headers });
    if (url.pathname === '/api/jobs' && request.method === 'GET') return new Response(JSON.stringify({ jobs: await discoverJobs() }), { headers });
    if (url.pathname === '/api/email-report' && request.method === 'POST') {
      const payload = await request.json() as { to: string; subject: string; body: string };
      return new Response(JSON.stringify(await createGmailDraftPayload(payload)), { headers });
    }
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  },
  async scheduled(): Promise<void> {
    await runDailyJobRefresh();
  },
};
