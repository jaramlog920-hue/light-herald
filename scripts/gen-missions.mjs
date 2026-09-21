// scripts/verse-picks.json 의 선택을 바탕으로 개역한글 본문에서 미션을 생성한다.
//   "mat:1": { "wp": [절, "시작단어", "끝단어"], "blank": [절, "정답단어"] }
//   wp 끝단어가 같은 절에 없으면 다음 절까지 이어 붙여 찾는다.
//   blank 정답단어는 그 절에 정확히 한 번 나와야 한다.
import { readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const bible = JSON.parse(await readFile(new URL('src/content/nt-krv.json', root), 'utf8'))
const books = JSON.parse(await readFile(new URL('src/content/books.json', root), 'utf8'))
const picks = JSON.parse(await readFile(new URL('scripts/verse-picks.json', root), 'utf8'))
const abbr = Object.fromEntries(books.map((b) => [b.id, b.abbr]))

const words = (b, c, v) => (bible[b][c - 1][v - 1] ?? '').split(/\s+/).filter(Boolean)
const errors = []
const out = []

for (const [ref, pick] of Object.entries(picks)) {
  const [b, cs] = ref.split(':')
  const c = Number(cs)
  if (!bible[b]?.[c - 1]) { errors.push(`${ref}: no such chapter`); continue }

  if (pick.wp) {
    const [v, start, end] = pick.wp
    let ws = words(b, c, v)
    let vr = `${abbr[b]} ${c}:${v}`
    let si = ws.indexOf(start)
    let ei = si >= 0 ? ws.indexOf(end, si) : -1
    // 끝단어가 같은 절에 없으면 최대 두 절까지 이어 붙여 찾는다
    for (let extra = 1; si >= 0 && ei < 0 && extra <= 2 && bible[b][c - 1][v - 1 + extra]; extra++) {
      ws = [...ws, ...words(b, c, v + extra)]
      ei = ws.indexOf(end, si)
      vr = `${abbr[b]} ${c}:${v}-${v + extra}`
    }
    if (si < 0 || ei < 0) errors.push(`${ref} wp: '${start}'..'${end}' not in verse ${v}: ${words(b, c, v).join(' ')}`)
    else {
      const slice = ws.slice(si, ei + 1)
      if (slice.length < 5 || slice.length > 18) errors.push(`${ref} wp: length ${slice.length}`)
      out.push({
        id: `${ref}:word-puzzle`, ref, type: 'word-puzzle', title: '말씀 조각 맞추기',
        verseRef: vr, words: slice,
        hint: `'${slice[0]} ${slice[1]}'으로 시작합니다.`, hintVerse: vr,
      })
    }
  }

  for (const key of ['blank', 'blank2']) {
    if (!pick[key]) continue
    const [v, answer] = pick[key]
    const ws = words(b, c, v)
    const idxs = ws.map((w, i) => (w === answer ? i : -1)).filter((i) => i >= 0)
    if (idxs.length !== 1) errors.push(`${ref} blank: '${answer}' appears ${idxs.length}x in verse ${v}: ${ws.join(' ')}`)
    else {
      const text = ws.map((w, i) => (i === idxs[0] ? '____' : w)).join(' ')
      // 오답: 같은 장에서 길이 비슷한 다른 단어 3개 (결정적 선택)
      const all = [...new Set(bible[b][c - 1].flatMap((vv) => vv.split(/\s+/)))].filter((w) => w !== answer && !ws.includes(w) && w.length >= 2)
      let pool = []
      for (let tol = 1; tol <= 6 && pool.length < 3; tol++) pool = all.filter((w) => Math.abs(w.length - answer.length) <= tol)
      if (pool.length < 3) errors.push(`${ref} blank: not enough distractors for '${answer}'`)
      else {
        let h = 2166136261
        for (const ch of ref + answer) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
        // 결정적 셔플: 각 후보에 해시 점수를 매겨 정렬 후 앞 3개
        const scored = pool.map((w, i) => {
          let x = h
          for (const ch of w) x = Math.imul(x ^ ch.charCodeAt(0), 16777619) >>> 0
          return { w, x: (x ^ i) >>> 0 }
        })
        scored.sort((a, b) => a.x - b.x)
        const distractors = scored.slice(0, 3).map((s) => s.w)
        const options = [...distractors]
        options.splice(h % 4, 0, answer)
        out.push({
          id: `${ref}:${key}`, ref, type: 'blank', title: '빈칸 채우기',
          verseRef: `${abbr[b]} ${c}:${v}`, text, options, answer: options.indexOf(answer),
          hint: `'${answer[0]}'로 시작하는 ${answer.length}글자입니다.`, hintVerse: `${abbr[b]} ${c}:${v}`,
        })
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
await writeFile(new URL('src/content/missions-generated.json', root), JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{') + '\n', 'utf8')
const wp = out.filter((m) => m.type === 'word-puzzle').length
console.log(`generated ${out.length} (word-puzzle ${wp}, blank ${out.length - wp}) for ${Object.keys(picks).length} chapters`)
