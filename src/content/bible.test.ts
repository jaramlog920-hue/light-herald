import { getChapter, verseCount } from './bible'
import { BOOKS } from './books'

test('every chapter has verses', () => {
  for (const b of BOOKS) {
    for (let c = 1; c <= b.chapters; c++) expect(verseCount(b.id, c)).toBeGreaterThan(0)
  }
})

test('known verses', () => {
  expect(getChapter('jhn', 3)[15]).toContain('독생자')
  expect(verseCount('rev', 22)).toBe(21)
  expect(() => getChapter('mat', 29)).toThrow()
})
