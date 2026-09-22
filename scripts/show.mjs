// 참조 문자열(예: "마 1:18-25", "요 20:27") → 개역한글 본문 출력
import { readFile } from 'node:fs/promises'
const root = new URL('../', import.meta.url)
const bible = JSON.parse(await readFile(new URL('src/content/nt-krv.json', root), 'utf8'))
const books = JSON.parse(await readFile(new URL('src/content/books.json', root), 'utf8'))
const byAbbr = new Map(books.map((b) => [b.abbr, b.id]))
export function verses(ref) {
  const m = ref.match(/^\s*(\S+)\s+(\d+):(\d+)(?:-(\d+))?\s*$/)
  if (!m) return null
  const id = byAbbr.get(m[1])
  const ch = bible[id]?.[+m[2] - 1]
  if (!ch) return null
  const a = +m[3], b = m[4] ? +m[4] : +m[3]
  return ch.slice(a - 1, b).map((t, i) => [a + i, t])
}
if (process.argv[2]) {
  for (const ref of process.argv.slice(2)) {
    const vs = verses(ref)
    console.log('## ' + ref)
    if (!vs) { console.log('  !! 찾을 수 없음'); continue }
    for (const [n, t] of vs) console.log(`  ${n} ${t}`)
  }
}
