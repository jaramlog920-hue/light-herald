import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress, selectTotalProgress } from '../../store/progress'
import { MISSION_IDS } from '../missions/ids'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

test('자동 저장 전에 화면을 벗어나도 묵상이 남는다', async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('jhn:3')
  const { unmount } = render(
    <MemoryRouter initialEntries={['/read/jhn/3']}>
      <App />
    </MemoryRouter>,
  )
  await user.type(screen.getByLabelText(/묵상 한 줄/), '사랑')
  unmount() // 400ms 디바운스가 끝나기 전에 떠난다
  expect(useProgress.getState().notes['jhn:3']).toBe('사랑')
})

test('다른 장으로 넘어가도 앞 장의 묵상이 남는다', async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('jhn:3')
  useProgress.getState().markRead('jhn:4')
  render(
    <MemoryRouter initialEntries={['/read/jhn/3']}>
      <App />
    </MemoryRouter>,
  )
  await user.type(screen.getByLabelText(/묵상 한 줄/), '독생자')
  await user.click(screen.getByRole('link', { name: /다음 장/ }))
  expect(useProgress.getState().notes['jhn:3']).toBe('독생자')
  expect(screen.getByLabelText(/묵상 한 줄/)).toHaveValue('') // 새 장은 빈 칸
})

test('읽음 직후 묵상 입력칸은 하나뿐이다', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/read/jhn/3']}>
      <App />
    </MemoryRouter>,
  )
  await user.click(screen.getByRole('button', { name: '읽음' }))
  const boxes = document.querySelectorAll('textarea')
  expect(boxes).toHaveLength(1)
  expect(new Set([...boxes].map((b) => b.id)).size).toBe(1)
})

test('백업 가져오기는 없는 장·묵상·미션 기록을 버린다', () => {
  useProgress.getState().importState({
    readChapters: { 'zzz:1': '2026-01-01T00:00:00.000Z', 'mat:999': '2026-01-01T00:00:00.000Z', 'mat:1': '2026-01-01T00:00:00.000Z' },
    notes: { 'zzz:1': '깨진 묵상', 'mat:1': '계보' },
    missions: { 'act:17:choice': { clearedAt: '2026-01-01T00:00:00.000Z', hintsUsed: 0 }, 'nope:1:quiz': { clearedAt: '', hintsUsed: 0 } },
    gems: -5,
    cycle: 0,
  })
  const s = useProgress.getState()
  expect(Object.keys(s.readChapters)).toEqual(['mat:1'])
  expect(selectTotalProgress(s)).toEqual({ read: 1, total: 260 })
  expect(Object.keys(s.notes)).toEqual(['mat:1'])
  expect(Object.keys(s.missions)).toEqual(['act:16:choice']) // 옮긴 미션은 살리고 없는 것은 버린다
  expect(Object.keys(s.missions).every((id) => MISSION_IDS.has(id))).toBe(true)
  expect(s.gems).toBe(0)
  expect(s.cycle).toBe(1)
})
