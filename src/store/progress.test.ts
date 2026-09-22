import { useProgress, selectBookProgress, selectTotalProgress, selectReadSet } from './progress'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

test('markRead keeps first date', () => {
  useProgress.getState().markRead('mat:1')
  const first = useProgress.getState().readChapters['mat:1']
  useProgress.getState().markRead('mat:1')
  expect(useProgress.getState().readChapters['mat:1']).toBe(first)
  expect(selectReadSet(useProgress.getState()).has('mat:1')).toBe(true)
})

test('progress selectors', () => {
  useProgress.getState().markRead('phm:1')
  useProgress.getState().markRead('jud:1')
  expect(selectBookProgress(useProgress.getState(), 'phm')).toEqual({ read: 1, total: 1 })
  expect(selectTotalProgress(useProgress.getState())).toEqual({ read: 2, total: 260 })
})

test('persists to localStorage', () => {
  useProgress.getState().markRead('rev:22')
  expect(localStorage.getItem('light-herald-progress')).toContain('rev:22')
})

test('notes and map seen', () => {
  useProgress.getState().saveNote('jhn:3', '사랑')
  useProgress.getState().markMapSeen(['jhn:3', 'jhn:3'])
  expect(useProgress.getState().notes['jhn:3']).toBe('사랑')
  expect(useProgress.getState().seenMapRefs).toEqual(['jhn:3'])
})

test('missions and gems', () => {
  const s = useProgress.getState()
  expect(s.spendGem()).toBe(false)
  s.addGem()
  expect(useProgress.getState().gems).toBe(1)
  expect(useProgress.getState().spendGem()).toBe(true)
  expect(useProgress.getState().gems).toBe(0)
  s.clearMission('jhn:3:word-puzzle', 1)
  const first = useProgress.getState().missions['jhn:3:word-puzzle'].clearedAt
  s.clearMission('jhn:3:word-puzzle', 0)
  expect(useProgress.getState().missions['jhn:3:word-puzzle']).toEqual({ clearedAt: first, hintsUsed: 1 })
})

test('startNextCycle only when complete, archives record', async () => {
  const { ALL_REFS } = await import('../content/books')
  useProgress.getState().markRead('mat:1')
  expect(useProgress.getState().startNextCycle()).toBe(false)
  for (const r of ALL_REFS) useProgress.getState().markRead(r)
  useProgress.getState().saveNote('mat:1', 'a')
  expect(useProgress.getState().startNextCycle()).toBe(true)
  const s = useProgress.getState()
  expect(s.cycle).toBe(2)
  expect(s.readChapters).toEqual({})
  expect(s.history).toHaveLength(1)
  expect(s.history[0].notes['mat:1']).toBe('a')
  expect(Object.keys(s.history[0].readChapters)).toHaveLength(260)
})

test('importState merges union with earliest date and incoming notes', () => {
  useProgress.getState().markRead('mat:1')
  useProgress.getState().saveNote('mat:1', 'mine')
  useProgress.getState().importState({
    readChapters: { 'mat:1': '2020-01-01T00:00:00.000Z', 'mat:2': '2021-01-01T00:00:00.000Z' },
    notes: { 'mat:1': 'theirs' },
    gems: 3,
  })
  const s = useProgress.getState()
  expect(s.readChapters['mat:1']).toBe('2020-01-01T00:00:00.000Z')
  expect(s.readChapters['mat:2']).toBeTruthy()
  expect(s.notes['mat:1']).toBe('theirs')
  expect(s.gems).toBe(3)
})

test('bookmark cap', async () => {
  const { MAX_BOOKMARKS } = await import('./progress')
  const s = useProgress.getState()
  for (let i = 1; i <= MAX_BOOKMARKS; i++) expect(s.setBookmark('mat:1', i, '')).toBe(true)
  expect(useProgress.getState().setBookmark('mat:2', 1, '')).toBe(false)
  // 이미 있는 북마크의 메모 수정은 상한과 무관
  expect(useProgress.getState().setBookmark('mat:1', 1, '수정')).toBe(true)
  expect(useProgress.getState().bookmarks['mat:1:1'].memo).toBe('수정')
})
