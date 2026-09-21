import { Link } from 'react-router'
import { MISSIONS } from './grade'
import { useProgress } from '../../store/progress'
import { BOOKS, parseRef } from '../../content/books'
import '../reader/reader.css'
import '../cards/cards.css'
import './missions.css'

const TYPE_LABEL = {
  quiz: '사건 추리',
  'gospel-detective': '복음서 탐정',
  voyage: '바울의 항해',
  deliver: '편지 배달',
  'word-puzzle': '말씀 조각',
  choice: '선택의 순간',
} as const

export function MissionList() {
  const readChapters = useProgress((s) => s.readChapters)
  const records = useProgress((s) => s.missions)
  const gems = useProgress((s) => s.gems)
  const cleared = Object.keys(records).length
  return (
    <main className="reader">
      <header className="reader-head">
        <Link to="/" className="back">
          ← 지도
        </Link>
        <h1>미션</h1>
        <p className="muted">
          {cleared}/{MISSIONS.length} 완료 · 보석 💎 {gems}
        </p>
      </header>
      {BOOKS.map((b) => {
        const list = MISSIONS.filter((m) => parseRef(m.ref).bookId === b.id)
        if (list.length === 0) return null
        return (
          <section key={b.id}>
            <h2>{b.name}</h2>
            <ul className="mission-list">
              {list.map((m) => {
                const open = Boolean(readChapters[m.ref])
                const done = Boolean(records[m.id])
                return (
                  <li key={m.id}>
                    <Link to={`/missions/${m.id}`} className={done ? 'cleared' : open ? '' : 'locked'} aria-disabled={!open}>
                      <span>
                        {done ? '✓ ' : open ? '' : '🔒 '}
                        {parseRef(m.ref).chapter}장 · {m.title}
                      </span>
                      <small>{TYPE_LABEL[m.type]}</small>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </main>
  )
}
