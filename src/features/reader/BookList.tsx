import { Link } from 'react-router'
import { BOOKS } from '../../content/books'
import type { BookGroup } from '../../content/types'
import { useProgress, selectBookProgress, selectTotalProgress } from '../../store/progress'
import { ProgressBar } from '../../shared/ProgressBar'
import './reader.css'

const GROUP_LABEL: Record<BookGroup, string> = {
  gospel: '복음서',
  acts: '역사서',
  pauline: '바울서신',
  general: '공동서신',
  revelation: '예언서',
}

export function BookList() {
  const readChapters = useProgress((s) => s.readChapters)
  const total = selectTotalProgress({ readChapters })
  const groups = Array.from(new Set(BOOKS.map((b) => b.group)))
  return (
    <main className="reader">
      <header className="reader-head">
        <Link to="/" className="back">
          ← 지도
        </Link>
        <h1>신약 (개역한글)</h1>
        <ProgressBar {...total} />
      </header>
      {groups.map((g) => (
        <section key={g}>
          <h2>{GROUP_LABEL[g]}</h2>
          <ul className="book-list">
            {BOOKS.filter((b) => b.group === g).map((b) => {
              const p = selectBookProgress({ readChapters }, b.id)
              return (
                <li key={b.id}>
                  <Link to={`/books/${b.id}`} className={p.read === p.total ? 'done' : ''}>
                    <span>{b.name}</span>
                    <small>
                      {p.read}/{p.total}
                    </small>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </main>
  )
}
