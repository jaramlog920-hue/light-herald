export type BookGroup = 'gospel' | 'acts' | 'pauline' | 'general' | 'revelation'

export interface Book {
  id: string
  code: string
  name: string
  abbr: string
  chapters: number
  group: BookGroup
}

export interface MapCity {
  id: string
  name: string
  x: number
  y: number
}

export interface MapRoute {
  id: string
  name: string
  path: string[]
}

export interface MapData {
  cities: MapCity[]
  routes: MapRoute[]
}

export type MapRule =
  | { when: { ref: string }; effect: 'footprint'; at: string }
  | { when: { ref: string }; effect: 'spread'; from: string; to: string }
  | { when: { bookComplete: string }; effect: 'church'; at: string; label: string }
  | { when: { bookComplete: string }; effect: 'new-jerusalem' }
