import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useProgress, selectTotalProgress, exportState, type PersistedShape } from '../../store/progress'
import { cycleTitle } from './cycles'
import { APP_TITLE } from '../../app/branding'
import { BookmarkList } from '../reader/BookmarkList'
import '../reader/reader.css'
import '../cards/cards.css'

export function CyclesView() {
  const state = useProgress()
  const total = selectTotalProgress(state)
  const complete = total.read === total.total
  const [msg, setMsg] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const onExport = () => {
    const blob = new Blob([JSON.stringify(exportState(state), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${APP_TITLE}-백업-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<PersistedShape>
      if (!parsed || typeof parsed !== 'object' || (parsed.readChapters && typeof parsed.readChapters !== 'object')) {
        throw new Error('형식')
      }
      state.importState(parsed)
      setMsg(`가져왔습니다. 읽은 장 ${Object.keys(parsed.readChapters ?? {}).length}개를 병합했습니다.`)
    } catch {
      setMsg('백업 파일을 읽을 수 없습니다.')
    }
  }

  const onNext = () => {
    if (state.startNextCycle()) {
      setConfirming(false)
      setMsg(`${cycleTitle(state.cycle + 1)}의 길이 시작되었습니다.`)
    }
  }

  return (
    <main className="reader">
      <header className="reader-head">
        <Link to="/" className="back">
          ← 지도
        </Link>
        <h1>회독</h1>
      </header>

      <section>
        <h2>현재</h2>
        <div className="cycle-card current">
          <strong>
            {state.cycle}회차 · {cycleTitle(state.cycle)}
          </strong>
          <div className="muted">
            {total.read}/{total.total}장 · 묵상 {Object.values(state.notes).filter((t) => t.trim()).length}개 ·{' '}
            <Link to="/notes" style={{ color: 'var(--gold)' }}>
              모아보기 →
            </Link>
          </div>
        </div>
        {complete ? (
          confirming ? (
            <div className="sheet-actions">
              <button className="btn" onClick={() => setConfirming(false)}>
                취소
              </button>
              <button className="btn primary" onClick={onNext}>
                {state.cycle + 1}회차 시작
              </button>
            </div>
          ) : (
            <button className="btn primary" style={{ width: '100%' }} onClick={() => setConfirming(true)}>
              다음 회독 시작 — {cycleTitle(state.cycle + 1)}
            </button>
          )
        ) : (
          <p className="muted">27권을 모두 읽으면 다음 회독을 시작할 수 있습니다. 이전 기록은 보존됩니다.</p>
        )}
        {confirming && <p className="muted">읽은 장 기록이 새 회독으로 넘어가며 지금 기록은 아래 목록에 보관됩니다.</p>}
      </section>

      <section>
        <h2>북마크 · {Object.keys(state.bookmarks).length}개</h2>
        <p className="muted">회독이 바뀌어도 북마크는 그대로 남습니다. 눌러서 구절로 바로 갑니다.</p>
        <BookmarkList />
      </section>

      {state.history.length > 0 && (
        <section>
          <h2>지난 회독</h2>
          <ul className="relation-list">
            {state.history.map((h) => {
              const dates = Object.values(h.readChapters).sort()
              return (
                <li key={h.cycle}>
                  <strong>
                    {h.cycle}회차 · {cycleTitle(h.cycle)}
                  </strong>
                  <div className="muted">
                    {dates[0]?.slice(0, 10)} ~ {h.completedAt.slice(0, 10)} · 묵상 {Object.values(h.notes).filter((t) => t.trim()).length}개
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <h2>백업</h2>
        <div className="sheet-actions">
          <button className="btn" onClick={onExport}>
            JSON 내보내기
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            JSON 가져오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            aria-label="백업 파일"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onImportFile(f)
              e.target.value = ''
            }}
          />
        </div>
        <p className="muted">가져오기는 병합됩니다: 읽은 장은 합쳐지고, 같은 장의 묵상은 가져온 쪽이 남습니다.</p>
        {msg && <p role="status">{msg}</p>}
      </section>
    </main>
  )
}
