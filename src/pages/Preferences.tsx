import type { SearchPreferences } from '../types/User';

interface Props { preferences: SearchPreferences; onChange: (preferences: SearchPreferences) => void; }
const roleOptions = ['BI Architect','Analytics Architect','Power BI Architect','Senior BI Consultant','Data Analytics Architect','Senior Power BI Developer','Senior Business Intelligence Analyst','Data & AI Analytics Consultant'];
const locationOptions = ['Dallas, TX','Plano, TX','McKinney, TX','Irving, TX','Richardson, TX','Frisco, TX'];

export default function Preferences({ preferences, onChange }: Props) {
  const toggle = (field: 'targetRoles'|'locations'|'employmentTypes', value: string) => {
    const current = preferences[field];
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    onChange({ ...preferences, [field]: next });
  };
  return (
    <div className="page-stack">
      <div className="page-title"><div><h1>Search Preferences</h1><p>Control where the app searches and what qualifies as a strong opportunity.</p></div></div>
      <section className="section-card"><h2>Target Roles</h2><div className="check-grid">{roleOptions.map((role) => <label className="check-card" key={role}><input type="checkbox" checked={preferences.targetRoles.includes(role)} onChange={() => toggle('targetRoles', role)}/><span>{role}</span></label>)}</div></section>
      <section className="section-card"><h2>North Texas Locations</h2><div className="check-grid">{locationOptions.map((loc) => <label className="check-card" key={loc}><input type="checkbox" checked={preferences.locations.includes(loc)} onChange={() => toggle('locations', loc)}/><span>{loc}</span></label>)}</div><label className="range-row">Search radius <input type="range" min="10" max="100" step="5" value={preferences.radiusMiles} onChange={(e) => onChange({...preferences, radiusMiles: Number(e.target.value)})}/><strong>{preferences.radiusMiles} miles</strong></label></section>
      <section className="section-card"><h2>Employment & Remote</h2><div className="check-grid"><label className="check-card"><input type="checkbox" checked={preferences.employmentTypes.includes('Full Time')} onChange={() => toggle('employmentTypes','Full Time')}/><span>Full Time</span></label><label className="check-card"><input type="checkbox" checked={preferences.employmentTypes.includes('Contract')} onChange={() => toggle('employmentTypes','Contract')}/><span>Contract</span></label><label className="check-card"><input type="checkbox" checked={preferences.includeRemoteStrongMatches} onChange={(e) => onChange({...preferences, includeRemoteStrongMatches: e.target.checked})}/><span>Exceptional Remote US Matches</span></label></div></section>
      <section className="section-card"><h2>Minimum Fitment</h2><label className="range-row"><input type="range" min="5" max="10" step="0.1" value={preferences.minimumFitment} onChange={(e) => onChange({...preferences, minimumFitment: Number(e.target.value)})}/><strong>{preferences.minimumFitment.toFixed(1)} / 10</strong></label></section>
    </div>
  );
}
