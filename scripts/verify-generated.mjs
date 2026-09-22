// 생성된 미션(빈칸 채우기 / 말씀 조각)이 본문과 정확히 일치하는지 검증한다.
// - 빈칸에 정답을 넣은 문장이 그 절 본문에 그대로 있어야 한다
// - 오답 보기는 정답과 겹치지 않고, 그 자리에 넣었을 때 본문이 되지 않아야 한다
// - 말씀 조각의 단어를 순서대로 이으면 그 절 본문이어야 한다
import { readFile } from 'node:fs/promises'
const root = new URL('../', import.meta.url)
const bible = JSON.parse(await readFile(new URL('src/content/nt-krv.json', root), 'utf8'))
const books = JSON.parse(await readFile(new URL('src/content/books.json', root), 'utf8'))
const gen = JSON.parse(await readFile(new URL('src/content/missions-generated.json', root), 'utf8'))
const byAbbr = Object.fromEntries(books.map((b) => [b.abbr, b.id]))
const norm = (s) => s.replace(/\s+/g, '')

function verseText(ref) {
  const m = ref.match(/^(\S+)\s+(\d+):(\d+)(?:-(\d+))?$/)
  if (!m) throw new Error(`형식 오류: ${ref}`)
  const ch = bible[byAbbr[m[1]]]?.[Number(m[2]) - 1]
  if (!ch) throw new Error(`없는 장: ${ref}`)
  const from = Number(m[3]), to = m[4] ? Number(m[4]) : Number(m[3])
  let out = ''
  for (let v = from; v <= to; v++) {
    if (!ch[v - 1]) throw new Error(`없는 절: ${ref}`)
    out += ' ' + ch[v - 1]
  }
  return out
}

let errors = 0
const fail = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); errors++ }
let blanks = 0, puzzles = 0
for (const m of gen) {
  let body
  try { body = norm(verseText(m.hintVerse)) } catch (e) { fail(m.id, e.message); continue }
  const chapterOfRef = m.ref.split(':').slice(0, 2).join(':')
  if (!m.id.startsWith(chapterOfRef)) fail(m.id, `id와 ref 불일치 (${m.ref})`)
  if (m.type === 'blank') {
    blanks++
    if (!m.text.includes('____')) { fail(m.id, '빈칸 표시가 없음'); continue }
    const answer = m.options[m.answer]
    if (answer === undefined) { fail(m.id, '정답 번호가 보기 범위를 벗어남'); continue }
    if (new Set(m.options).size !== m.options.length) fail(m.id, '보기에 중복이 있음')
    const filled = norm(m.text.replace('____', answer))
    if (!body.includes(filled)) fail(m.id, `정답을 넣은 문장이 본문에 없음: "${m.text.replace('____', answer)}"`)
    for (let i = 0; i < m.options.length; i++) {
      if (i === m.answer) continue
      const wrong = norm(m.text.replace('____', m.options[i]))
      if (body.includes(wrong)) fail(m.id, `오답 보기도 본문이 됨: "${m.options[i]}"`)
    }
  } else if (m.type === 'word-puzzle') {
    puzzles++
    const joined = norm(m.words.join(''))
    if (!body.includes(joined)) fail(m.id, `말씀 조각이 본문과 다름: "${m.words.join(' ')}"`)
    if (m.words.length < 4) fail(m.id, '조각이 너무 적음')
  } else fail(m.id, `알 수 없는 종류: ${m.type}`)
}
console.log(`생성 미션 ${gen.length}개 (빈칸 ${blanks}, 말씀 조각 ${puzzles}) 검사, 오류 ${errors}`)
process.exit(errors ? 1 : 0)
