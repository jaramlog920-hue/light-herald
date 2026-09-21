import type { Card } from '../../content/types'
import './cards.css'

const TYPE_LABEL = { event: '사건 기록', person: '인물 인장', word: '말씀 조각' } as const
const TYPE_ICON = { event: '✦', person: '⚜', word: '❝' } as const

export function CardFace({ card, earned = true, compact = false }: { card: Card; earned?: boolean; compact?: boolean }) {
  return (
    <div className={`card card-${card.type} ${earned ? '' : 'card-locked'} ${compact ? 'card-compact' : ''}`} data-testid="card">
      <div className="card-type">
        <span className="card-icon" aria-hidden>
          {TYPE_ICON[card.type]}
        </span>
        {TYPE_LABEL[card.type]}
      </div>
      <h3 className="card-title">{earned ? card.title : '???'}</h3>
      {!compact && <p className="card-summary">{earned ? card.summary : '이 장을 읽으면 기록이 복원됩니다.'}</p>}
      <div className="card-ref">{card.verseRef}</div>
    </div>
  )
}
