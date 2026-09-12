import { useState } from 'react';
import type { SearchPreferences } from '../types/User';

interface Props { preferences: SearchPreferences; onChange: (preferences: SearchPreferences) => void; }
const roleOptions = ['BI Architect','Analytics Architect','Power BI Architect','Senior BI Consultant','Data Analytics Architect','Senior Power BI Developer','Senior Business Intelligence Analyst','Data & AI Analytics Consultant'];
const locationSuggestions = ['North America','Remote, North America','United States','Remote, US','Dallas, TX','Plano, TX','McKinney, TX','Irving, TX','Richardson, TX','Frisco, TX','Canada','India','Remote, India','Bengaluru, India','Hyderabad, India','Chennai, India','Pune, India','Mumbai, India','Delhi NCR, India'];

export default function Preferences({ preferences, onChange }: Props) {
  const [locationInput, setLocationInput] = useState('');
  const toggle = (field: 'targetRoles'|'locations'|'employmentTypes', value: string) => {
    const current = preferences[field];
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    onChange({ ...preferences, [field]: next });
  };
  const addLocation = (value: string) => {
    const location = value.trim();
    if (!location || preferences.locations.some((item) => item.toLowerCase() === location.toLowerCase())) return;
    onChange({ ...preferences, locations: [...preferences.locations, location] });
    setLocationInput('');
  };
  return (
    <div className="page-stack">
      <div className="page-title"><div><h1>Search Preferences</h1><p>Control where the app searches and what qualifies as a strong opportunity.</p></div></div>
      <section className="section-card"><h2>Target Roles</h2><div className="check-grid">{roleOptions.map((role) => <label className="check-card" key={role}><input type="checkbox" checked={preferences.targetRoles.includes(role)} onChange={() => toggle('targetRoles', role)}/><span>{role}</span></label>)}</div></section>
      <section className="section-card">
        <h2>Preferred Locations</h2>
        <p className="helper">Choose a region or type any city, state, province, or country.</p>
        <div className="location-quick-picks">
          {['North America', 'India', 'Remote, US', 'Remote, India'].map((location) => <button className="button secondary" type="button" key={location} onClick={() => addLocation(location)}>+ {location}</button>)}
        </div>
        <div className="location-entry">
          <input aria-label="Type a preferred location" list="location-suggestions" placeholder="Type a location, for example Toronto or Bengaluru" value={locationInput} onChange={(event) => setLocationInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addLocation(locationInput); } }} />
          <datalist id="location-suggestions">{locationSuggestions.map((location) => <option value={location} key={location} />)}</datalist>
          <button className="button" type="button" disabled={!locationInput.trim()} onClick={() => addLocation(locationInput)}>Add Location</button>
        </div>
        <div className="selected-locations" aria-label="Selected preferred locations">
          {preferences.locations.map((location) => <button type="button" className="location-pill" key={location} onClick={() => toggle('locations', location)} aria-label={`Remove ${location}`}>{location} <span aria-hidden="true">×</span></button>)}
        </div>
        <label className="range-row">Search radius <input type="range" min="10" max="100" step="5" value={preferences.radiusMiles} onChange={(e) => onChange({...preferences, radiusMiles: Number(e.target.value)})}/><strong>{preferences.radiusMiles} miles</strong></label>
      </section>
      <section className="section-card"><h2>Employment & Remote</h2><div className="check-grid"><label className="check-card"><input type="checkbox" checked={preferences.employmentTypes.includes('Full Time')} onChange={() => toggle('employmentTypes','Full Time')}/><span>Full Time</span></label><label className="check-card"><input type="checkbox" checked={preferences.employmentTypes.includes('Contract')} onChange={() => toggle('employmentTypes','Contract')}/><span>Contract</span></label><label className="check-card"><input type="checkbox" checked={preferences.includeRemoteStrongMatches} onChange={(e) => onChange({...preferences, includeRemoteStrongMatches: e.target.checked})}/><span>Exceptional Remote US Matches</span></label></div></section>
      <section className="section-card"><h2>Minimum Fitment</h2><label className="range-row"><input type="range" min="5" max="10" step="0.1" value={preferences.minimumFitment} onChange={(e) => onChange({...preferences, minimumFitment: Number(e.target.value)})}/><strong>{preferences.minimumFitment.toFixed(1)} / 10</strong></label></section>
    </div>
  );
}
