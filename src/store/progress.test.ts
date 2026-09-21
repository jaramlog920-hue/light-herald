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
