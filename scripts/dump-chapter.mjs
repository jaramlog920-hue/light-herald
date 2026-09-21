// 큐레이션용: 책의 각 장에서 5~20단어 절을 절 번호와 함께 출력
import { readFile } from 'node:fs/promises'
const bible = JSON.parse(await readFile(new URL('../src/content/nt-krv.json', import.meta.url), 'utf8'))
const [book, from = '1', to = '999'] = process.argv.slice(2)
const chapters = bible[book]
for (let c = Number(from); c <= Math.min(Number(to), chapters.length); c++) {
  console.log(`\n## ${book}:${c}`)
  chapters[c - 1].forEach((v, i) => {
    const n = v.split(/\s+/).length
    if (n >= 5 && n <= 20) console.log(`${i + 1}(${n}) ${v}`)
  })
}
