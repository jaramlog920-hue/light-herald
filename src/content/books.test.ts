import { BOOKS, ALL_REFS, getBook, chapterRef, parseRef, nextRef } from './books'

test('27 books, 260 chapters', () => {
  expect(BOOKS).toHaveLength(27)
  expect(BOOKS.reduce((n, b) => n + b.chapters, 0)).toBe(260)
  expect(ALL_REFS).toHaveLength(260)
  expect(ALL_REFS[0]).toBe('mat:1')
  expect(ALL_REFS.at(-1)).toBe('rev:22')
})

test('helpers', () => {
  expect(getBook('act').name).toBe('사도행전')
  expect(chapterRef('rom', 8)).toBe('rom:8')
  expect(parseRef('1co:13')).toEqual({ bookId: '1co', chapter: 13 })
  expect(() => getBook('gen')).toThrow()
})

test('nextRef crosses book boundary', () => {
  expect(nextRef('mat', 1)).toEqual({ bookId: 'mat', chapter: 2 })
  expect(nextRef('mat', 28)).toEqual({ bookId: 'mrk', chapter: 1 })
  expect(nextRef('rev', 22)).toBeNull()
})
