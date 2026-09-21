import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { motion } from 'framer-motion'
import { getMission, grade, rewardsGem, type Answer } from './grade'
import { useProgress } from '../../store/progress'
import { getBook, parseRef } from '../../content/books'
import type { Mission } from '../../content/types'
import { QuizPlay } from './types/QuizPlay'
import { GospelDetectivePlay } from './types/GospelDetectivePlay'
import { VoyagePlay } from './types/VoyagePlay'
import { DeliverPlay } from './types/DeliverPlay'
import { WordPuzzlePlay } from './types/WordPuzzlePlay'
import { ChoicePlay } from './types/ChoicePlay'
import '../reader/reader.css'
import '../cards/cards.css'
import './missions.css'

export interface PlayProps<M extends Mission> {
  mission: M
  /** 답을 제출하면 채점 결과를 돌려준다 */
  submit: (answer: Answer) => boolean
  locked: boolean
}

export function MissionPlay() {
  const { missionId = '' } = useParams()
  const mission = getMission(missionId)
  const read = useProgress((s) => (mission ? s.readChapters[mission.ref] : undefined))
  const record = useProgress((s) => s.missions[missionId])
  const gems = useProgress((s) => s.gems)
  const clearMission = useProgress((s) => s.clearMission)
  const addGem = useProgress((s) => s.addGem)
  const spendGem = useProgress((s) => s.spendGem)
  const [result, setResult] = useState<'idle' | 'right' | 'wrong'>('idle')
  const [hintShown, setHintShown] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [attempt, setAttempt] = useState(0)

  if (!mission) {
    return (
      <main className="reader">
        <p>미션을 찾을 수 없습니다.</p>
        <Link className="btn btn-block" to="/missions">
          미션 목록
        </Link>
      </main>
    )
  }
  const { bookId, chapter } = parseRef(mission.ref)
  const book = getBook(bookId)

  if (!read) {
    return (
      <main className="reader">
        <header className="reader-head">
          <Link to="/missions" className="back">
            ← 미션
          </Link>
          <h1>{mission.title}</h1>
        </header>
        <p className="muted">
          이 미션은 {book.name} {chapter}장을 읽으면 열립니다.
        </p>
        <Link className="btn primary btn-block" to={`/read/${bookId}/${chapter}`}>
          {book.name} {chapter}장 읽기
        </Link>
      </main>
    )
  }

  const cleared = Boolean(record) || result === 'right'
  const submit = (answer: Answer) => {
    const ok = grade(mission, answer)
    if (ok) {
      if (!record) {
        clearMission(mission.id, hintsUsed)
        if (rewardsGem(mission)) addGem()
      }
      setResult('right')
    } else {
      setResult('wrong')
    }
    return ok
  }
  const retry = () => {
    setResult('idle')
    setAttempt((n) => n + 1)
  }
  const showHint = () => {
    if (hintShown) return
    if (spendGem()) {
      setHintShown(true)
      setHintsUsed((n) => n + 1)
    }
  }

  const play = { submit, locked: cleared }
  return (
    <main className="reader mission">
      <header className="reader-head">
        <Link to="/missions" className="back">
          ← 미션
        </Link>
        <h1>{mission.title}</h1>
        <p className="muted">
          {book.name} {chapter}장 · 보석 {gems}개
        </p>
      </header>

      <section className="mission-body" key={attempt}>
        {mission.type === 'quiz' && <QuizPlay mission={mission} {...play} />}
        {mission.type === 'gospel-detective' && <GospelDetectivePlay mission={mission} {...play} />}
        {mission.type === 'voyage' && <VoyagePlay mission={mission} {...play} />}
        {mission.type === 'deliver' && <DeliverPlay mission={mission} {...play} />}
        {mission.type === 'word-puzzle' && <WordPuzzlePlay mission={mission} {...play} />}
        {mission.type === 'choice' && <ChoicePlay mission={mission} {...play} />}
      </section>

      {hintShown && (
        <div className="hint-box" role="note">
          💎 단서: {mission.hint}
        </div>
      )}

      {result === 'right' && (
        <motion.div className="result right" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} role="status">
          <strong>기록이 복원되었습니다.</strong>
          {rewardsGem(mission) && !record?.clearedAt && <div>약속의 보석을 얻었습니다 💎</div>}
          {record && <div className="muted">완료 {record.clearedAt.slice(0, 10)}</div>}
        </motion.div>
      )}
      {result === 'wrong' && (
        <div className="result wrong" role="status">
          <strong>조금 다릅니다.</strong> 본문을 다시 보면 실마리가 있어요 — {mission.hintVerse}
        </div>
      )}

      <footer className="reader-foot">
        {result === 'wrong' && (
          <button className="btn primary" onClick={retry}>
            다시 도전
          </button>
        )}
        {!cleared && !hintShown && (
          <button className="btn" onClick={showHint} disabled={gems <= 0} title={gems <= 0 ? '암송 미션으로 보석을 얻으세요' : ''}>
            힌트 (💎1)
          </button>
        )}
        <Link className="btn ghost" to={`/read/${bookId}/${chapter}`}>
          본문
        </Link>
        {cleared && (
          <Link className="btn primary" to="/missions">
            미션 목록
          </Link>
        )}
      </footer>
    </main>
  )
}
