import { useEffect, useMemo } from 'react'
import { useProgress } from '../../store/progress'
import { resolveMap, type MapState } from './resolveMap'

/** 현재 진행 상태를 지도 상태로 해석하고, 아직 연출을 보지 않은 트리거를 알려준다 */
export function useMapState(): { state: MapState; newRefs: Set<string> } {
  const readChapters = useProgress((s) => s.readChapters)
  const seen = useProgress((s) => s.seenMapRefs)
  const markMapSeen = useProgress((s) => s.markMapSeen)
  const state = useMemo(() => resolveMap(new Set(Object.keys(readChapters))), [readChapters])
  const newRefs = useMemo(
    () => new Set(state.triggeredRefs.filter((r) => !seen.includes(r))),
    [state, seen],
  )
  useEffect(() => {
    if (newRefs.size === 0) return
    const t = setTimeout(() => markMapSeen(state.triggeredRefs), 1500)
    return () => clearTimeout(t)
  }, [newRefs, state.triggeredRefs, markMapSeen])
  return { state, newRefs }
}
