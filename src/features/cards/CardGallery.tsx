import { useState } from 'react'
import { Link } from 'react-router'
import type { CardType } from '../../content/types'
import { useProgress } from '../../store/progress'
import { CARDS, isCardUnlocked } from './resolveCards'
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
  const missions = useProgress((s) => s.missions)
  const unlocked = (ref: string) => isCardUnlocked(ref, readChapters, missions)
  const [tab, setTab] = useState<CardType | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const list = CARDS.filter((c) => tab === 'all' || c.type === tab)
  const earnedCount = CARDS.filter((c) => unlocked(c.ref)).length
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
        <p className="muted">그 장의 미션을 모두 완료하면 카드가 복원됩니다.</p>
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
          const earned = unlocked(c.ref)
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
            <CardFace card={open} earned={unlocked(open.ref)} />
            <div className="sheet-actions">
              <Link className="btn" to={`/read/${parseRef(open.ref).bookId}/${parseRef(open.ref).chapter}`}>
                {getBook(parseRef(open.ref).bookId).name} {parseRef(open.ref).chapter}장 {readChapters[open.ref] ? (unlocked(open.ref) ? '다시 읽기' : '미션 도전하기') : '읽으러 가기'}
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
