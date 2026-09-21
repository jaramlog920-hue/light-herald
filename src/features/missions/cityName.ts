import map from '../../content/map.json'
import type { MapData } from '../../content/types'

const names = new Map((map as MapData).cities.map((c) => [c.id, c.name]))

export function cityName(id: string): string {
  return names.get(id) ?? id
}
