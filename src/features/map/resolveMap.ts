import rulesJson from '../../content/map-rules.json'
import { getBook, chapterRef } from '../../content/books'
import type { MapRule } from '../../content/types'

export interface MapState {
  /** 항상 jerusalem 포함 */
  litCities: Set<string>
  footprints: { at: string; ref: string }[]
  spreads: { from: string; to: string; ref: string }[]
  churches: { at: string; label: string; book: string }[]
  newJerusalem: boolean
  /** 효과를 만든 트리거 키. 장은 "act:8", 책 완료는 "book:rom" */
  triggeredRefs: string[]
}

const RULES = rulesJson as MapRule[]

export function isBookComplete(readSet: Set<string>, bookId: string): boolean {
  const book = getBook(bookId)
  for (let c = 1; c <= book.chapters; c++) if (!readSet.has(chapterRef(bookId, c))) return false
  return true
}

export function resolveMap(readSet: Set<string>, rules: MapRule[] = RULES): MapState {
  const state: MapState = {
    litCities: new Set(['jerusalem']),
    footprints: [],
    spreads: [],
    churches: [],
    newJerusalem: false,
    triggeredRefs: [],
  }
  const triggered = new Set<string>()
  for (const rule of rules) {
    let key: string
    if ('ref' in rule.when) {
      if (!readSet.has(rule.when.ref)) continue
      key = rule.when.ref
    } else {
      if (!isBookComplete(readSet, rule.when.bookComplete)) continue
      key = `book:${rule.when.bookComplete}`
    }
    triggered.add(key)
    switch (rule.effect) {
      case 'footprint':
        state.footprints.push({ at: rule.at, ref: key })
        state.litCities.add(rule.at)
        break
      case 'spread':
        state.spreads.push({ from: rule.from, to: rule.to, ref: key })
        state.litCities.add(rule.to)
        break
      case 'church':
        state.churches.push({ at: rule.at, label: rule.label, book: rule.when.bookComplete })
        state.litCities.add(rule.at)
        break
      case 'new-jerusalem':
        state.newJerusalem = true
        break
    }
  }
  state.triggeredRefs = [...triggered]
  return state
}
