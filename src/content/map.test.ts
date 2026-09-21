import map from './map.json'
import rules from './map-rules.json'
import { ALL_REFS, BOOKS } from './books'
import type { MapData, MapRule } from './types'

const m = map as MapData
const rs = rules as MapRule[]
const cityIds = new Set(m.cities.map((c) => c.id))

test('cities are unique and in bounds', () => {
  expect(cityIds.size).toBe(m.cities.length)
  for (const c of m.cities) {
    expect(c.x).toBeGreaterThanOrEqual(0)
    expect(c.x).toBeLessThanOrEqual(1536)
    expect(c.y).toBeGreaterThanOrEqual(0)
    expect(c.y).toBeLessThanOrEqual(1024)
  }
  expect(cityIds.has('jerusalem')).toBe(true)
})

test('routes reference known cities', () => {
  for (const r of m.routes) for (const id of r.path) expect(cityIds.has(id)).toBe(true)
})

test('rules reference known refs, books and cities', () => {
  const refs = new Set(ALL_REFS)
  const books = new Set(BOOKS.map((b) => b.id))
  for (const r of rs) {
    if ('ref' in r.when) expect(refs.has(r.when.ref)).toBe(true)
    if ('bookComplete' in r.when) expect(books.has(r.when.bookComplete)).toBe(true)
    if (r.effect === 'footprint' || r.effect === 'church') expect(cityIds.has(r.at)).toBe(true)
    if (r.effect === 'spread') {
      expect(cityIds.has(r.from)).toBe(true)
      expect(cityIds.has(r.to)).toBe(true)
    }
  }
})

test('every epistle builds a church, revelation builds new jerusalem', () => {
  const churches = rs
    .filter((r) => r.effect === 'church')
    .map((r) => (r.when as { bookComplete: string }).bookComplete)
  for (const b of BOOKS.filter((b) => b.group === 'pauline' || b.group === 'general')) {
    expect(churches).toContain(b.id)
  }
  expect(rs.some((r) => r.effect === 'new-jerusalem')).toBe(true)
})
