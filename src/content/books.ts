import raw from './books.json'
import type { Book } from './types'

export const BOOKS: Book[] = raw as Book[]
const byId = new Map(BOOKS.map((b) => [b.id, b]))

export function getBook(id: string): Book {
  const b = byId.get(id)
  if (!b) throw new Error(`unknown book: ${id}`)
  return b
}

export function chapterRef(bookId: string, chapter: number): string {
  return `${bookId}:${chapter}`
}

export function parseRef(ref: string): { bookId: string; chapter: number } {
  const [bookId, ch] = ref.split(':')
  return { bookId, chapter: Number(ch) }
}

export const ALL_REFS: string[] = BOOKS.flatMap((b) =>
  Array.from({ length: b.chapters }, (_, i) => chapterRef(b.id, i + 1)),
)

/** 다음 장. 책의 마지막 장이면 다음 책 1장, 계시록 22장이면 null */
export function nextRef(bookId: string, chapter: number): { bookId: string; chapter: number } | null {
  const book = getBook(bookId)
  if (chapter < book.chapters) return { bookId, chapter: chapter + 1 }
  const idx = BOOKS.findIndex((b) => b.id === bookId)
  return idx + 1 < BOOKS.length ? { bookId: BOOKS[idx + 1].id, chapter: 1 } : null
}
