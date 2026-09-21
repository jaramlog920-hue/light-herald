import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getBook, chapterRef, nextRef } from '../../content/books'
import { getChapter } from '../../content/bible'
import { useProgress } from '../../store/progress'
import { cardsForRef } from '../cards/resolveCards'
import { CardFace } from '../cards/CardFace'
import { NoteBox } from './NoteBox'
import { RewardSheet } from './RewardSheet'
import './reader.css'

export function ChapterView() {
  const { bookId = '', chapter = '1' } = useParams()
  const ch = Number(chapter)
  const book = getBook(bookId)
  const refId = chapterRef(bookId, ch)
  const verses = getChapter(bookId, ch)
  const setLastRef = useProgress((s) => s.setLastRef)
  const readAt = useProgress((s) => s.readChapters[refId])
  const markRead = useProgress((s) => s.markRead)
  const [showReward, setShowReward] = useState(false)

  useEffect(() => {
    setLastRef(refId)
    setShowReward(false)
    window.scrollTo(0, 0)
  }, [refId, setLastRef])

  const next = nextRef(bookId, ch)
  const nextTo = next ? `/read/${next.bookId}/${next.chapter}` : null

  const onMarkRead = () => {
    markRead(refId)
    setShowReward(true)
  }

  return (
    <main className="reader">
      <header className="reader-head">
        <Link to={`/books/${bookId}`} className="back">
          ← {book.name}
        </Link>
        <h1>
          {book.name} {ch}장
        </h1>
      </header>
      <article className="verses">
        {verses.map((v, i) => (
          <p key={i}>
            <sup>{i + 1}</sup> {v}
          </p>
        ))}
      </article>
      {readAt && (
        <section className="chapter-record">
          <h2>이 장의 기록</h2>
          <div className="card-grid">
            {cardsForRef(refId).map((c) => (
              <CardFace key={c.id} card={c} compact />
            ))}
          </div>
          <NoteBox refId={refId} />
        </section>
      )}
      <footer className="reader-foot">
        {readAt ? (
          <button className="btn done" disabled>
            ✓ 읽었어요 · {readAt.slice(0, 10)}
          </button>
        ) : (
          <button className="btn primary" onClick={onMarkRead}>
            읽음
          </button>
        )}
        {nextTo && (
          <Link className="btn" to={nextTo}>
            다음 장 →
          </Link>
        )}
        <Link className="btn ghost" to="/">
          지도
        </Link>
      </footer>
      {showReward && <RewardSheet refId={refId} nextTo={nextTo} onClose={() => setShowReward(false)} />}
    </main>
  )
}
