import { Gauge, ListChecks, Mail, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      <NavLink to="/"><Gauge size={20}/><span>Home</span></NavLink>
      <NavLink to="/jobs"><Search size={20}/><span>Matches</span></NavLink>
      <NavLink to="/applications"><ListChecks size={20}/><span>Applied</span></NavLink>
      <NavLink to="/reports"><Mail size={20}/><span>Reports</span></NavLink>
    </nav>
  );
}
