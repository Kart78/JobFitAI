import { useEffect, useMemo, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import MobileNav from './components/MobileNav';
import Sidebar from './components/Sidebar';
import { demoProfile, defaultPreferences } from './data/demo';
import { useLocalStorage } from './hooks/useLocalStorage';
import Applications from './pages/Applications';
import Dashboard from './pages/Dashboard';
import JobMatches from './pages/JobMatches';
import Preferences from './pages/Preferences';
import Reports from './pages/Reports';
import Resume from './pages/Resume';
import Settings from './pages/Settings';
import { exportJobsToExcel } from './services/exportExcel';
import { getJobMatches } from './services/jobs';
import { parseResume } from './services/resume';
import type { Job, JobStatus } from './types/Job';

export default function App() {
  const [profile, setProfile] = useLocalStorage('jobfit-profile', demoProfile);
  const [preferences, setPreferences] = useLocalStorage('jobfit-preferences', defaultPreferences);
  const [statuses, setStatuses] = useLocalStorage<Record<string, JobStatus>>('jobfit-statuses', {});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getJobMatches(profile, preferences).then((matches) => {
      if (!active) return;
      setJobs(matches.map((job) => ({ ...job, status: statuses[job.id] ?? job.status ?? 'New' })));
      setLoading(false);
    });
    return () => { active = false; };
  }, [profile, preferences, refreshKey]);

  const statusAwareJobs = useMemo(() => jobs.map((job) => ({ ...job, status: statuses[job.id] ?? job.status ?? 'New' })), [jobs, statuses]);
  const onStatusChange = (id: string, status: JobStatus) => setStatuses({ ...statuses, [id]: status });
  const onUpload = async (file: File) => setProfile(await parseResume(file, profile));
  const onExport = () => exportJobsToExcel(statusAwareJobs);

  return (
    <HashRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="content">
          <header className="topbar"><div><strong>JobFit AI</strong><span>Resume-driven job matching</span></div><span className="privacy">100% Free MVP · Local-first settings</span></header>
          {loading && <div className="loading-bar">Refreshing match scores…</div>}
          <Routes>
            <Route path="/" element={<Dashboard profile={profile} preferences={preferences} jobs={statusAwareJobs} onStatusChange={onStatusChange} onExport={onExport}/>} />
            <Route path="/resume" element={<Resume profile={profile} onUpload={onUpload} onProfileChange={setProfile}/>} />
            <Route path="/preferences" element={<Preferences preferences={preferences} onChange={setPreferences}/>} />
            <Route path="/jobs" element={<JobMatches jobs={statusAwareJobs} loading={loading} onRefresh={() => setRefreshKey((value) => value + 1)} onStatusChange={onStatusChange} onExport={onExport}/>} />
            <Route path="/applications" element={<Applications jobs={statusAwareJobs}/>} />
            <Route path="/reports" element={<Reports preferences={preferences} onChange={setPreferences} jobs={statusAwareJobs} onExport={onExport}/>} />
            <Route path="/settings" element={<Settings/>} />
          </Routes>
        </main>
        <MobileNav />
      </div>
    </HashRouter>
  );
}
