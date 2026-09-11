import { Download, Mail } from 'lucide-react';
import type { Job } from '../types/Job';
import type { SearchPreferences } from '../types/User';

interface Props { preferences: SearchPreferences; onChange: (preferences: SearchPreferences) => void; jobs: Job[]; onExport: () => void; }

export default function Reports({ preferences, onChange, jobs, onExport }: Props) {
  const top = jobs.slice(0,5);
  return (
    <div className="page-stack">
      <div className="page-title"><div><h1>Daily Report</h1><p>Configure your zero-cost morning digest and Excel report.</p></div></div>
      <div className="two-column">
        <section className="section-card"><h2>Email Settings</h2><div className="form-stack"><label className="toggle-row"><span>Send daily report</span><input type="checkbox" checked={preferences.emailReports} onChange={(e) => onChange({...preferences,emailReports:e.target.checked})}/></label><label>Email address<input type="email" placeholder="you@example.com" value={preferences.emailAddress} onChange={(e) => onChange({...preferences,emailAddress:e.target.value})}/></label><label>Preferred time (CT)<input type="time" value={preferences.reportTime} onChange={(e) => onChange({...preferences,reportTime:e.target.value})}/></label><label className="toggle-row"><span>Attach Excel report</span><input type="checkbox" checked={preferences.includeExcel} onChange={(e) => onChange({...preferences,includeExcel:e.target.checked})}/></label></div></section>
        <section className="section-card"><h2>Sample Email</h2><div className="email-preview"><div className="email-subject"><Mail size={18}/> Your Daily JobFit Report</div><p>We found <strong>{jobs.length}</strong> strong job matches. Your top opportunities:</p><ol>{top.map((j) => <li key={j.id}><strong>{j.fitment?.toFixed(1)}</strong> · {j.title} · {j.company}</li>)}</ol>{preferences.includeExcel && <p>Excel report attached.</p>}</div><button className="button secondary full" onClick={onExport}><Download size={16}/> Download Current Excel</button></section>
      </div>
    </div>
  );
}
