import type { BlankMission } from '../../../content/types'
import type { PlayProps } from '../MissionPlay'

/** 구절의 빈칸에 들어갈 단어 고르기 */
export function BlankPlay({ mission, submit, locked }: PlayProps<BlankMission>) {
  const [before, after] = mission.text.split('____')
  return (
    <div>
      <p className="mission-q">
        {before}
        <span className="blank">____</span>
        {after}
      </p>
      <p className="muted">{mission.verseRef}</p>
      <div className="chip-row">
        {mission.options.map((o, i) => (
          <button key={i} className="chip" disabled={locked} onClick={() => submit({ type: 'blank', index: i })}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
