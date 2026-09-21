// 손으로 쓴 미션의 인용구가 참조 절 본문에 실제로 있는지 검증한다.
// - hintVerse: "마 2:1-3, 막 5:25" 형식. 각 참조의 본문을 합쳐 검색 범위로 삼는다.
// - 문항/상황/보기/힌트/피드백 속의 큰따옴표("…") 또는 작은따옴표('…') 안 문구를 인용으로 간주.
// - 공백을 제거하고 비교한다(줄바꿈·띄어쓰기 차이 허용).
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const bible = JSON.parse(await readFile(new URL('src/content/nt-krv.json', root), 'utf8'))
const books = JSON.parse(await readFile(new URL('src/content/books.json', root), 'utf8'))
const byAbbr = Object.fromEntries(books.map((b) => [b.abbr, b.id]))
const files = process.argv.slice(2)
if (files.length === 0) files.push('src/content/missions.json', 'src/content/missions-hand-2.json')

const norm = (s) => s.replace(/\s+/g, '').replace(/[,.!?…]/g, '')

function textFor(refStr) {
  // "마 2:1-3" | "행 16:12, 17:1" (뒤 항목은 책 생략 가능)
  let out = ''
  let lastBook = null
  for (const part of refStr.split(',').map((s) => s.trim())) {
    const m = part.match(/^(?:(\S+)\s+)?(\d+):(\d+)(?:-(\d+))?/)
    if (!m) throw new Error(`bad ref: ${part}`)
    const book = m[1] ? byAbbr[m[1]] : lastBook
    if (!book) throw new Error(`unknown book in ${part}`)
    lastBook = book
    const ch = Number(m[2])
    const from = Number(m[3])
    const to = m[4] ? Number(m[4]) : from
    for (let v = from; v <= to; v++) {
      const t = bible[book]?.[ch - 1]?.[v - 1]
      if (!t) throw new Error(`no verse ${part}`)
      out += ' ' + t
    }
  }
  return out
}

let errors = 0
let quotes = 0
for (const f of files) {
  const missions = JSON.parse(await readFile(new URL(f, root), 'utf8'))
  for (const m of missions) {
    let scope
    try {
      scope = norm(textFor(m.hintVerse))
    } catch (e) {
      console.log(`✗ ${m.id}: ${e.message}`)
      errors++
      continue
    }
    const fields = [m.question, m.situation, m.event, m.hint, ...(m.options ?? []).map((o) => (typeof o === 'string' ? o : o.text + ' ' + o.feedback))].filter(Boolean)
    for (const field of fields) {
      for (const q of field.matchAll(/["“']([^"”'\s,.][^"”']{4,}[^"”'\s,.])["”']/g)) {
        quotes++
        const needle = norm(q[1]).replace(/___+/g, '')
        // 빈칸(___)이 있으면 앞뒤 조각으로 나눠 각각 검사
        const pieces = norm(q[1]).split(/___+/).filter((p) => p.length >= 4)
        const ok = pieces.length ? pieces.every((p) => scope.includes(p)) : scope.includes(needle)
        if (!ok) {
          console.log(`✗ ${m.id} [${m.hintVerse}] 인용 불일치: "${q[1]}"`)
          errors++
        }
      }
    }
  }
  console.log(`${f}: ${missions.length} missions`)
}
console.log(`quotes checked: ${quotes}, errors: ${errors}`)
process.exit(errors ? 1 : 0)
