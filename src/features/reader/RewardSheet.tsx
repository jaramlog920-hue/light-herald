import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { cardsForRef } from '../cards/resolveCards'
import { missionsForRef } from '../missions/grade'
import { CardFace } from '../cards/CardFace'
import { NoteBox } from './NoteBox'
import '../cards/cards.css'

interface Props {
  refId: string
  nextTo: string | null
  onClose: () => void
}

/** "읽음" 직후 나타나는 보상 시트: 획득 카드 + 묵상 입력 */
export function RewardSheet({ refId, nextTo, onClose }: Props) {
  const cards = cardsForRef(refId)
  const missions = missionsForRef(refId)
  const needMission = missions.length > 0
  return (
    <div className="sheet-backdrop" role="dialog" aria-label="기억의 조각 획득" onClick={onClose}>
      <motion.div
        className="sheet"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{needMission ? '기억의 조각을 발견했습니다' : '기억의 조각을 되찾았습니다'}</h2>
        {needMission && <p className="muted" style={{ textAlign: 'center' }}>미션을 모두 완료하면 카드가 복원됩니다.</p>}
        <div className="card-grid">
          {cards.map((c, i) => (
            <motion.div key={c.id} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.12 }}>
              <CardFace card={c} earned={!needMission} />
            </motion.div>
          ))}
        </div>
        <NoteBox refId={refId} />
        {missions.map((m) => (
          <Link key={m.id} className="btn mission-cta" to={`/missions/${m.id}`}>
            미션 해금: {m.title}
          </Link>
        ))}
        <div className="sheet-actions">
          <Link className="btn" to="/">
            지도 보기
          </Link>
          {nextTo ? (
            <Link className="btn primary" to={nextTo}>
              다음 장 →
            </Link>
          ) : (
            <Link className="btn primary" to="/complete">
              완주 보기
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  )
}
