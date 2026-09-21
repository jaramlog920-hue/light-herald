import type { MapCity } from '../../../content/types'
import type { MapState } from '../resolveMap'

export interface LayerProps {
  state: MapState
  cities: Map<string, MapCity>
  /** 이 트리거 키가 이번 방문에서 처음 켜졌는지 */
  isNew: (ref: string) => boolean
}
