export interface DailyEmailPayload {
  to: string;
  subject: string;
  body: string;
}

export async function sendDailyReport(payload: DailyEmailPayload) {
  const workerUrl = import.meta.env.VITE_WORKER_API_URL as string | undefined;
  if (!workerUrl) throw new Error('Worker API is not configured yet.');

  const response = await fetch(`${workerUrl}/api/email-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Email endpoint is not configured yet.');
  return response.json();
}
