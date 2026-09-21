import { Link, useParams } from 'react-router'
import { getBook, chapterRef } from '../../content/books'
import { useProgress } from '../../store/progress'
import './reader.css'

export function ChapterList() {
  const { bookId = '' } = useParams()
  const book = getBook(bookId)
  const read = useProgress((s) => s.readChapters)
  return (
    <main className="reader">
      <header className="reader-head">
        <Link to="/books" className="back">
          ← 목록
        </Link>
        <h1>{book.name}</h1>
      </header>
      <ol className="chapter-grid">
        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
          <li key={c}>
            <Link to={`/read/${book.id}/${c}`} className={read[chapterRef(book.id, c)] ? 'done' : ''}>
              {c}
            </Link>
          </li>
        ))}
      </ol>
    </main>
  )
}
