// 카드가 성경 본문과 어긋나지 않는지 검증한다.
// 1) verseRef가 실제 존재하고, 카드가 속한 장과 같은 장인지
// 2) 요약 속 따옴표 인용이 그 절 본문에 그대로 있는지
// 3) '말씀 조각'(word) 카드의 제목·요약은 본문 그대로여야 한다
import { readFile } from 'node:fs/promises'
const root = new URL('../', import.meta.url)
const bible = JSON.parse(await readFile(new URL('src/content/nt-krv.json', root), 'utf8'))
const books = JSON.parse(await readFile(new URL('src/content/books.json', root), 'utf8'))
const cards = JSON.parse(await readFile(new URL('src/content/cards.json', root), 'utf8'))
const byAbbr = Object.fromEntries(books.map((b) => [b.abbr, b.id]))
const norm = (s) => s.replace(/\s+/g, '').replace(/[,.·—…!?]/g, '')

function textFor(ref) {
  const m = ref.match(/^(\S+)\s+(\d+):(\d+)(?:-(\d+))?$/)
  if (!m) throw new Error(`형식 오류: ${ref}`)
  const book = byAbbr[m[1]]
  if (!book) throw new Error(`알 수 없는 책: ${ref}`)
  const ch = bible[book]?.[Number(m[2]) - 1]
  if (!ch) throw new Error(`없는 장: ${ref}`)
  const from = Number(m[3]), to = m[4] ? Number(m[4]) : Number(m[3])
  let out = ''
  for (let v = from; v <= to; v++) {
    const t = ch[v - 1]
    if (!t) throw new Error(`없는 절: ${ref} (${v})`)
    out += ' ' + t
  }
  return { text: out, book, ch: Number(m[2]) }
}

let errors = 0
const fail = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); errors++ }
for (const c of cards) {
  let t
  try { t = textFor(c.verseRef) } catch (e) { fail(c.id, e.message); continue }
  const [rb, rc] = c.ref.split(':')
  if (t.book !== rb || t.ch !== Number(rc)) fail(c.id, `카드는 ${c.ref}인데 인용은 ${c.verseRef}`)
  const body = norm(t.text)
  for (const m of [...c.summary.matchAll(/['"]([^'"]{2,})['"]/g)]) {
    const parts = m[1].split(/…|\.\.\./).map(norm).filter(Boolean)
    for (const q of parts) if (!body.includes(q)) fail(c.id, `인용이 본문에 없음: "${q}"`)
  }
  if (c.type === 'word') {
    // 제목은 '팔복'처럼 이름표일 수 있다(titleIsLabel). 요약은 언제나 본문 그대로여야 한다.
    const parts = c.titleIsLabel ? [] : [c.title]
    parts.push(...c.summary.split(/…|\.\.\./))
    for (const part of parts) {
      const q = norm(part.replace(/['"]/g, ''))
      if (q.length > 3 && !body.includes(q)) fail(c.id, `말씀 조각이 본문과 다름: "${part.trim()}"`)
    }
  }
}
console.log(`카드 ${cards.length}장 검사, 오류 ${errors}`)
process.exit(errors ? 1 : 0)
