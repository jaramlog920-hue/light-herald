import { MISSIONS, grade, getMission, shuffled, rewardsGem } from './grade'
import { ALL_REFS } from '../../content/books'
import map from '../../content/map.json'
import type { MapData } from '../../content/types'

const cityIds = new Set((map as MapData).cities.map((c) => c.id))
const gospels = new Set(['mat', 'mrk', 'luk', 'jhn'])

test('missions are valid and cover all seven types', () => {
  const refs = new Set(ALL_REFS)
  const seen = new Set<string>()
  const types = new Set<string>()
  for (const m of MISSIONS) {
    expect(refs.has(m.ref)).toBe(true)
    expect(seen.has(m.id)).toBe(false)
    seen.add(m.id)
    types.add(m.type)
    expect(m.hint.length).toBeGreaterThan(0)
    switch (m.type) {
      case 'quiz':
        expect(m.options[m.answer]).toBeDefined()
        break
      case 'gospel-detective':
        for (const b of m.answer) expect(gospels.has(b)).toBe(true)
        break
      case 'voyage':
        for (const c of m.order) expect(cityIds.has(c)).toBe(true)
        break
      case 'deliver':
        expect(cityIds.has(m.target)).toBe(true)
        expect(m.options).toContain(m.target)
        break
      case 'word-puzzle':
        expect(m.words.length).toBeGreaterThan(3)
        break
      case 'choice':
        expect(m.options.filter((o) => o.right)).toHaveLength(1)
        break
      case 'blank':
        expect(m.text).toContain('____')
        expect(m.options[m.answer]).toBeDefined()
        expect(new Set(m.options).size).toBe(m.options.length)
        break
    }
  }
  expect(types.size).toBe(7)
})

test('grade each type', () => {
  const quiz = getMission('mat:16:quiz')!
  expect(grade(quiz, { type: 'quiz', index: 2 })).toBe(true)
  expect(grade(quiz, { type: 'quiz', index: 0 })).toBe(false)

  const det = getMission('mat:8:gospel-detective')!
  expect(grade(det, { type: 'gospel-detective', books: ['luk', 'mat', 'mrk'] })).toBe(true)
  expect(grade(det, { type: 'gospel-detective', books: ['mat'] })).toBe(false)

  const voy = getMission('act:27:voyage')!
  expect(grade(voy, { type: 'voyage', order: ['caesarea', 'crete', 'malta', 'rome'] })).toBe(true)
  expect(grade(voy, { type: 'voyage', order: ['crete', 'caesarea', 'malta', 'rome'] })).toBe(false)

  const del = getMission('rom:1:deliver')!
  expect(grade(del, { type: 'deliver', city: 'rome' })).toBe(true)

  const wp = getMission('jhn:3:word-puzzle')!
  expect(grade(wp, { type: 'word-puzzle', words: wp.type === 'word-puzzle' ? wp.words : [] })).toBe(true)
  expect(rewardsGem(wp)).toBe(true)
  expect(rewardsGem(quiz)).toBe(false)

  const ch = getMission('luk:10:choice')!
  expect(grade(ch, { type: 'choice', index: 0 })).toBe(true)
  expect(grade(ch, { type: 'choice', index: 1 })).toBe(false)
  expect(grade(quiz, { type: 'choice', index: 2 })).toBe(false)
})

test('shuffled is deterministic and never identity', () => {
  const a = shuffled(['a', 'b', 'c', 'd'], 'x')
  expect(shuffled(['a', 'b', 'c', 'd'], 'x')).toEqual(a)
  expect(a).not.toEqual(['a', 'b', 'c', 'd'])
  expect([...a].sort()).toEqual(['a', 'b', 'c', 'd'])
})
