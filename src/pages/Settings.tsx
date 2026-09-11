import { CheckCircle2, Database, Mail, Server } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

export default function Settings() {
  const items = [
    { icon: Database, title: 'Supabase', ready: isSupabaseConfigured(), detail: 'Database, auth and resume storage' },
    { icon: Server, title: 'Cloudflare Worker', ready: Boolean(import.meta.env.VITE_WORKER_API_URL), detail: 'Job API and daily cron scheduler' },
    { icon: Mail, title: 'Gmail API', ready: false, detail: 'OAuth credentials required before email sending' },
  ];
  return (
    <div className="page-stack"><div className="page-title"><div><h1>Settings</h1><p>Connection status for the zero-cost stack.</p></div></div><section className="section-card"><div className="connection-list">{items.map(({icon:Icon,title,ready,detail}) => <div className="connection" key={title}><Icon/><div><strong>{title}</strong><span>{detail}</span></div><span className={ready?'done':'muted-pill'}>{ready ? <><CheckCircle2 size={14}/> Ready</> : 'Setup needed'}</span></div>)}</div></section></div>
  );
}
