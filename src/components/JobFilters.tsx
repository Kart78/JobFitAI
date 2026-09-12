interface Props {
  keyword: string;
  location: string;
  arrangement: string;
  locations: string[];
  minimum: number;
  status: string;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onArrangementChange: (value: string) => void;
  onMinimumChange: (value: number) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export default function JobFilters({ keyword, location, arrangement, locations, minimum, status, onKeywordChange, onLocationChange, onArrangementChange, onMinimumChange, onStatusChange, onClear }: Props) {
  return (
    <div className="filters">
      <label>Search <input type="search" placeholder="Title, company or skill" value={keyword} onChange={(e) => onKeywordChange(e.target.value)} /></label>
      <label>Location <select value={location} onChange={(e) => onLocationChange(e.target.value)}><option value="All">All locations</option>{locations.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Work type <select value={arrangement} onChange={(e) => onArrangementChange(e.target.value)}><option value="All">All work types</option>{['Remote','Hybrid','On-site'].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Minimum fit <input type="number" min="0" max="10" step="0.1" value={minimum} onChange={(e) => onMinimumChange(Number(e.target.value))} /></label>
      <label>Status <select value={status} onChange={(e) => onStatusChange(e.target.value)}><option>All</option>{['New','Seen','Shortlisted','Applied','Interview','Rejected','Offer','Closed'].map((s) => <option key={s}>{s}</option>)}</select></label>
      <button className="button secondary filter-clear" type="button" onClick={onClear}>Clear filters</button>
    </div>
  );
}
