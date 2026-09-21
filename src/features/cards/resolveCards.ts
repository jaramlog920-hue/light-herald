import cardsJson from '../../content/cards.json'
import peopleJson from '../../content/people.json'
import { getBook, parseRef } from '../../content/books'
import type { Card, PeopleData, Person } from '../../content/types'

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

/** 읽은 장에서 파생되는 획득 카드 목록 (성경 순서, 등불 폴백 포함) */
export function resolveCards(readChapters: Record<string, string>): EarnedCard[] {
  return Object.entries(readChapters)
    .sort(([a], [b]) => refOrder(a) - refOrder(b))
    .flatMap(([ref, earnedAt]) => cardsForRef(ref).map((card) => ({ card, earnedAt })))
}

export function earnedPersonIds(readChapters: Record<string, string>): Set<string> {
  const ids = new Set<string>()
  for (const ref of Object.keys(readChapters)) {
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
