import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useProgress, selectTotalProgress } from '../../store/progress'
import { ALL_REFS, getBook, parseRef } from '../../content/books'
import { getChapter } from '../../content/bible'
import { sortedBookmarks, verseText } from '../reader/BookmarkList'
import '../reader/reader.css'
import '../cards/cards.css'
import './finale.css'

/** 마지막에 보여 줄 가장 큰 계명: 마태복음 22:37–40 */
const COMMANDMENT = { bookId: 'mat', chapter: 22, from: 37, to: 40 }

const refOrder = new Map(ALL_REFS.map((r, i) => [r, i]))

type Step = 'bookmarks' | 'notes' | 'commandment'

/** 완독 직후 장면: 책갈피 → 묵상 → 가장 큰 계명. 비어 있는 단계는 건너뛴다 */
export function FinaleView() {
  const readChapters = useProgress((s) => s.readChapters)
  const notes = useProgress((s) => s.notes)
  const bookmarks = useProgress((s) => s.bookmarks)
  const total = selectTotalProgress({ readChapters })

  const marks = sortedBookmarks(bookmarks)
  const noteList = Object.entries(notes)
    .filter(([ref, t]) => t.trim() && refOrder.has(ref))
    .sort(([a], [b]) => refOrder.get(a)! - refOrder.get(b)!)

  const steps: Step[] = [...(marks.length ? ['bookmarks' as const] : []), ...(noteList.length ? ['notes' as const] : []), 'commandment']
  const [i, setI] = useState(0)

  if (total.read < total.total) return <Navigate to="/complete" replace />

  const step = steps[i]
  const c = COMMANDMENT
  const verses = getChapter(c.bookId, c.chapter).slice(c.from - 1, c.to)

  return (
    <main className="reader finale">
      <AnimatePresence mode="wait">
        <motion.section key={step} className="finale-step" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
          {step === 'bookmarks' && (
            <>
              <h1 className="finale-title">붙잡은 말씀</h1>
              <ul className="bookmark-list finale-list">
                {marks.map((b) => (
                  <li key={b.key}>
                    <div>
                      <span style={{ color: 'var(--gold)' }}>
                        {getBook(b.bookId).name} {b.chapter}:{b.verse}
                      </span>
                      <div className="finale-quote">{verseText(b.bookId, b.chapter, b.verse)}</div>
                      {b.memo && <div className="memo">{b.memo}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {step === 'notes' && (
            <>
              <h1 className="finale-title">남긴 묵상</h1>
              <ul className="relation-list finale-list">
                {noteList.map(([ref, text]) => {
                  const { bookId, chapter } = parseRef(ref)
                  return (
                    <li key={ref}>
                      <span style={{ color: 'var(--gold)' }}>
                        {getBook(bookId).name} {chapter}장
                      </span>
                      <div className="finale-note">{text}</div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
          {step === 'commandment' && (
            <div className="finale-commandment">
              {verses.map((v, k) => (
                <motion.p key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + k * 1.4, duration: 1.2 }}>
                  {v}
                </motion.p>
              ))}
              <motion.cite initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + verses.length * 1.4, duration: 1 }}>
                {getBook(c.bookId).name} {c.chapter}:{c.from}–{c.to}
              </motion.cite>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
      <footer className="finale-foot">
        {i < steps.length - 1 ? (
          <button className="btn primary btn-block" onClick={() => setI(i + 1)}>
            다음
          </button>
        ) : (
          <Link className="btn btn-block" to="/">
            마치기
          </Link>
        )}
      </footer>
    </main>
  )
}
