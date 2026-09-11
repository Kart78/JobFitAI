export interface EmailReportInput { to: string; subject: string; body: string; }

export async function createGmailDraftPayload(input: EmailReportInput) {
  // Gmail OAuth/send integration belongs here once GOOGLE_CLIENT_ID,
  // GOOGLE_CLIENT_SECRET and refresh-token handling are configured securely.
  return {
    queued: false,
    provider: 'gmail',
    message: 'Gmail API credentials are not configured in the starter project.',
    input,
  };
}
