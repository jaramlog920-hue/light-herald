import { useProgress } from '../../store/progress'

export function MarkReadButton({ refId }: { refId: string }) {
  const readAt = useProgress((s) => s.readChapters[refId])
  const markRead = useProgress((s) => s.markRead)
  if (readAt) {
    return (
      <button className="btn done" disabled>
        ✓ 읽었어요 · {readAt.slice(0, 10)}
      </button>
    )
  }
  return (
    <button className="btn primary" onClick={() => markRead(refId)}>
      읽음
    </button>
  )
}
