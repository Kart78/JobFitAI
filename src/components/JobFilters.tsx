interface Props {
  minimum: number;
  status: string;
  onMinimumChange: (value: number) => void;
  onStatusChange: (value: string) => void;
}

export default function JobFilters({ minimum, status, onMinimumChange, onStatusChange }: Props) {
  return (
    <div className="filters">
      <label>Minimum fit <input type="number" min="0" max="10" step="0.1" value={minimum} onChange={(e) => onMinimumChange(Number(e.target.value))} /></label>
      <label>Status <select value={status} onChange={(e) => onStatusChange(e.target.value)}><option>All</option>{['New','Seen','Shortlisted','Applied','Interview','Rejected','Offer','Closed'].map((s) => <option key={s}>{s}</option>)}</select></label>
    </div>
  );
}
