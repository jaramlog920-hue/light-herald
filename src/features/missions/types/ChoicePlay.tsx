import { useState } from 'react'
import type { ChoiceMission } from '../../../content/types'
import type { PlayProps } from '../MissionPlay'

export function ChoicePlay({ mission, submit, locked }: PlayProps<ChoiceMission>) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <div>
      <p className="mission-q">{mission.situation}</p>
      <ul className="option-list">
        {mission.options.map((o, i) => (
          <li key={i}>
            <button
              className={`option ${picked === i ? (o.right ? 'is-right' : 'is-wrong') : ''}`}
              disabled={locked || picked !== null}
              onClick={() => {
                setPicked(i)
                submit({ type: 'choice', index: i })
              }}
            >
              {o.text}
            </button>
            {picked === i && <p className="feedback">{o.feedback}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
