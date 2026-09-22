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

test('수신지가 성경에 기록된 서신만 교회를 세운다', () => {
  const churches = rs
    .filter((r) => r.effect === 'church')
    .map((r) => (r.when as { bookComplete: string }).bookComplete)
  // 히브리서·유다서·요한1~3서는 받는 곳이 본문에 없으므로 지도에 위치를 만들지 않는다
  const noPlace = ['heb', 'jud', '1jn', '2jn', '3jn']
  for (const b of BOOKS.filter((b) => b.group === 'pauline' || b.group === 'general')) {
    if (noPlace.includes(b.id)) expect(churches).not.toContain(b.id)
    else expect(churches).toContain(b.id)
  }
  // 야고보서·베드로전후서는 '흩어진 성도'에게 보낸 편지다 (약 1:1, 벧전 1:1)
  for (const b of ['jas', '1pe', '2pe']) {
    const r = rs.find((x) => x.effect === 'church' && (x.when as { bookComplete: string }).bookComplete === b)
    expect(r && 'at' in r && r.at).toBe('babylon')
  }
  expect(rs.some((r) => r.effect === 'new-jerusalem')).toBe(true)
})
