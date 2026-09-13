import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { HashRouter, Route, Routes } from 'react-router-dom';
import AuthScreen from './components/AuthScreen';
import MobileNav from './components/MobileNav';
import Sidebar from './components/Sidebar';
import { createEmptyProfile, defaultPreferences } from './data/demo';
import { useAuth } from './hooks/useAuth';
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
import { signOut } from './services/supabase';
import type { Job, JobStatus } from './types/Job';

export default function App() {
  const { session, loading } = useAuth();

  if (loading) return <div className="auth-loading">Securing your JobFit workspace…</div>;
  if (!session) return <AuthScreen />;

  return <AuthenticatedApp key={session.user.id} user={session.user} />;
}

function AuthenticatedApp({ user }: { user: User }) {
  const displayName = String(user.user_metadata.full_name || user.user_metadata.name || '').trim();
  const storagePrefix = `jobfit:${user.id}`;
  const [profile, setProfile] = useLocalStorage(`${storagePrefix}:profile`, createEmptyProfile(displayName));
  const [preferences, setPreferences] = useLocalStorage(`${storagePrefix}:preferences`, defaultPreferences);
  const [statuses, setStatuses] = useLocalStorage<Record<string, JobStatus>>(`${storagePrefix}:statuses`, {});
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
        <Sidebar displayName={displayName} email={user.email ?? ''} onSignOut={() => { void signOut(); }} />
        <main className="content">
          <header className="topbar"><div><strong>JobFit AI</strong><span>Resume-driven job matching</span></div><span className="privacy">Private · Google authenticated</span></header>
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
