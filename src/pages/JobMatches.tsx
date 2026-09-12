import { Download, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import type { Job, JobStatus } from '../types/Job';

interface Props { jobs: Job[]; loading: boolean; onRefresh: () => void; onStatusChange: (id: string, status: JobStatus) => void; onExport: () => void; }

export default function JobMatches({ jobs, loading, onRefresh, onStatusChange, onExport }: Props) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('All');
  const [arrangement, setArrangement] = useState('All');
  const [minimum, setMinimum] = useState(0);
  const [status, setStatus] = useState('All');
  const locations = [...new Set(jobs.map((job) => job.location))].sort();
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filtered = jobs.filter((job) => {
    const searchable = `${job.title} ${job.company} ${job.description} ${job.requiredSkills.join(' ')}`.toLowerCase();
    return (!normalizedKeyword || searchable.includes(normalizedKeyword))
      && (location === 'All' || job.location === location)
      && (arrangement === 'All' || job.workArrangement === arrangement)
      && (job.fitment ?? 0) >= minimum
      && (status === 'All' || (job.status ?? 'New') === status);
  });
  const clearFilters = () => { setKeyword(''); setLocation('All'); setArrangement('All'); setMinimum(0); setStatus('All'); };
  return (
    <div className="page-stack">
      <div className="page-title"><div><h1>Job Matches</h1><p>Fresh opportunities ranked by transparent resume fitment.</p></div><div className="page-actions"><button className="button secondary" disabled={loading} onClick={onRefresh}><RefreshCw size={16}/> {loading ? 'Searching…' : 'Refresh Jobs'}</button><button className="button secondary" onClick={onExport}><Download size={16}/> Export Excel</button></div></div>
      <section className="section-card"><JobFilters keyword={keyword} location={location} arrangement={arrangement} locations={locations} minimum={minimum} status={status} onKeywordChange={setKeyword} onLocationChange={setLocation} onArrangementChange={setArrangement} onMinimumChange={setMinimum} onStatusChange={setStatus} onClear={clearFilters}/><div className="filter-summary">Showing <strong>{filtered.length}</strong> of {jobs.length} relevant jobs</div></section>
      <div className="job-list">{filtered.map((job, index) => <JobCard key={job.id} job={job} rank={index + 1} onStatusChange={onStatusChange}/>)}</div>
      {!loading && filtered.length === 0 && <section className="section-card empty-results"><h2>No jobs match these filters</h2><p>Clear the filters or adjust your roles, locations, and minimum fitment in Preferences.</p><button className="button secondary" onClick={clearFilters}>Clear filters</button></section>}
    </div>
  );
}
