import cardsJson from '../../content/cards.json'
import peopleJson from '../../content/people.json'
import { getBook, parseRef } from '../../content/books'
import type { Card, PeopleData, Person } from '../../content/types'
import { missionsForRef } from '../missions/grade'

export const CARDS: Card[] = cardsJson as Card[]
export const PEOPLE: PeopleData = peopleJson as PeopleData

const cardsByRef = new Map<string, Card[]>()
for (const c of CARDS) cardsByRef.set(c.ref, [...(cardsByRef.get(c.ref) ?? []), c])
const cardById = new Map(CARDS.map((c) => [c.id, c]))
const personById = new Map(PEOPLE.persons.map((p) => [p.id, p]))

/** 카드가 없는 장에 주는 기본 카드 */
export function lampCard(ref: string): Card {
  const { bookId, chapter } = parseRef(ref)
  return {
    id: `lamp:${ref}`,
    ref,
    type: 'word',
    title: '말씀의 등불',
    summary: `${getBook(bookId).name} ${chapter}장을 읽고 밝힌 등불.`,
    verseRef: `${getBook(bookId).abbr} ${chapter}장`,
  }
}

export function cardsForRef(ref: string): Card[] {
  return cardsByRef.get(ref) ?? [lampCard(ref)]
}

export function getCard(id: string): Card | undefined {
  return cardById.get(id) ?? (id.startsWith('lamp:') ? lampCard(id.slice(5)) : undefined)
}

export function getPerson(id: string): Person | undefined {
  return personById.get(id)
}

export interface EarnedCard {
  card: Card
  earnedAt: string
}

type MissionRecords = Record<string, { clearedAt: string }>

/** 카드 복원 조건: 그 장의 미션을 전부 완료. 미션이 없는 장은 읽기만으로 */
export function isCardUnlocked(ref: string, readChapters: Record<string, string>, missions: MissionRecords): boolean {
  const ms = missionsForRef(ref)
  if (ms.length === 0) return Boolean(readChapters[ref])
  return ms.every((m) => missions[m.id])
}

/** 복원 시각: 마지막 미션 완료 시각, 미션 없는 장은 읽은 시각 */
export function unlockedAt(ref: string, readChapters: Record<string, string>, missions: MissionRecords): string | undefined {
  if (!isCardUnlocked(ref, readChapters, missions)) return undefined
  const times = missionsForRef(ref).map((m) => missions[m.id]?.clearedAt).filter(Boolean) as string[]
  return times.length ? times.sort().at(-1) : readChapters[ref]
}

/** 복원된 카드 목록 (성경 순서, 등불 폴백 포함) */
export function resolveCards(readChapters: Record<string, string>, missions: MissionRecords): EarnedCard[] {
  const refs = new Set([...Object.keys(readChapters), ...Object.keys(missions).map((id) => id.split(':').slice(0, 2).join(':'))])
  return [...refs]
    .filter((ref) => isCardUnlocked(ref, readChapters, missions))
    .sort((a, b) => refOrder(a) - refOrder(b))
    .flatMap((ref) => cardsForRef(ref).map((card) => ({ card, earnedAt: unlockedAt(ref, readChapters, missions)! })))
}

export function earnedPersonIds(readChapters: Record<string, string>, missions: MissionRecords): Set<string> {
  const ids = new Set<string>()
  const refs = new Set([...Object.keys(readChapters), ...Object.keys(missions).map((id) => id.split(':').slice(0, 2).join(':'))])
  for (const ref of refs) {
    if (!isCardUnlocked(ref, readChapters, missions)) continue
    for (const c of cardsByRef.get(ref) ?? []) if (c.personId) ids.add(c.personId)
  }
  return ids
}

/** 전체 카드 수(등불 제외) — 카드장 진행률용 */
export const TOTAL_CARDS = CARDS.length

import { BOOKS } from '../../content/books'
const bookIndex = new Map(BOOKS.map((b, i) => [b.id, i]))
function refOrder(ref: string): number {
  const { bookId, chapter } = parseRef(ref)
  return (bookIndex.get(bookId) ?? 99) * 1000 + chapter
}
