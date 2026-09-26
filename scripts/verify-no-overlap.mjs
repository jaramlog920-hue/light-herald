// 같은 장의 미션끼리 같은 절을 쓰지 않는지 검사한다.
// 한 장에서 두 게임이 같은 구절을 쓰면 한쪽이 다른 쪽의 답을 알려 주거나, 같은 문제를 두 번 푸는 느낌이 된다.
import { readFile } from 'node:fs/promises'
const root = new URL('../', import.meta.url)
const books = JSON.parse(await readFile(new URL('src/content/books.json', root), 'utf8'))
const abbr = Object.fromEntries(books.map((b) => [b.id, b.abbr]))
const files = [
  'src/content/missions.json', 'src/content/missions-hand-2.json', 'src/content/missions-hand-3.json',
  'src/content/missions-hand-4.json', 'src/content/missions-hand-5.json', 'src/content/missions-generated.json',
]
const all = []
for (const f of files) {
  const hand = !f.includes('generated')
  for (const m of JSON.parse(await readFile(new URL(f, root), 'utf8'))) all.push({ ...m, hand })
}
const handIds = new Set(all.filter((m) => m.hand).map((m) => m.id))
const missions = all.filter((m) => m.hand || !handIds.has(m.id))

/** "마 2:1-3, 막 5:25" → Set("마 2:1") */
function verseSet(ref) {
  const out = new Set()
  let last = null
  for (const part of (ref ?? '').split(',')) {
    const m = part.trim().match(/^(?:(\S+)\s+)?(\d+):(\d+)(?:-(\d+))?$/)
    if (!m) return out
    const book = m[1] ?? last
    last = book
    const ch = Number(m[2]), from = Number(m[3]), to = m[4] ? Number(m[4]) : Number(m[3])
    for (let v = from; v <= to; v++) out.add(`${book} ${ch}:${v}`)
  }
  return out
}

const byChapter = new Map()
for (const m of missions) byChapter.set(m.ref, [...(byChapter.get(m.ref) ?? []), m])

let errors = 0
for (const [ref, list] of byChapter) {
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j]
      const va = verseSet(a.verseRef ?? a.hintVerse)
      const vb = verseSet(b.verseRef ?? b.hintVerse)
      const shared = [...va].filter((v) => vb.has(v))
      if (shared.length) {
        console.log(`  ✗ ${ref}: ${a.type}(${a.id})와 ${b.type}(${b.id})가 같은 절을 씁니다 — ${shared.join(', ')}`)
        errors++
      }
    }
  }
}
console.log(`${missions.length}개 미션, ${byChapter.size}개 장 검사, 같은 절 충돌 ${errors}`)
if (errors) console.log('  → scripts/verse-picks.json에서 그 장의 blank/wp 절을 바꾸세요. 책 약자는 ' + Object.values(abbr).slice(0, 3).join(', ') + ' …')
process.exit(errors ? 1 : 0)
