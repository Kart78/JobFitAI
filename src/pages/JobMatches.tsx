import { Download } from 'lucide-react';
import { useState } from 'react';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import type { Job, JobStatus } from '../types/Job';

interface Props { jobs: Job[]; onStatusChange: (id: string, status: JobStatus) => void; onExport: () => void; }

export default function JobMatches({ jobs, onStatusChange, onExport }: Props) {
  const [minimum, setMinimum] = useState(0);
  const [status, setStatus] = useState('All');
  const filtered = jobs.filter((j) => (j.fitment ?? 0) >= minimum && (status === 'All' || (j.status ?? 'New') === status));
  return (
    <div className="page-stack">
      <div className="page-title"><div><h1>Job Matches</h1><p>Fresh opportunities ranked by transparent resume fitment.</p></div><button className="button secondary" onClick={onExport}><Download size={16}/> Export Excel</button></div>
      <section className="section-card"><JobFilters minimum={minimum} status={status} onMinimumChange={setMinimum} onStatusChange={setStatus}/></section>
      <div className="job-list">{filtered.map((job, index) => <JobCard key={job.id} job={job} rank={index + 1} onStatusChange={onStatusChange}/>)}</div>
    </div>
  );
}
