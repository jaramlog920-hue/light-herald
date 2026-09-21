import { resolveMap, isBookComplete } from './resolveMap'
import { ALL_REFS } from '../../content/books'

test('initial: only jerusalem lit', () => {
  const s = resolveMap(new Set())
  expect([...s.litCities]).toEqual(['jerusalem'])
  expect(s.footprints).toHaveLength(0)
  expect(s.churches).toHaveLength(0)
  expect(s.newJerusalem).toBe(false)
  expect(s.triggeredRefs).toEqual([])
})

test('acts 8 spreads to samaria', () => {
  const s = resolveMap(new Set(['act:2', 'act:5', 'act:8']))
  expect(s.litCities.has('samaria')).toBe(true)
  expect(s.litCities.has('rome')).toBe(false)
  expect(s.triggeredRefs).toEqual(['act:2', 'act:5', 'act:8'])
})

test('reading all of acts lights rome', () => {
  const s = resolveMap(new Set(ALL_REFS.filter((r) => r.startsWith('act:'))))
  expect(s.litCities.has('rome')).toBe(true)
})

test('completing romans builds church at rome', () => {
  const rom = ALL_REFS.filter((r) => r.startsWith('rom:'))
  expect(isBookComplete(new Set(rom.slice(0, -1)), 'rom')).toBe(false)
  const s = resolveMap(new Set(rom))
  expect(s.churches).toEqual([{ at: 'rome', label: '은혜의 기초', book: 'rom' }])
  expect(s.litCities.has('rome')).toBe(true)
  expect(s.triggeredRefs).toContain('book:rom')
})

test('all read → new jerusalem', () => {
  expect(resolveMap(new Set(ALL_REFS)).newJerusalem).toBe(true)
})
