import ApplicationTracker from '../components/ApplicationTracker';
import type { Job } from '../types/Job';

export default function Applications({ jobs }: { jobs: Job[] }) {
  return <div className="page-stack"><div className="page-title"><div><h1>Application Tracker</h1><p>Keep every opportunity moving from shortlist to interview and offer.</p></div></div><section className="section-card"><ApplicationTracker jobs={jobs}/></section></div>;
}
