import type { QuizMission } from '../../../content/types'
import type { PlayProps } from '../MissionPlay'

export function QuizPlay({ mission, submit, locked }: PlayProps<QuizMission>) {
  return (
    <div>
      <p className="mission-q">{mission.question}</p>
      <ul className="option-list">
        {mission.options.map((o, i) => (
          <li key={i}>
            <button className="option" disabled={locked} onClick={() => submit({ type: 'quiz', index: i })}>
              {o}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
