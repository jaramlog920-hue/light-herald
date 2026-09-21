import { CARDS, PEOPLE, cardsForRef, getCard, resolveCards, earnedPersonIds } from './resolveCards'
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

test('resolveCards derives from read chapters in canon order', () => {
  const earned = resolveCards({ 'jhn:3': '2026-09-22T00:00:00Z', 'mat:10': '2026-09-21T00:00:00Z' })
  expect(earned.map((e) => e.card.id)).toEqual(['lamp:mat:10', 'jhn:3:nicodemus', 'jhn:3:sosloved'])
  expect(earnedPersonIds({ 'jhn:3': 'x' })).toEqual(new Set(['nicodemus']))
})
