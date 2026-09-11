import { BriefcaseBusiness, FileText, Gauge, ListChecks, Mail, Search, Settings, SlidersHorizontal } from 'lucide-react';
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

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand"><BriefcaseBusiness /> <div><strong>JobFit AI</strong><small>Find Better Opportunities.</small></div></div>
      <nav>{links.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={19} /> {label}</NavLink>)}</nav>
      <div className="sidebar-footer"><div className="avatar">K</div><div><strong>Karthi</strong><small>Private workspace</small></div></div>
    </aside>
  );
}
