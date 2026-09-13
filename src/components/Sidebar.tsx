import { BriefcaseBusiness, FileText, Gauge, ListChecks, LogOut, Mail, Search, Settings, SlidersHorizontal } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  ['/', 'Dashboard', Gauge],
  ['/resume', 'Resume', FileText],
  ['/preferences', 'Preferences', SlidersHorizontal],
  ['/jobs', 'Job Matches', Search],
  ['/applications', 'Applications', ListChecks],
  ['/reports', 'Reports', Mail],
  ['/settings', 'Settings', Settings],
] as const;

interface Props { displayName: string; email: string; onSignOut: () => void; }

export default function Sidebar({ displayName, email, onSignOut }: Props) {
  const initial = (displayName || email || 'U').trim().charAt(0).toUpperCase();
  return (
    <aside className="sidebar">
      <div className="brand"><BriefcaseBusiness /> <div><strong>JobFit AI</strong><small>Find Better Opportunities.</small></div></div>
      <nav>{links.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={19} /> {label}</NavLink>)}</nav>
      <div className="sidebar-footer"><div className="avatar">{initial}</div><div className="account-copy"><strong>{displayName || 'JobFit user'}</strong><small>{email}</small></div><button className="signout-button" type="button" aria-label="Sign out" title="Sign out" onClick={onSignOut}><LogOut size={18}/></button></div>
    </aside>
  );
}
