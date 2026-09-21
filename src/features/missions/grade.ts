import missionsJson from '../../content/missions.json'
import type { Mission } from '../../content/types'

export const MISSIONS: Mission[] = missionsJson as Mission[]
const byRef = new Map<string, Mission>()
const byId = new Map<string, Mission>()
for (const m of MISSIONS) {
  byRef.set(m.ref, m)
  byId.set(m.id, m)
}

/** 장당 미션은 최대 하나 */
export function missionForRef(ref: string): Mission | undefined {
  return byRef.get(ref)
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
