import { AppRoutes } from './routes'
import { MapView } from '../features/map/MapView'

export function App() {
  return <AppRoutes home={<MapView />} />
}
