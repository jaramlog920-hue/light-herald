import missionsJson from '../../content/missions.json'
import hand2Json from '../../content/missions-hand-2.json'
import hand3Json from '../../content/missions-hand-3.json'
import generatedJson from '../../content/missions-generated.json'
import { BOOKS, parseRef } from '../../content/books'
import type { Mission } from '../../content/types'

const hand = [...(missionsJson as Mission[]), ...(hand2Json as Mission[]), ...(hand3Json as Mission[])]
const handIds = new Set(hand.map((m) => m.id))
// 손으로 쓴 미션이 같은 id를 가지면 생성본은 버린다
const generated = (generatedJson as Mission[]).filter((m) => !handIds.has(m.id))
const bookOrder = new Map(BOOKS.map((b, i) => [b.id, i]))
const TYPE_ORDER = ['quiz', 'gospel-detective', 'voyage', 'deliver', 'choice', 'word-puzzle', 'blank']
const refKey = (ref: string) => {
  const { bookId, chapter } = parseRef(ref)
  return (bookOrder.get(bookId) ?? 99) * 1000 + chapter
}
export const MISSIONS: Mission[] = [...hand, ...generated].sort(
  (a, b) => refKey(a.ref) - refKey(b.ref) || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type),
)
const byRef = new Map<string, Mission[]>()
const byId = new Map<string, Mission>()
for (const m of MISSIONS) {
  byRef.set(m.ref, [...(byRef.get(m.ref) ?? []), m])
  byId.set(m.id, m)
}

/** 장에 딸린 미션 전부 (없으면 빈 배열) */
export function missionsForRef(ref: string): Mission[] {
  return byRef.get(ref) ?? []
}
/** 장의 대표 미션 (첫 번째) */
export function missionForRef(ref: string): Mission | undefined {
  return byRef.get(ref)?.[0]
}
export function getMission(id: string): Mission | undefined {
  return byId.get(id)
}

export type Answer =
  | { type: 'quiz'; index: number }
  | { type: 'gospel-detective'; books: string[] }
  | { type: 'voyage'; order: string[] }
  | { type: 'deliver'; city: string }
  | { type: 'word-puzzle'; words: string[] }
  | { type: 'choice'; index: number }
  | { type: 'blank'; index: number }

const sameSet = (a: string[], b: string[]) => a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i])
const sameSeq = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i])

/** 순수 채점 함수 */
export function grade(mission: Mission, answer: Answer): boolean {
  if (mission.type !== answer.type) return false
  switch (mission.type) {
    case 'quiz':
      return answer.type === 'quiz' && answer.index === mission.answer
    case 'gospel-detective':
      return answer.type === 'gospel-detective' && sameSet(answer.books, mission.answer)
    case 'voyage':
      return answer.type === 'voyage' && sameSeq(answer.order, mission.order)
    case 'deliver':
      return answer.type === 'deliver' && answer.city === mission.target
    case 'word-puzzle':
      return answer.type === 'word-puzzle' && sameSeq(answer.words, mission.words)
    case 'choice':
      return answer.type === 'choice' && mission.options[answer.index]?.right === true
    case 'blank':
      return answer.type === 'blank' && answer.index === mission.answer
  }
}

/** 약속의 보석을 주는 미션인가 (암송 구절) */
export function rewardsGem(mission: Mission): boolean {
  return mission.type === 'word-puzzle'
}

/** 결정적 셔플 — 같은 미션은 항상 같은 순서로 섞여 테스트와 재도전이 안정적 */
export function shuffled<T>(items: T[], seed: string): T[] {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    const j = Math.abs(h) % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  // 우연히 정답 순서 그대로면 한 칸 회전
  if (out.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift() as T)
  return out
}
