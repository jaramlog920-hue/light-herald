// 개역한글 본문에서 암송 구절 미션(word-puzzle)을 생성한다.
// spec: [bookId, chapter, verse, startWord, endWord, abbr] — start/end는 절 안의 시작·끝 단어(포함)
import { readFile, writeFile } from 'node:fs/promises'
const bible = JSON.parse(await readFile(new URL('../src/content/nt-krv.json', import.meta.url), 'utf8'))
const missionsPath = new URL('../src/content/missions.json', import.meta.url)
const missions = JSON.parse(await readFile(missionsPath, 'utf8'))
const taken = new Set(missions.map((m) => m.ref))

const SPECS = [
  ['mat', 6, 33, '너희는', '더하시리라', '마'],
  ['mat', 7, 7, '구하라', '것이니', '마'],
  ['mat', 11, 28, '수고하고', '하리라', '마'],
  ['mat', 19, 26, '사람으로는', '있느니라', '마'],
  ['mat', 24, 35, '천지는', '아니하리라', '마'],
  ['mat', 28, 20, '볼지어다', '있으리라', '마'],
  ['mrk', 1, 15, '때가', '믿으라', '막'],
  ['mrk', 9, 23, '믿는', '없느니라', '막'],
  ['mrk', 11, 24, '무엇이든지', '되리라', '막'],
  ['mrk', 12, 30, '네', '사랑하라', '막'],
  ['mrk', 16, 15, '너희는', '전파하라', '막'],
  ['luk', 1, 37, '대저', '없느니라', '눅'],
  ['luk', 6, 31, '남에게', '대접하라', '눅'],
  ['luk', 9, 23, '아무든지', '것이니라', '눅'],
  ['luk', 18, 27, '무릇', '있느니라', '눅'],
  ['luk', 23, 34, '아버지여', '못함이니이다', '눅'],
  ['jhn', 1, 1, '태초에', '하나님이시니라', '요'],
  ['jhn', 6, 35, '내가', '아니하리라', '요'],
  ['jhn', 8, 12, '나는', '얻으리라', '요'],
  ['jhn', 10, 11, '나는', '버리거니와', '요'],
  ['jhn', 11, 25, '나는', '살겠고', '요'],
  ['jhn', 15, 5, '나는', '없음이라', '요'],
  ['jhn', 16, 33, '세상에서는', '이기었노라', '요'],
  ['act', 4, 12, '다른이로서는', '없음이니라', '행'],
  ['act', 20, 35, '주는', '있다', '행'],
  ['rom', 3, 23, '모든', '못하더니', '롬'],
  ['rom', 5, 8, '우리가', '확증하셨느니라', '롬'],
  ['rom', 6, 23, '죄의', '영생이니라', '롬'],
  ['rom', 10, 13, '누구든지', '얻으리라', '롬'],
  ['rom', 12, 2, '너희는', '받아', '롬'],
  ['1co', 10, 31, '그런즉', '하라', '고전'],
  ['2co', 5, 17, '그런즉', '되었도다', '고후'],
  ['2co', 12, 9, '내', '온전하여짐이라', '고후'],
  ['gal', 2, 20, '내가', '것이라', '갈'],
  ['gal', 5, 22, '오직', '절제니', '갈'],
  ['gal', 6, 9, '우리가', '거두리라', '갈'],
  ['eph', 6, 10, '너희가', '강건하여지고', '엡'],
  ['php', 2, 5, '너희', '마음이니', '빌'],
  ['php', 3, 14, '푯대를', '좇아가노라', '빌'],
  ['col', 3, 23, '무슨', '말라', '골'],
  ['2th', 3, 3, '주는', '지키시리라', '살후'],
  ['2ti', 1, 7, '하나님이', '마음이니', '딤후'],
  ['2ti', 3, 16, '모든', '유익하니', '딤후'],
  ['heb', 13, 8, '예수', '동일하시니라', '히'],
  ['jas', 4, 8, '하나님을', '하시리라', '약'],
  ['1pe', 5, 7, '너희', '권고하심이니라', '벧전'],
  ['1jn', 1, 9, '만일', '것이요', '요일'],
  ['3jn', 1, 2, '사랑하는', '간구하노라', '요삼'],
  ['rev', 2, 10, '네가', '주리라', '계'],
  ['rev', 22, 20, '아멘', '오시옵소서', '계'],
]

const out = []
for (const [b, c, v, start, end, abbr] of SPECS) {
  const ref = `${b}:${c}`
  if (taken.has(ref)) { console.warn('skip (taken)', ref); continue }
  const verse = bible[b]?.[c - 1]?.[v - 1]
  if (!verse) { console.warn('missing', ref, v); continue }
  const words = verse.split(/\s+/).filter(Boolean)
  const si = words.indexOf(start)
  const ei = words.indexOf(end, si)
  if (si < 0 || ei < 0) { console.warn('phrase not found', ref, v, start, end, '|', verse); continue }
  const slice = words.slice(si, ei + 1)
  // 절 끝 조사/구두점 정리: 마지막 단어 뒤 문장부호는 그대로 둔다 (본문 그대로)
  if (slice.length < 5 || slice.length > 20) { console.warn('length', ref, slice.length); }
  out.push({
    id: `${ref}:word-puzzle`, ref, type: 'word-puzzle', title: '말씀 조각 맞추기',
    verseRef: `${abbr} ${c}:${v}`, words: slice,
    hint: `'${slice[0]} ${slice[1]}'으로 시작합니다.`, hintVerse: `${abbr} ${c}:${v}`,
  })
  taken.add(ref)
}
console.log(`generated ${out.length}`)
for (const m of out) console.log(m.verseRef, m.words.length, m.words.join(' '))
await writeFile(missionsPath, JSON.stringify([...missions, ...out], null, 0).replace(/\},\{/g, '},\n{'), 'utf8')
