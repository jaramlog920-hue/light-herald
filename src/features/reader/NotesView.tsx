import { Link } from 'react-router'
import { useProgress } from '../../store/progress'
import { BOOKS, getBook, parseRef } from '../../content/books'
import './reader.css'
import '../cards/cards.css'

/** 이번 회독에 남긴 묵상을 성경 순서로 모아 본다 */
export function NotesView() {
  const notes = useProgress((s) => s.notes)
  const readChapters = useProgress((s) => s.readChapters)
  const order = new Map(BOOKS.map((b, i) => [b.id, i]))
  const list = Object.entries(notes)
    .filter(([, t]) => t.trim())
    .map(([ref, text]) => ({ ref, text, ...parseRef(ref) }))
    .sort((a, b) => (order.get(a.bookId)! - order.get(b.bookId)!) || a.chapter - b.chapter)

  return (
    <main className="reader">
      <header className="reader-head">
        <Link to="/cycles" className="back">
          ← 회독
        </Link>
        <h1>묵상 모아보기</h1>
        <p className="muted">{list.length}개</p>
      </header>
      {list.length === 0 ? (
        <p className="muted">아직 남긴 묵상이 없습니다. 장을 읽고 "묵상 한 줄"에 적어 보세요.</p>
      ) : (
        <ul className="relation-list">
          {list.map((n) => (
            <li key={n.ref}>
              <Link to={`/read/${n.bookId}/${n.chapter}`} style={{ textDecoration: 'none' }}>
                <div>
                  <span style={{ color: 'var(--gold)' }}>
                    {getBook(n.bookId).name} {n.chapter}장
                  </span>{' '}
                  <span className="muted">{readChapters[n.ref]?.slice(0, 10)}</span>
                </div>
                <div style={{ marginTop: 4, lineHeight: 1.6 }}>{n.text}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
