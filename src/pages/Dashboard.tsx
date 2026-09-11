import { Download, FileText, Mail, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import type { Job, JobStatus } from '../types/Job';
import type { ResumeProfile } from '../types/Resume';
import type { SearchPreferences } from '../types/User';

interface Props {
  profile: ResumeProfile;
  preferences: SearchPreferences;
  jobs: Job[];
  onStatusChange: (id: string, status: JobStatus) => void;
  onExport: () => void;
}

export default function Dashboard({ profile, preferences, jobs, onStatusChange, onExport }: Props) {
  return (
    <div className="page-stack">
      <section className="hero">
        <div><span className="eyebrow">PERSONAL JOB MATCHING</span><h1>Good morning, {profile.fullName}.</h1><p>Your strongest opportunities are ranked from your resume and search preferences.</p></div>
        <Link className="button" to="/jobs"><Search size={17}/> View Matches</Link>
      </section>

      <section className="setup-grid">
        <Link to="/resume" className="setup-card"><div className="step-icon"><FileText/></div><div><small>STEP 1</small><h3>Resume & Profile</h3><p>{profile.fileName ?? 'Upload your resume'} · {profile.totalYearsExperience}+ years</p></div><span className="done">Completed</span></Link>
        <Link to="/preferences" className="setup-card"><div className="step-icon"><SlidersHorizontal/></div><div><small>STEP 2</small><h3>Preferences</h3><p>{preferences.locations.slice(0,3).join(', ')} · {preferences.minimumFitment.toFixed(1)}+</p></div><span className="done">Ready</span></Link>
        <Link to="/reports" className="setup-card"><div className="step-icon"><Mail/></div><div><small>STEP 3</small><h3>Daily Report</h3><p>{preferences.emailReports ? `Active · ${preferences.reportTime} CT` : 'Email delivery is off'}</p></div><span className={preferences.emailReports ? 'done' : 'muted-pill'}>{preferences.emailReports ? 'Active' : 'Off'}</span></Link>
      </section>

      <section className="section-card">
        <div className="section-heading"><div><h2>Top Job Matches</h2><p>Highest fitment opportunities from the current result set.</p></div><button className="button secondary" onClick={onExport}><Download size={16}/> Export Excel</button></div>
        <div className="job-list">{jobs.slice(0,5).map((job, index) => <JobCard key={job.id} job={job} rank={index + 1} onStatusChange={onStatusChange}/>)}</div>
      </section>

      <section className="metrics-grid">
        <div className="metric-card"><strong>{jobs.length}</strong><span>Matches ≥ {preferences.minimumFitment.toFixed(1)}</span></div>
        <div className="metric-card"><strong>{jobs.filter((j) => (j.fitment ?? 0) >= 9).length}</strong><span>Excellent matches</span></div>
        <div className="metric-card"><strong>{jobs.filter((j) => ['Applied','Interview','Offer'].includes(j.status ?? '')).length}</strong><span>Active applications</span></div>
        <div className="metric-card"><strong>{profile.skills.length}</strong><span>Profile skills</span></div>
      </section>
    </div>
  );
}
