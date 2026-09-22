import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProgress, bookmarkKey, MAX_BOOKMARKS } from '../../store/progress'
import { getBook, parseRef } from '../../content/books'
import '../cards/cards.css'

interface Props {
  refId: string
  verse: number
  text: string
  onClose: () => void
}

/** 구절을 길게 눌렀을 때 뜨는 북마크 편집 시트 */
export function BookmarkSheet({ refId, verse, text, onClose }: Props) {
  const key = bookmarkKey(refId, verse)
  const existing = useProgress((s) => s.bookmarks[key])
  const setBookmark = useProgress((s) => s.setBookmark)
  const removeBookmark = useProgress((s) => s.removeBookmark)
  const count = useProgress((s) => Object.keys(s.bookmarks).length)
  const full = !existing && count >= MAX_BOOKMARKS
  const [memo, setMemo] = useState(existing?.memo ?? '')
  const { bookId, chapter } = parseRef(refId)
  const label = `${getBook(bookId).name} ${chapter}:${verse}`

  const onSave = () => {
    if (setBookmark(refId, verse, memo.trim())) onClose()
  }
  const onRemove = () => {
    removeBookmark(key)
    onClose()
  }

  return (
    <div className="sheet-backdrop" role="dialog" aria-label={`북마크 ${label}`} onClick={onClose}>
      <motion.div
        className="sheet"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>🔖 {label}</h2>
        <blockquote className="bookmark-quote">{text}</blockquote>
        <div className="note-box">
          <label htmlFor="bookmark-memo">메모 (선택)</label>
          <textarea
            id="bookmark-memo"
            value={memo}
            maxLength={300}
            autoFocus
            placeholder="이 구절에 남길 메모…"
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
        <p className="muted bookmark-count" role="status">
          {full ? `북마크가 가득 찼습니다 (${MAX_BOOKMARKS}개). 회독 화면에서 정리해 주세요.` : `북마크 ${count}/${MAX_BOOKMARKS}`}
        </p>
        <div className="sheet-actions">
          {existing && (
            <button className="btn" onClick={onRemove}>
              북마크 삭제
            </button>
          )}
          <button className="btn" onClick={onClose}>
            취소
          </button>
          <button className="btn primary" onClick={onSave} disabled={full}>
            {existing ? '저장' : '북마크'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
