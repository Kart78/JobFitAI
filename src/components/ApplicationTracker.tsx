import type { Job } from '../types/Job';

export default function ApplicationTracker({ jobs }: { jobs: Job[] }) {
  const tracked = jobs.filter((job) => job.status && job.status !== 'New' && job.status !== 'Seen');
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Job Title</th><th>Company</th><th>Location</th><th>Fitment</th><th>Status</th></tr></thead>
        <tbody>
          {tracked.length ? tracked.map((job) => (
            <tr key={job.id}><td>{job.title}</td><td>{job.company}</td><td>{job.location}</td><td>{job.fitment?.toFixed(1)}</td><td><span className="status-pill">{job.status}</span></td></tr>
          )) : <tr><td colSpan={5}>No tracked applications yet. Change a job's status to Shortlisted, Applied, or Interview.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
