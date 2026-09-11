interface Props { score: number; compact?: boolean; }

export default function FitmentScore({ score, compact = false }: Props) {
  const label = score >= 9 ? 'Excellent Match' : score >= 8 ? 'Strong Match' : 'Potential Match';
  return (
    <div className={`fitment ${compact ? 'compact' : ''}`}>
      <strong>{score.toFixed(1)} / 10</strong>
      <span>{label}</span>
    </div>
  );
}
