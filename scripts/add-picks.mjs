// stdin(JSON 객체)을 verse-picks.json에 병합
import { readFile, writeFile } from 'node:fs/promises'
const p = new URL('./verse-picks.json', import.meta.url)
let cur = {}
try { cur = JSON.parse(await readFile(p, 'utf8')) } catch {}
let input = ''
for await (const chunk of process.stdin) input += chunk
const add = JSON.parse(input)
Object.assign(cur, add)
await writeFile(p, JSON.stringify(cur, null, 1), 'utf8')
console.log(`picks: ${Object.keys(cur).length}`)
