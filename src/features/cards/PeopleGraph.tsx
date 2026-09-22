import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useProgress } from '../../store/progress'
import { PEOPLE, earnedPersonIds } from './resolveCards'
import '../reader/reader.css'
import './cards.css'

const W = 720
const H = 720
const CX = W / 2
const CY = H / 2

/** 예수님을 중심에, 나머지 인물을 원형으로 배치한 관계도. 획득한 인물만 밝게 */
export function PeopleGraph() {
  const readChapters = useProgress((s) => s.readChapters)
  const missions = useProgress((s) => s.missions)
  const earned = useMemo(() => earnedPersonIds(readChapters, missions), [readChapters, missions])
  const [sel, setSel] = useState<string | null>(null)

  const pos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>()
    const others = PEOPLE.persons.filter((p) => p.id !== 'jesus')
    m.set('jesus', { x: CX, y: CY })
    others.forEach((p, i) => {
      const a = (i / others.length) * Math.PI * 2 - Math.PI / 2
      m.set(p.id, { x: CX + Math.cos(a) * 290, y: CY + Math.sin(a) * 290 })
    })
    return m
  }, [])

  const isOn = (id: string) => id === 'jesus' || earned.has(id)
  const selected = PEOPLE.persons.find((p) => p.id === sel)
  const selRelations = PEOPLE.relations.filter((r) => r.from === sel || r.to === sel)

  return (
    <main className="reader">
      <header className="reader-head">
        <Link to="/cards" className="back">
          ← 카드장
        </Link>
        <h1>인물 관계도</h1>
        <p className="muted">
          {earned.size}/{PEOPLE.persons.length - 1} 인장 획득 · 인물을 눌러 관계를 보세요
        </p>
      </header>
      <svg viewBox={`0 0 ${W} ${H}`} className="people-svg" aria-label="인물 관계도">
        <defs>
          <clipPath id="avatar-clip" clipPathUnits="objectBoundingBox">
            <circle cx="0.5" cy="0.5" r="0.5" />
          </clipPath>
        </defs>
        {PEOPLE.relations.map((r, i) => {
          const a = pos.get(r.from)!
          const b = pos.get(r.to)!
          const on = isOn(r.from) && isOn(r.to)
          const hl = sel && (r.from === sel || r.to === sel)
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={hl ? 'var(--gold)' : on ? '#6f6650' : '#20242f'}
              strokeWidth={hl ? 2.5 : 1.2}
            />
          )
        })}
        {PEOPLE.persons.map((p) => {
          const { x, y } = pos.get(p.id)!
          const on = isOn(p.id)
          const jesus = p.id === 'jesus'
          return (
            <g
              key={p.id}
              data-testid={`person-${p.id}`}
              data-on={on}
              transform={`translate(${x} ${y})`}
              onClick={() => setSel(p.id)}
              style={{ cursor: 'pointer' }}
            >
              <circle r={jesus ? 40 : 20} fill={on ? (jesus ? '#1a1a2e' : '#1c2236') : '#141826'} stroke={on ? 'var(--gold)' : '#2a3044'} strokeWidth={sel === p.id ? 3 : 1.5} />
              {/* 예수님은 십자가, 인장을 얻은 인물만 실루엣 프로필. 미획득 인물은 빈 원 */}
              {on && (
                <image
                  href={jesus ? '/assets/people/jesus.webp' : '/assets/people/person.webp'}
                  x={jesus ? -36 : -17}
                  y={jesus ? -36 : -17}
                  width={jesus ? 72 : 34}
                  height={jesus ? 72 : 34}
                  clipPath="url(#avatar-clip)"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              <text y={jesus ? 58 : 36} textAnchor="middle" fontSize={jesus ? 16 : 12} fill={on ? 'var(--fg)' : '#4a4f62'}>
                {on ? p.name : '?'}
              </text>
            </g>
          )
        })}
      </svg>
      {selected && (
        <section className="chapter-record">
          <h2>
            {isOn(selected.id) ? selected.name : '아직 만나지 못한 인물'}{' '}
            <small className="muted">{isOn(selected.id) ? selected.role : ''}</small>
          </h2>
          <ul className="relation-list">
            {selRelations.map((r, i) => {
              const other = r.from === sel ? r.to : r.from
              const o = PEOPLE.persons.find((p) => p.id === other)!
              const visible = isOn(other) && isOn(selected.id)
              return (
                <li key={i}>
                  {visible ? (
                    <>
                      {r.from === sel ? `${selected.name} → ${o.name}` : `${o.name} → ${selected.name}`} · {r.label}
                    </>
                  ) : (
                    '???'
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </main>
  )
}
