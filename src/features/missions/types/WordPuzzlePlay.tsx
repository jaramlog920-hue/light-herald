import { useState } from 'react'
import type { WordPuzzleMission } from '../../../content/types'
import type { PlayProps } from '../MissionPlay'
import { shuffled } from '../grade'

/** 섞인 단어 카드를 눌러 구절을 완성한다. 같은 단어가 여러 개일 수 있어 index로 다룬다 */
export function WordPuzzlePlay({ mission, submit, locked }: PlayProps<WordPuzzleMission>) {
  const pool = shuffled(
    mission.words.map((w, i) => ({ w, i })),
    mission.id,
  )
  const [picked, setPicked] = useState<number[]>([])
  const remaining = pool.filter((p) => !picked.includes(p.i))
  const words = picked.map((i) => mission.words[i])
  return (
    <div>
      <p className="mission-q">{mission.verseRef}</p>
      <div className="route-line" aria-label="맞춘 구절">
        {words.length === 0 ? <span className="muted">단어를 순서대로 누르세요</span> : words.join(' ')}
      </div>
      <div className="chip-row">
        {remaining.map((p) => (
          <button key={p.i} className="chip" disabled={locked} onClick={() => setPicked([...picked, p.i])}>
            {p.w}
          </button>
        ))}
      </div>
      <div className="sheet-actions">
        <button className="btn" disabled={locked || picked.length === 0} onClick={() => setPicked(picked.slice(0, -1))}>
          하나 빼기
        </button>
        <button className="btn primary" disabled={locked || remaining.length > 0} onClick={() => submit({ type: 'word-puzzle', words })}>
          완성
        </button>
      </div>
    </div>
  )
}
