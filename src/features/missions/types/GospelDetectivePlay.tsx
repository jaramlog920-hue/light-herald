import { useState } from 'react'
import type { GospelDetectiveMission } from '../../../content/types'
import type { PlayProps } from '../MissionPlay'
import { getBook } from '../../../content/books'

const GOSPELS = ['mat', 'mrk', 'luk', 'jhn']

export function GospelDetectivePlay({ mission, submit, locked }: PlayProps<GospelDetectiveMission>) {
  const [sel, setSel] = useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  return (
    <div>
      <p className="mission-q">{mission.event}</p>
      <p className="muted">해당하는 복음서를 모두 고르세요.</p>
      <div className="chip-row">
        {GOSPELS.map((g) => (
          <button key={g} className={`chip ${sel.has(g) ? 'on' : ''}`} disabled={locked} aria-pressed={sel.has(g)} onClick={() => toggle(g)}>
            {getBook(g).name}
          </button>
        ))}
      </div>
      <button className="btn primary" disabled={locked || sel.size === 0} onClick={() => submit({ type: 'gospel-detective', books: [...sel] })}>
        확인
      </button>
    </div>
  )
}
