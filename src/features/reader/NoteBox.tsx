import { useEffect, useState } from 'react'
import { useProgress } from '../../store/progress'
import '../cards/cards.css'

/** 장 단위 묵상 한 줄. 입력 후 잠시 뒤 자동 저장 */
export function NoteBox({ refId }: { refId: string }) {
  const saved = useProgress((s) => s.notes[refId] ?? '')
  const saveNote = useProgress((s) => s.saveNote)
  const [text, setText] = useState(saved)
  useEffect(() => setText(saved), [saved, refId])
  useEffect(() => {
    if (text === saved) return
    const t = setTimeout(() => saveNote(refId, text.trim()), 400)
    return () => clearTimeout(t)
  }, [text, saved, refId, saveNote])
  return (
    <div className="note-box">
      <label htmlFor={`note-${refId}`}>묵상 한 줄 (선택)</label>
      <textarea
        id={`note-${refId}`}
        value={text}
        maxLength={200}
        placeholder="이 장에서 마음에 남은 것을 한 줄로…"
        onChange={(e) => setText(e.target.value)}
      />
      {saved && text === saved && <div className="note-saved">저장됨</div>}
    </div>
  )
}
