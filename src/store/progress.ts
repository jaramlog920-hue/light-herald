import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ALL_REFS, getBook } from '../content/books'

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
  markRead: (ref: string) => void
  saveNote: (ref: string, text: string) => void
  setLastRef: (ref: string) => void
  markMapSeen: (refs: string[]) => void
  clearMission: (id: string, hintsUsed: number) => void
  addGem: (n?: number) => void
  /** 보석이 있으면 하나 쓰고 true */
  spendGem: () => boolean
  /** 260장 완료 시에만 다음 회독 시작. 현재 기록은 history로 이동 */
  startNextCycle: () => boolean
  /** JSON 백업 병합: 읽은 장은 합집합(이른 날짜 우선), 묵상은 가져온 쪽 우선 */
  importState: (incoming: Partial<PersistedShape>) => void
}

export type PersistedShape = Pick<ProgressState, 'cycle' | 'readChapters' | 'notes' | 'lastRef' | 'seenMapRefs' | 'missions' | 'gems' | 'history'>

export const STORAGE_KEY = 'light-herald-progress'

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
      startNextCycle: () => {
        const s = get()
        if (Object.keys(s.readChapters).length < ALL_REFS.length) return false
        const record: CycleRecord = { cycle: s.cycle, readChapters: s.readChapters, notes: s.notes, completedAt: new Date().toISOString() }
        set({ cycle: s.cycle + 1, readChapters: {}, notes: {}, lastRef: null, seenMapRefs: [], history: [...s.history, record] })
        return true
      },
      importState: (incoming) =>
        set((s) => {
          const readChapters = { ...s.readChapters }
          for (const [ref, at] of Object.entries(incoming.readChapters ?? {})) {
            if (!readChapters[ref] || at < readChapters[ref]) readChapters[ref] = at
          }
          return {
            cycle: Math.max(s.cycle, incoming.cycle ?? 1),
            readChapters,
            notes: { ...s.notes, ...(incoming.notes ?? {}) },
            missions: { ...s.missions, ...(incoming.missions ?? {}) },
            gems: Math.max(s.gems, incoming.gems ?? 0),
            history: incoming.history && incoming.history.length > s.history.length ? incoming.history : s.history,
            seenMapRefs: Array.from(new Set([...s.seenMapRefs, ...(incoming.seenMapRefs ?? [])])),
          }
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<PersistedShape>
        if (version < 2) return { ...p, missions: {}, gems: 0, history: [] } as PersistedShape
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
})
