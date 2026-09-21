import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import mapJson from '../../content/map.json'
import type { MapData } from '../../content/types'
import { useProgress, selectTotalProgress } from '../../store/progress'
import { resolveMap } from '../map/resolveMap'
import { renderKeepsake } from './renderKeepsake'
import { getBook, parseRef } from '../../content/books'
import { APP_TITLE } from '../../app/branding'
import { cycleTitle } from '../cycles/cycles'
import '../reader/reader.css'
import '../cards/cards.css'

const MAP = mapJson as MapData

export function CompleteView() {
  const readChapters = useProgress((s) => s.readChapters)
  const notes = useProgress((s) => s.notes)
  const cycle = useProgress((s) => s.cycle)
  const total = selectTotalProgress({ readChapters })
  const complete = total.read === total.total
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [png, setPng] = useState<string | null>(null)

  useEffect(() => {
    if (!complete || !canvasRef.current) return
    const img = new Image()
    img.src = '/assets/map-bg.webp'
    img.onload = () => {
      const url = renderKeepsake(canvasRef.current!, {
        bg: img,
        cities: MAP.cities,
        state: resolveMap(new Set(Object.keys(readChapters))),
        notes,
        readChapters,
        title: APP_TITLE,
        cycleTitle: cycleTitle(cycle),
      })
      setPng(url)
    }
  }, [complete, readChapters, notes, cycle])

  if (!complete) {
    return (
      <main className="reader">
        <header className="reader-head">
          <Link to="/" className="back">
            ← 지도
          </Link>
          <h1>아직 길 위에 있습니다</h1>
        </header>
        <p>
          {total.read}/{total.total}장. 신약 27권을 모두 읽으면 이곳에 당신의 지도가 완성됩니다.
        </p>
        <Link className="btn primary" to="/books">
          계속 읽기
        </Link>
      </main>
    )
  }

  const noteList = Object.entries(notes).filter(([, t]) => t.trim())
  const dates = Object.values(readChapters).sort()

  return (
    <main className="reader complete">
      <header className="reader-head">
        <Link to="/" className="back">
          ← 지도
        </Link>
      </header>
      <motion.h1 className="complete-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
        복음은 예루살렘에서 시작되어,
        <br />
        당신의 오늘까지 왔습니다.
      </motion.h1>
      <p className="muted" style={{ textAlign: 'center' }}>
        {cycleTitle(cycle)} · {dates[0]?.slice(0, 10)} ~ {dates.at(-1)?.slice(0, 10)}
      </p>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {png && <img src={png} alt="나만의 신약 지도" className="keepsake" />}
      <div className="sheet-actions">
        {png && (
          <a className="btn primary" href={png} download={`${APP_TITLE}-${cycle}회차.png`}>
            지도 이미지 저장
          </a>
        )}
        <Link className="btn" to="/cycles">
          다음 회독
        </Link>
      </div>
      <section className="chapter-record">
        <h2>남긴 묵상 {noteList.length}개</h2>
        <ul className="relation-list">
          {noteList.map(([ref, text]) => {
            const { bookId, chapter } = parseRef(ref)
            return (
              <li key={ref}>
                <span style={{ color: 'var(--gold)' }}>
                  {getBook(bookId).abbr} {chapter}
                </span>{' '}
                {text} <span className="muted">{readChapters[ref]?.slice(0, 10)}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
