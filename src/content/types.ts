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
  /** 이름표를 점 기준 어느 쪽에 둘지 (겹침 방지). 기본은 위 */
  label?: 'top' | 'bottom' | 'left' | 'right'
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

export type CardType = 'event' | 'person' | 'word'

export interface Card {
  id: string
  ref: string
  type: CardType
  title: string
  summary: string
  verseRef: string
  /** person 카드일 때 people.json의 인물 id */
  personId?: string
}

export interface Person {
  id: string
  name: string
  role: string
}

export interface Relation {
  from: string
  to: string
  label: string
}

export interface PeopleData {
  persons: Person[]
  relations: Relation[]
}

export type MissionType = 'quiz' | 'gospel-detective' | 'voyage' | 'deliver' | 'word-puzzle' | 'choice' | 'blank'

export interface MissionBase {
  id: string
  ref: string
  type: MissionType
  title: string
  /** 보석 1개로 볼 수 있는 단서 */
  hint: string
  /** 오답 시 다시 볼 본문 절 */
  hintVerse: string
}
export interface QuizMission extends MissionBase {
  type: 'quiz'
  question: string
  options: string[]
  answer: number
}
export interface GospelDetectiveMission extends MissionBase {
  type: 'gospel-detective'
  event: string
  /** 이 사건이 기록된 복음서 id 목록 */
  answer: string[]
}
export interface VoyageMission extends MissionBase {
  type: 'voyage'
  prompt: string
  /** 올바른 방문 순서의 도시 id */
  order: string[]
}
export interface DeliverMission extends MissionBase {
  type: 'deliver'
  letter: string
  target: string
  options: string[]
}
export interface WordPuzzleMission extends MissionBase {
  type: 'word-puzzle'
  verseRef: string
  words: string[]
}
export interface ChoiceMission extends MissionBase {
  type: 'choice'
  situation: string
  options: { text: string; right: boolean; feedback: string }[]
}
export interface BlankMission extends MissionBase {
  type: 'blank'
  verseRef: string
  /** 빈칸은 '____' */
  text: string
  options: string[]
  answer: number
}
export type Mission = QuizMission | GospelDetectiveMission | VoyageMission | DeliverMission | WordPuzzleMission | ChoiceMission | BlankMission
