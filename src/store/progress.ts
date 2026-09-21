import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ALL_REFS, getBook } from '../content/books'

export interface ProgressState {
  cycle: number
  /** ref → ISO readAt (현재 회독) */
  readChapters: Record<string, string>
  notes: Record<string, string>
  lastRef: string | null
  /** 지도에서 이미 연출을 본 트리거 키 */
  seenMapRefs: string[]
  markRead: (ref: string) => void
  saveNote: (ref: string, text: string) => void
  setLastRef: (ref: string) => void
  markMapSeen: (refs: string[]) => void
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      cycle: 1,
      readChapters: {},
      notes: {},
      lastRef: null,
      seenMapRefs: [],
      markRead: (ref) => {
        if (get().readChapters[ref]) return
        set((s) => ({ readChapters: { ...s.readChapters, [ref]: new Date().toISOString() } }))
      },
      saveNote: (ref, text) => set((s) => ({ notes: { ...s.notes, [ref]: text } })),
      setLastRef: (ref) => set({ lastRef: ref }),
      markMapSeen: (refs) =>
        set((s) => ({ seenMapRefs: Array.from(new Set([...s.seenMapRefs, ...refs])) })),
    }),
    { name: 'light-herald-progress', version: 1 },
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
