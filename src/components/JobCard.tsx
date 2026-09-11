import { BriefcaseBusiness, ExternalLink, MapPin } from 'lucide-react';
import type { Job, JobStatus } from '../types/Job';
import FitmentScore from './FitmentScore';

interface Props {
  job: Job;
  rank?: number;
  onStatusChange?: (id: string, status: JobStatus) => void;
}

export default function JobCard({ job, rank, onStatusChange }: Props) {
  return (
    <article className="job-card">
      <div className="job-card-top">
        <div className="rank-badge">#{rank ?? '–'}</div>
        <div className="job-main">
          <h3>{job.title}</h3>
          <strong>{job.company}</strong>
          <div className="job-meta"><MapPin size={15} /> {job.location} · {job.workArrangement}</div>
          <div className="job-meta"><BriefcaseBusiness size={15} /> {job.employmentType}{job.salary ? ` · ${job.salary}` : ''}</div>
        </div>
        <FitmentScore score={job.fitment ?? 0} compact />
      </div>

      <div className="job-reasons">
        {(job.matchReasons ?? []).slice(0, 2).map((reason) => <span key={reason}>✓ {reason}</span>)}
      </div>

      <div className="job-card-actions">
        <select value={job.status ?? 'New'} onChange={(e) => onStatusChange?.(job.id, e.target.value as JobStatus)}>
          {['New','Seen','Shortlisted','Applied','Interview','Rejected','Offer','Closed'].map((status) => <option key={status}>{status}</option>)}
        </select>
        <a className="button secondary" href={job.applyUrl || '#'} target="_blank" rel="noreferrer">View Details</a>
        <a className="button" href={job.applyUrl || '#'} target="_blank" rel="noreferrer">Apply Now <ExternalLink size={15} /></a>
      </div>
    </article>
  );
}
