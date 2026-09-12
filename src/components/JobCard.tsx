import { BriefcaseBusiness, ExternalLink, MapPin } from 'lucide-react';
import type { Job, JobStatus } from '../types/Job';
import FitmentScore from './FitmentScore';

interface Props {
  job: Job;
  rank?: number;
  onStatusChange?: (id: string, status: JobStatus) => void;
}

const companyCareerPages: Record<string, string> = {
  Capgemini: 'https://www.capgemini.com/careers/join-capgemini/job-search/',
  CDW: 'https://cdw.wd5.myworkdayjobs.com/CDWExternal',
  'Texas Health Resources': 'https://jobs.texashealth.org/',
  ARGO: 'https://argodata.com/careers/',
  'Prestige Staffing': 'https://www.prestigestaffing.com/',
};

export default function JobCard({ job, rank, onStatusChange }: Props) {
  const applicationUrl = /^https?:\/\//i.test(job.applyUrl) ? job.applyUrl : companyCareerPages[job.company];
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
        {applicationUrl ? (
          <>
            <a className="button secondary" href={applicationUrl} target="_blank" rel="noopener noreferrer">View Details</a>
            <a className="button" href={applicationUrl} target="_blank" rel="noopener noreferrer">Apply Now <ExternalLink size={15} /></a>
          </>
        ) : <span className="application-unavailable" title="A live employer application link has not been verified for this demo listing.">Application link unavailable</span>}
      </div>
    </article>
  );
}
