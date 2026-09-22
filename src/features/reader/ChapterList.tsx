import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getBook, chapterRef } from '../../content/books'
import { useProgress } from '../../store/progress'
import './reader.css'

/** 장 수에 맞춰 퍼즐 격자를 정한다. 그림(3:2)이 찌그러지지 않게 칸 비율은 격자에서 역산 */
export function puzzleGrid(chapters: number) {
  const cols = Math.min(7, Math.max(2, Math.ceil(Math.sqrt(chapters * 1.5))))
  const rows = Math.max(1, Math.ceil(chapters / cols))
  // 칸 높이/너비 비율: 전체 격자가 3:2가 되도록
  return { cols, rows, cellAspect: (2 / 3) * (cols / rows) }
}

export function ChapterList() {
  const { bookId = '' } = useParams()
  const book = getBook(bookId)
  const read = useProgress((s) => s.readChapters)
  const [open, setOpen] = useState(false)
  const { cols, rows, cellAspect } = puzzleGrid(book.chapters)
  const doneCount = Array.from({ length: book.chapters }, (_, i) => read[chapterRef(book.id, i + 1)]).filter(Boolean).length
  const complete = doneCount === book.chapters
  const image = `/assets/books/${book.id}.webp`
  const cells = cols * rows

  return (
    <main className="reader">
      <header className="reader-head">
        <Link to="/books" className="back">
          ← 목록
        </Link>
        <h1>{book.name}</h1>
        <p className="muted">
          {doneCount}/{book.chapters}장 · 장을 읽을 때마다 그림 조각이 맞춰집니다
        </p>
      </header>
      <ol className="chapter-grid puzzle" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, ['--cell' as string]: cellAspect }} data-testid="puzzle">
        {Array.from({ length: cells }, (_, idx) => {
          const c = idx + 1
          const col = idx % cols
          const row = Math.floor(idx / cols)
          const slice = {
            backgroundImage: `url(${image})`,
            backgroundSize: `${cols * 100}% ${rows * 100}%`,
            backgroundPosition: `${cols > 1 ? (col / (cols - 1)) * 100 : 0}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`,
          }
          // 장 수를 넘는 빈 칸은 책을 다 읽었을 때만 드러난다
          if (c > book.chapters) return <li key={c} className={complete ? 'piece filler revealed' : 'piece filler'} style={complete ? slice : undefined} aria-hidden />
          const done = Boolean(read[chapterRef(book.id, c)])
          return (
            <li key={c} className={done ? 'piece revealed' : 'piece'} style={done ? slice : undefined}>
              <Link to={`/read/${book.id}/${c}`} className={done ? 'done' : ''} aria-label={`${c}장${done ? ' (읽음)' : ''}`}>
                <span className="num">{c}</span>
              </Link>
            </li>
          )
        })}
      </ol>
      {complete && (
        <button className="btn primary btn-block" onClick={() => setOpen(true)}>
          🖼 {book.name} 그림 열기
        </button>
      )}
      {open && (
        <div className="sheet-backdrop" role="dialog" aria-label={`${book.name} 그림`} onClick={() => setOpen(false)}>
          <figure className="book-figure" onClick={(e) => e.stopPropagation()}>
            <img src={image} alt={`${book.name} 대표 그림`} />
            <figcaption>
              {book.name} · {book.chapters}장 완독
            </figcaption>
            <button className="btn btn-block" onClick={() => setOpen(false)}>
              닫기
            </button>
          </figure>
        </div>
      )}
    </main>
  )
}
