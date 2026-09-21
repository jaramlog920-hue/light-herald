import type { DeliverMission } from '../../../content/types'
import type { PlayProps } from '../MissionPlay'
import { getBook } from '../../../content/books'
import { cityName } from '../cityName'

export function DeliverPlay({ mission, submit, locked }: PlayProps<DeliverMission>) {
  return (
    <div>
      <p className="mission-q">✉ {getBook(mission.letter).name}를 어느 도시의 교회에 전달할까요?</p>
      <ul className="option-list">
        {mission.options.map((c) => (
          <li key={c}>
            <button className="option" disabled={locked} onClick={() => submit({ type: 'deliver', city: c })}>
              {cityName(c)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
