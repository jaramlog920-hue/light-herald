import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import mapJson from '../../content/map.json'
import type { MapData } from '../../content/types'
import { useProgress, selectTotalProgress } from '../../store/progress'
import { useMapState } from './useMapState'
import { CityLayer } from './layers/CityLayer'
import { SpreadLayer } from './layers/SpreadLayer'
import { FootprintLayer } from './layers/FootprintLayer'
import { ChurchLayer } from './layers/ChurchLayer'
import { NewJerusalemLayer } from './layers/NewJerusalemLayer'
import { ProgressBar } from '../../shared/ProgressBar'
import { CityPanel } from './CityPanel'
import { APP_TITLE } from '../../app/branding'
import { cycleTitle } from '../cycles/cycles'
import './map.css'

const MAP = mapJson as MapData
const CITIES = new Map(MAP.cities.map((c) => [c.id, c]))

export function MapView() {
  const { state, newRefs } = useMapState()
  const isNew = (ref: string) => newRefs.has(ref)
  const lastRef = useProgress((s) => s.lastRef)
  const cycle = useProgress((s) => s.cycle)
  const readChapters = useProgress((s) => s.readChapters)
  const total = selectTotalProgress({ readChapters })
  const scroller = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const complete = total.read === total.total
  const layer = { state, cities: CITIES, isNew }
  const [lb, lc] = (lastRef ?? 'mat:1').split(':')

  // 처음 열면 예루살렘(오른쪽)이 보이도록
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth - el.clientWidth
  }, [])

  return (
    <main className="map-screen">
      <div className="map-scroller" ref={scroller}>
        <div className="map-canvas">
          <img src="/assets/map-bg.webp" alt="" className="map-bg" draggable={false} />
          <svg viewBox="0 0 1536 1024" className="map-svg" aria-label="신약 지도">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <SpreadLayer {...layer} />
            <FootprintLayer {...layer} />
            <CityLayer {...layer} onSelect={setSelected} />
            <ChurchLayer {...layer} />
            <NewJerusalemLayer {...layer} />
          </svg>
        </div>
      </div>
      <img src="/assets/herald.png" alt="" className="map-herald" draggable={false} />
      <header className="map-hud">
        <h1>{APP_TITLE}</h1>
        <Link to="/cycles" className="hud-cycle">
          {cycle}회차 · {cycleTitle(cycle)}
        </Link>
        <ProgressBar {...total} />
      </header>
      <footer className="map-actions">
        {complete ? (
          <Link className="btn primary" to="/complete">
            완주 보기
          </Link>
        ) : (
          <Link className="btn primary" to={`/read/${lb}/${lc}`}>
            {lastRef ? '이어 읽기' : '읽기 시작'}
          </Link>
        )}
        <Link className="btn" to="/books">
          책 목록
        </Link>
        <Link className="btn" to="/cards">
          카드장
        </Link>
        <Link className="btn" to="/missions">
          미션
        </Link>
      </footer>
      {selected && CITIES.get(selected) && <CityPanel city={CITIES.get(selected)!} state={state} onClose={() => setSelected(null)} />}
    </main>
  )
}
