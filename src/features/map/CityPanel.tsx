import { Link } from 'react-router'
import { motion } from 'framer-motion'
import type { MapCity } from '../../content/types'
import type { MapState } from './resolveMap'
import { useProgress } from '../../store/progress'
import { getBook, parseRef } from '../../content/books'
import '../cards/cards.css'

interface Props {
  city: MapCity
  state: MapState
  onClose: () => void
}

interface Entry {
  key: string
  kind: '발자국' | '빛의 확산' | '교회'
  label?: string
}

/** 도시의 기록 목록: 켜진 요소 종류, 읽은 날짜, 묵상 */
function entriesFor(city: MapCity, state: MapState): Entry[] {
  const out: Entry[] = []
  for (const f of state.footprints) if (f.at === city.id) out.push({ key: f.ref, kind: '발자국' })
  for (const s of state.spreads) if (s.to === city.id && s.from !== s.to) out.push({ key: s.ref, kind: '빛의 확산' })
  for (const c of state.churches) if (c.at === city.id) out.push({ key: `book:${c.book}`, kind: '교회', label: c.label })
  return out
}

function describe(key: string): { title: string; to: string; ref: string | null } {
  if (key.startsWith('book:')) {
    const b = getBook(key.slice(5))
    return { title: `${b.name} 완독`, to: `/books/${b.id}`, ref: null }
  }
  const { bookId, chapter } = parseRef(key)
  return { title: `${getBook(bookId).name} ${chapter}장`, to: `/read/${bookId}/${chapter}`, ref: key }
}

export function CityPanel({ city, state, onClose }: Props) {
  const readChapters = useProgress((s) => s.readChapters)
  const notes = useProgress((s) => s.notes)
  const entries = entriesFor(city, state)
  return (
    <div className="sheet-backdrop" role="dialog" aria-label={city.name} onClick={onClose}>
      <motion.div className="sheet" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
        <h2>{city.name}</h2>
        {entries.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center' }}>
            아직 이곳에 닿은 기록이 없습니다.
          </p>
        ) : (
          <ul className="relation-list">
            {entries.map((e) => {
              const d = describe(e.key)
              const readAt = d.ref ? readChapters[d.ref] : undefined
              const note = d.ref ? notes[d.ref] : undefined
              return (
                <li key={e.key + e.kind}>
                  <Link to={d.to} style={{ textDecoration: 'none' }}>
                    <div>
                      <span style={{ color: 'var(--gold)' }}>{e.kind}</span> · {d.title}
                      {e.label && <span> — {e.label}</span>}
                    </div>
                    {readAt && <div className="muted">{readAt.slice(0, 10)}</div>}
                    {note && <div style={{ fontSize: 13, marginTop: 4 }}>“{note}”</div>}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
        <div className="sheet-actions">
          <button className="btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </motion.div>
    </div>
  )
}
