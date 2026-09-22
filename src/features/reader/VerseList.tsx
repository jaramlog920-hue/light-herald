import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useProgress, bookmarkKey } from '../../store/progress'
import { BookmarkSheet } from './BookmarkSheet'

const LONG_PRESS_MS = 500

/** 장 본문. 구절을 길게 누르면 북마크, 북마크된 구절은 표시가 붙고 탭하면 편집 */
export function VerseList({ refId, verses }: { refId: string; verses: string[] }) {
  const bookmarks = useProgress((s) => s.bookmarks)
  const [editing, setEditing] = useState<number | null>(null)
  const [params, setParams] = useSearchParams()
  const timer = useRef<number | null>(null)
  const pressed = useRef<number | null>(null)

  // /read/jhn/3?v=16 로 들어오면 그 구절로 이동해 잠시 강조
  const target = Number(params.get('v'))
  const [flash, setFlash] = useState<number | null>(null)
  useEffect(() => {
    if (!target) return
    const el = document.getElementById(`v-${target}`)
    if (!el) return
    el.scrollIntoView?.({ block: 'center' })
    setFlash(target)
    const t = setTimeout(() => {
      setFlash(null)
      setParams({}, { replace: true })
    }, 2000)
    return () => clearTimeout(t)
  }, [target, refId, setParams])

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    pressed.current = null
  }
  const start = (verse: number) => {
    cancel()
    pressed.current = verse
    timer.current = window.setTimeout(() => {
      timer.current = null
      if (pressed.current === verse) setEditing(verse)
      pressed.current = null
    }, LONG_PRESS_MS)
  }

  return (
    <>
      <article className="verses" onContextMenu={(e) => e.preventDefault()}>
        {verses.map((v, i) => {
          const n = i + 1
          const marked = Boolean(bookmarks[bookmarkKey(refId, n)])
          return (
            <p
              key={n}
              id={`v-${n}`}
              className={[marked ? 'bookmarked' : '', flash === n ? 'flash' : ''].join(' ').trim() || undefined}
              data-verse={n}
              onPointerDown={() => start(n)}
              onPointerUp={cancel}
              onPointerCancel={cancel}
              onPointerLeave={cancel}
              onPointerMove={(e) => {
                // 스크롤 중 오작동 방지: 손가락이 움직이면 취소
                if (e.pointerType === 'touch' && timer.current) cancel()
              }}
            >
              <sup>{n}</sup>
              {marked && (
                <button type="button" className="bookmark-mark" aria-label={`${n}절 북마크 편집`} onClick={() => setEditing(n)}>
                  🔖
                </button>
              )}
              {v}
            </p>
          )
        })}
      </article>
      {editing !== null && <BookmarkSheet refId={refId} verse={editing} text={verses[editing - 1]} onClose={() => setEditing(null)} />}
    </>
  )
}
