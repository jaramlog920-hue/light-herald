import { useEffect, useRef, useState } from 'react'
import { useProgress } from '../../store/progress'
import '../cards/cards.css'

/** 장 단위 묵상 한 줄. 입력 후 잠시 뒤 자동 저장하고, 화면을 벗어날 때도 저장한다 */
export function NoteBox({ refId }: { refId: string }) {
  const saved = useProgress((s) => s.notes[refId] ?? '')
  const saveNote = useProgress((s) => s.saveNote)
  const [text, setText] = useState(saved)
  // 자동 저장 전에 화면을 벗어나도 잃지 않도록 마지막 값을 들고 있는다
  const pending = useRef({ refId, text, saved })
  pending.current = { refId, text, saved }

  useEffect(() => setText(saved), [saved, refId])
  useEffect(() => {
    if (text === saved) return
    const t = setTimeout(() => saveNote(refId, text.trim()), 400)
    return () => clearTimeout(t)
  }, [text, saved, refId, saveNote])
  useEffect(
    () => () => {
      const p = pending.current
      if (p.text !== p.saved) saveNote(p.refId, p.text.trim())
    },
    [saveNote],
  )

  return (
    <div className="note-box">
      <label htmlFor={`note-${refId}`}>묵상 한 줄 (선택)</label>
      <textarea
        id={`note-${refId}`}
        value={text}
        maxLength={200}
        placeholder="이 장에서 마음에 남은 것을 한 줄로…"
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text !== saved && saveNote(refId, text.trim())}
      />
      {saved && text === saved && <div className="note-saved">저장됨</div>}
    </div>
  )
}
