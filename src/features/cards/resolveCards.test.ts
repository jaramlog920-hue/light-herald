import { CARDS, PEOPLE, cardsForRef, getCard, resolveCards, earnedPersonIds, isCardUnlocked } from './resolveCards'
import { missionsForRef } from '../missions/grade'
import { ALL_REFS } from '../../content/books'

test('cards reference valid refs, unique ids, and known persons', () => {
  const refs = new Set(ALL_REFS)
  const persons = new Set(PEOPLE.persons.map((p) => p.id))
  const ids = new Set<string>()
  for (const c of CARDS) {
    expect(refs.has(c.ref)).toBe(true)
    expect(c.id.startsWith(c.ref + ':')).toBe(true)
    expect(ids.has(c.id)).toBe(false)
    ids.add(c.id)
    if (c.type === 'person') expect(c.personId && persons.has(c.personId)).toBe(true)
  }
})

test('relations reference known persons', () => {
  const persons = new Set(PEOPLE.persons.map((p) => p.id))
  for (const r of PEOPLE.relations) {
    expect(persons.has(r.from)).toBe(true)
    expect(persons.has(r.to)).toBe(true)
  }
})

test('every person except jesus has a card', () => {
  const carded = new Set(CARDS.map((c) => c.personId).filter(Boolean))
  for (const p of PEOPLE.persons) if (p.id !== 'jesus') expect(carded.has(p.id)).toBe(true)
})

test('lamp fallback for chapters without cards', () => {
  const cards = cardsForRef('mat:10')
  expect(cards).toHaveLength(1)
  expect(cards[0].id).toBe('lamp:mat:10')
  expect(cards[0].title).toBe('말씀의 등불')
  expect(getCard('lamp:mat:10')?.ref).toBe('mat:10')
  expect(getCard('nope')).toBeUndefined()
})

test('cards unlock only when every mission of the chapter is cleared', () => {
  const read = { 'jhn:3': '2026-09-22T00:00:00Z', 'mat:10': '2026-09-21T00:00:00Z' }
  // mat:10 has no mission → reading is enough; jhn:3 has missions → locked
  expect(resolveCards(read, {}).map((e) => e.card.id)).toEqual(['lamp:mat:10'])
  const all = Object.fromEntries(missionsForRef('jhn:3').map((m) => [m.id, { clearedAt: '2026-09-23T00:00:00Z', hintsUsed: 0 }]))
  const earned = resolveCards(read, all)
  expect(earned.map((e) => e.card.id)).toEqual(['lamp:mat:10', 'jhn:3:nicodemus', 'jhn:3:sosloved'])
  expect(earned[1].earnedAt).toBe('2026-09-23T00:00:00Z')
  expect(earnedPersonIds(read, all)).toEqual(new Set(['nicodemus']))
  // 일부만 완료하면 잠김
  const [first] = Object.keys(all)
  expect(isCardUnlocked('jhn:3', read, { [first]: all[first] })).toBe(missionsForRef('jhn:3').length === 1)
})
