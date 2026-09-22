import { useEffect } from 'react'
import { AppRoutes } from './routes'
import { MapView } from '../features/map/MapView'
import { useProgress } from '../store/progress'
import { MAX_CYCLE_THEME } from '../features/cycles/cycles'

export function App() {
  const cycle = useProgress((s) => s.cycle)
  // 회독마다 지도·강조색 테마가 바뀐다 (global.css의 [data-cycle])
  useEffect(() => {
    document.documentElement.dataset.cycle = String(Math.min(cycle, MAX_CYCLE_THEME))
  }, [cycle])
  return <AppRoutes home={<MapView />} />
}
