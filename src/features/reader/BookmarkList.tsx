import { useState } from 'react'
import { Link } from 'react-router'
import { useProgress } from '../../store/progress'
import { BOOKS, getBook } from '../../content/books'
import { getChapter } from '../../content/bible'
import './reader.css'

const order = new Map(BOOKS.map((b, i) => [b.id, i]))

/** 북마크 키 "book:chapter:verse" 분해 */
function parseKey(key: string) {
  const [bookId, ch, v] = key.split(':')
  return { bookId, chapter: Number(ch), verse: Number(v) }
}

/** 회독 화면의 북마크 목록: 성경 순서, 바로가기 · 개별 삭제 · 전체 초기화 */
export function BookmarkList() {
  const bookmarks = useProgress((s) => s.bookmarks)
  const removeBookmark = useProgress((s) => s.removeBookmark)
  const clearBookmarks = useProgress((s) => s.clearBookmarks)
  const [confirming, setConfirming] = useState(false)

  const list = Object.entries(bookmarks)
    .map(([key, b]) => ({ key, ...b, ...parseKey(key) }))
    .sort((a, b) => (order.get(a.bookId)! - order.get(b.bookId)!) || a.chapter - b.chapter || a.verse - b.verse)

  if (list.length === 0) return <p className="muted">아직 북마크가 없습니다. 본문에서 구절을 길게 누르면 북마크할 수 있습니다.</p>

  return (
    <>
      <ul className="bookmark-list">
        {list.map((b) => (
          <li key={b.key}>
            <Link to={`/read/${b.bookId}/${b.chapter}?v=${b.verse}`}>
              <span style={{ color: 'var(--gold)' }}>
                🔖 {getBook(b.bookId).name} {b.chapter}:{b.verse}
              </span>
              <div className="quote">{getChapter(b.bookId, b.chapter)[b.verse - 1]}</div>
              {b.memo && <div className="memo">{b.memo}</div>}
            </Link>
            <button type="button" className="remove" aria-label={`${getBook(b.bookId).name} ${b.chapter}:${b.verse} 북마크 삭제`} onClick={() => removeBookmark(b.key)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      {confirming ? (
        <div className="sheet-actions">
          <button className="btn" onClick={() => setConfirming(false)}>
            취소
          </button>
          <button
            className="btn"
            style={{ color: '#ff8a8a' }}
            onClick={() => {
              clearBookmarks()
              setConfirming(false)
            }}
          >
            {list.length}개 모두 삭제
          </button>
        </div>
      ) : (
        <button className="btn btn-block" onClick={() => setConfirming(true)}>
          북마크 전체 초기화
        </button>
      )}
    </>
  )
}
