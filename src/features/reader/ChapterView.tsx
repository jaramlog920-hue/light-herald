import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { getBook, chapterRef, nextRef } from '../../content/books'
import { getChapter } from '../../content/bible'
import { useProgress } from '../../store/progress'
import { MarkReadButton } from './MarkReadButton'
import './reader.css'

export function ChapterView() {
  const { bookId = '', chapter = '1' } = useParams()
  const ch = Number(chapter)
  const book = getBook(bookId)
  const refId = chapterRef(bookId, ch)
  const verses = getChapter(bookId, ch)
  const setLastRef = useProgress((s) => s.setLastRef)
  useEffect(() => {
    setLastRef(refId)
    window.scrollTo(0, 0)
  }, [refId, setLastRef])
  const next = nextRef(bookId, ch)
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
      <footer className="reader-foot">
        <MarkReadButton refId={refId} />
        {next && (
          <Link className="btn" to={`/read/${next.bookId}/${next.chapter}`}>
            다음 장 →
          </Link>
        )}
        <Link className="btn ghost" to="/">
          지도
        </Link>
      </footer>
    </main>
  )
}
