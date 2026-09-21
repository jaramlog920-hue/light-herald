export function ProgressBar({ read, total }: { read: number; total: number }) {
  const pct = total ? Math.round((read / total) * 100) : 0
  return (
    <div className="pbar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="pbar-fill" style={{ width: `${pct}%` }} />
      <span className="pbar-label">
        {read}/{total} · {pct}%
      </span>
    </div>
  )
}
