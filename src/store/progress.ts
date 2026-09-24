import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ALL_REFS, getBook } from '../content/books'
import { MISSION_IDS, RENAMED_MISSIONS } from '../features/missions/ids'

export interface MissionRecord {
  clearedAt: string
  hintsUsed: number
}

export interface CycleRecord {
  cycle: number
  readChapters: Record<string, string>
  notes: Record<string, string>
  completedAt: string
}

export interface Bookmark {
  memo: string
  createdAt: string
}

/** 북마크 상한 — localStorage(약 5MB) 안에서 넉넉한 수 */
export const MAX_BOOKMARKS = 500

/** 북마크 키: "book:chapter:verse" */
export const bookmarkKey = (ref: string, verse: number) => `${ref}:${verse}`

export interface ProgressState {
  cycle: number
  /** ref → ISO readAt (현재 회독) */
  readChapters: Record<string, string>
  notes: Record<string, string>
  lastRef: string | null
  /** 지도에서 이미 연출을 본 트리거 키 */
  seenMapRefs: string[]
  missions: Record<string, MissionRecord>
  /** 약속의 보석 — 암송 미션으로 얻고 힌트에 쓴다 */
  gems: number
  /** 완료한 이전 회독 기록 */
  history: CycleRecord[]
  /** 구절 북마크 — 회독이 바뀌어도 유지 */
  bookmarks: Record<string, Bookmark>
  /** 미션별로 산 힌트 수 — 한 번 사면 다시 보석을 쓰지 않는다 */
  hints: Record<string, number>
  markRead: (ref: string) => void
  saveNote: (ref: string, text: string) => void
  setLastRef: (ref: string) => void
  markMapSeen: (refs: string[]) => void
  clearMission: (id: string, hintsUsed: number) => void
  addGem: (n?: number) => void
  /** 보석이 있으면 하나 쓰고 true */
  spendGem: () => boolean
  /** 힌트 열기. 이미 산 미션이면 보석을 쓰지 않고 true */
  buyHint: (missionId: string) => boolean
  /** 260장 완료 시에만 다음 회독 시작. 현재 기록은 history로 이동 */
  startNextCycle: () => boolean
  /** 북마크 저장(없으면 생성, 있으면 메모만 갱신). 상한에 걸리면 false */
  setBookmark: (ref: string, verse: number, memo: string) => boolean
  removeBookmark: (key: string) => void
  clearBookmarks: () => void
  /** JSON 백업 병합: 읽은 장은 합집합(이른 날짜 우선), 묵상은 가져온 쪽 우선 */
  importState: (incoming: Partial<PersistedShape>) => void
}

export type PersistedShape = Pick<ProgressState, 'cycle' | 'readChapters' | 'notes' | 'lastRef' | 'seenMapRefs' | 'missions' | 'gems' | 'history' | 'bookmarks' | 'hints'>

export const STORAGE_KEY = 'light-herald-progress'

/** 북마크 키가 "book:chapter:verse" 꼴이고 실제 절을 가리키는가 */
export function isValidBookmarkKey(key: string): boolean {
  const [bookId, ch, v] = key.split(':')
  if (!bookId || !ch || !v) return false
  const n = Number(ch), m = Number(v)
  if (!Number.isInteger(n) || !Number.isInteger(m) || n < 1 || m < 1) return false
  try {
    return n <= getBook(bookId).chapters
  } catch {
    return false
  }
}

/** 백업에서 들어온 북마크를 검증하고 상한까지만 받는다 */
function mergeBookmarks(base: Record<string, Bookmark>, incoming?: Record<string, Bookmark>): Record<string, Bookmark> {
  const out: Record<string, Bookmark> = {}
  for (const [k, v] of Object.entries({ ...base, ...(incoming ?? {}) })) {
    if (!isValidBookmarkKey(k) || !v || typeof v.memo !== 'string') continue
    if (Object.keys(out).length >= MAX_BOOKMARKS) break
    out[k] = v
  }
  return out
}

const REF_SET = new Set(ALL_REFS)

/** 백업에서 들어온 "book:chapter" 기록 중 실제 있는 장만 남긴다 */
function pickKnownRefs<T>(map?: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {}
  for (const [ref, v] of Object.entries(map ?? {})) if (REF_SET.has(ref)) out[ref] = v
  return out
}

/** 이름이 바뀐 미션은 옮기고, 더 이상 없는 미션 기록은 버린다 */
function cleanMissions(records?: Record<string, MissionRecord>): Record<string, MissionRecord> {
  const out: Record<string, MissionRecord> = {}
  for (const [id, rec] of Object.entries(records ?? {})) {
    const key = RENAMED_MISSIONS[id] ?? id
    if (MISSION_IDS.has(key)) out[key] = rec
  }
  return out
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      cycle: 1,
      readChapters: {},
      notes: {},
      lastRef: null,
      seenMapRefs: [],
      missions: {},
      gems: 0,
      history: [],
      bookmarks: {},
      hints: {},
      markRead: (ref) => {
        if (get().readChapters[ref]) return
        set((s) => ({ readChapters: { ...s.readChapters, [ref]: new Date().toISOString() } }))
      },
      saveNote: (ref, text) => set((s) => ({ notes: { ...s.notes, [ref]: text } })),
      setLastRef: (ref) => set({ lastRef: ref }),
      markMapSeen: (refs) => set((s) => ({ seenMapRefs: Array.from(new Set([...s.seenMapRefs, ...refs])) })),
      clearMission: (id, hintsUsed) => {
        if (get().missions[id]) return
        set((s) => ({ missions: { ...s.missions, [id]: { clearedAt: new Date().toISOString(), hintsUsed } } }))
      },
      addGem: (n = 1) => set((s) => ({ gems: s.gems + n })),
      spendGem: () => {
        if (get().gems <= 0) return false
        set((s) => ({ gems: s.gems - 1 }))
        return true
      },
      buyHint: (missionId) => {
        if (get().hints[missionId]) return true
        if (!get().spendGem()) return false
        set((s) => ({ hints: { ...s.hints, [missionId]: (s.hints[missionId] ?? 0) + 1 } }))
        return true
      },
      startNextCycle: () => {
        const s = get()
        if (Object.keys(s.readChapters).length < ALL_REFS.length) return false
        const record: CycleRecord = { cycle: s.cycle, readChapters: s.readChapters, notes: s.notes, completedAt: new Date().toISOString() }
        set({ cycle: s.cycle + 1, readChapters: {}, notes: {}, lastRef: null, seenMapRefs: [], history: [...s.history, record] })
        return true
      },
      setBookmark: (ref, verse, memo) => {
        const key = bookmarkKey(ref, verse)
        const prev = get().bookmarks[key]
        if (!prev && Object.keys(get().bookmarks).length >= MAX_BOOKMARKS) return false
        set((s) => ({ bookmarks: { ...s.bookmarks, [key]: { memo, createdAt: prev?.createdAt ?? new Date().toISOString() } } }))
        return true
      },
      removeBookmark: (key) =>
        set((s) => {
          const next = { ...s.bookmarks }
          delete next[key]
          return { bookmarks: next }
        }),
      clearBookmarks: () => set({ bookmarks: {} }),
      importState: (incoming) =>
        set((s) => {
          // 남의 기기에서 온 파일이므로 아는 장·미션만 받아들인다
          const readChapters = { ...s.readChapters }
          for (const [ref, at] of Object.entries(pickKnownRefs(incoming.readChapters))) {
            if (typeof at !== 'string') continue
            if (!readChapters[ref] || at < readChapters[ref]) readChapters[ref] = at
          }
          const cycle = Number(incoming.cycle)
          const gems = Number(incoming.gems)
          return {
            cycle: Math.max(s.cycle, Number.isFinite(cycle) && cycle >= 1 ? Math.floor(cycle) : 1),
            readChapters,
            notes: { ...s.notes, ...pickKnownRefs(incoming.notes) },
            missions: cleanMissions({ ...s.missions, ...(incoming.missions ?? {}) }),
            gems: Math.max(s.gems, Number.isFinite(gems) && gems > 0 ? Math.floor(gems) : 0),
            history: incoming.history && incoming.history.length > s.history.length ? incoming.history : s.history,
            seenMapRefs: Array.from(new Set([...s.seenMapRefs, ...(incoming.seenMapRefs ?? [])])),
            bookmarks: mergeBookmarks(s.bookmarks, incoming.bookmarks),
            hints: { ...s.hints, ...(incoming.hints ?? {}) },
            lastRef: s.lastRef ?? incoming.lastRef ?? null,
          }
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 4,
      migrate: (persisted, version) => {
        let p = (persisted ?? {}) as Partial<PersistedShape>
        if (version < 2) p = { ...p, missions: {}, gems: 0, history: [] }
        if (version < 3) p = { ...p, bookmarks: {} }
        if (version < 4) p = { ...p, hints: {}, missions: cleanMissions(p.missions), bookmarks: mergeBookmarks({}, p.bookmarks) }
        return p as PersistedShape
      },
    },
  ),
)

export const selectReadSet = (s: Pick<ProgressState, 'readChapters'>) => new Set(Object.keys(s.readChapters))

export const selectBookProgress = (s: Pick<ProgressState, 'readChapters'>, bookId: string) => {
  const total = getBook(bookId).chapters
  const read = Object.keys(s.readChapters).filter((r) => r.startsWith(bookId + ':')).length
  return { read, total }
}

export const selectTotalProgress = (s: Pick<ProgressState, 'readChapters'>) => ({
  read: Object.keys(s.readChapters).length,
  total: ALL_REFS.length,
})

/** 내보내기용 스냅샷 */
export const exportState = (s: ProgressState): PersistedShape => ({
  cycle: s.cycle,
  readChapters: s.readChapters,
  notes: s.notes,
  lastRef: s.lastRef,
  seenMapRefs: s.seenMapRefs,
  missions: s.missions,
  gems: s.gems,
  history: s.history,
  bookmarks: s.bookmarks,
  hints: s.hints,
})
