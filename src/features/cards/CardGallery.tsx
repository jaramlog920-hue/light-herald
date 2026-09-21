import { useState } from 'react'
import { Link } from 'react-router'
import type { CardType } from '../../content/types'
import { useProgress } from '../../store/progress'
import { CARDS } from './resolveCards'
import { CardFace } from './CardFace'
import { parseRef, getBook } from '../../content/books'
import '../reader/reader.css'
import './cards.css'

const TABS: { key: CardType | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'event', label: '사건' },
  { key: 'person', label: '인물' },
  { key: 'word', label: '말씀' },
]

export function CardGallery() {
  const readChapters = useProgress((s) => s.readChapters)
  const [tab, setTab] = useState<CardType | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const list = CARDS.filter((c) => tab === 'all' || c.type === tab)
  const earnedCount = CARDS.filter((c) => readChapters[c.ref]).length
  const open = list.find((c) => c.id === openId)
  return (
    <main className="reader">
      <header className="reader-head">
        <Link to="/" className="back">
          ← 지도
        </Link>
        <h1>기록 카드장</h1>
        <p className="muted">
          {earnedCount}/{CARDS.length} 복원 · <Link to="/people">인물 관계도 →</Link>
        </p>
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </header>
      <div className="card-grid">
        {list.map((c) => {
          const earned = Boolean(readChapters[c.ref])
          return (
            <div key={c.id} onClick={() => setOpenId(c.id)}>
              <CardFace card={c} earned={earned} compact />
            </div>
          )
        })}
      </div>
      {open && (
        <div className="sheet-backdrop" role="dialog" aria-label={open.title} onClick={() => setOpenId(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <CardFace card={open} earned={Boolean(readChapters[open.ref])} />
            <div className="sheet-actions">
              <Link className="btn" to={`/read/${parseRef(open.ref).bookId}/${parseRef(open.ref).chapter}`}>
                {getBook(parseRef(open.ref).bookId).name} {parseRef(open.ref).chapter}장 {readChapters[open.ref] ? '다시 읽기' : '읽으러 가기'}
              </Link>
              <button className="btn ghost" onClick={() => setOpenId(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
