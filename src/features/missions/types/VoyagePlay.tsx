import { useState } from 'react'
import type { VoyageMission } from '../../../content/types'
import type { PlayProps } from '../MissionPlay'
import { shuffled } from '../grade'
import { cityName } from '../cityName'

/** 도시 칩을 순서대로 눌러 항로를 잇는다 */
export function VoyagePlay({ mission, submit, locked }: PlayProps<VoyageMission>) {
  const pool = shuffled(mission.order, mission.id)
  const [picked, setPicked] = useState<string[]>([])
  const remaining = pool.filter((c) => !picked.includes(c))
  return (
    <div>
      <p className="mission-q">{mission.prompt}</p>
      <div className="route-line" aria-label="선택한 항로">
        {picked.length === 0 ? <span className="muted">도시를 순서대로 누르세요</span> : picked.map(cityName).join(' → ')}
      </div>
      <div className="chip-row">
        {remaining.map((c) => (
          <button key={c} className="chip" disabled={locked} onClick={() => setPicked([...picked, c])}>
            {cityName(c)}
          </button>
        ))}
      </div>
      <div className="sheet-actions">
        <button className="btn" disabled={locked || picked.length === 0} onClick={() => setPicked([])}>
          처음부터
        </button>
        <button className="btn primary" disabled={locked || remaining.length > 0} onClick={() => submit({ type: 'voyage', order: picked })}>
          항해 출발
        </button>
      </div>
    </div>
  )
}
