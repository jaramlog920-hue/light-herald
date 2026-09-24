import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress, STORAGE_KEY, isValidBookmarkKey } from '../../store/progress'
import { MISSION_IDS } from './ids'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

const at = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

test('사라진 미션 기록은 불러올 때 정리되고, 옮긴 미션은 기록을 잇는다', async () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 3,
      state: {
        cycle: 1, readChapters: {}, notes: {}, lastRef: null, seenMapRefs: [], gems: 0, history: [], bookmarks: {},
        missions: {
          'act:17:choice': { clearedAt: '2026-01-01T00:00:00.000Z', hintsUsed: 0 }, // 행 16장으로 옮긴 미션
          'nope:9:quiz': { clearedAt: '2026-01-01T00:00:00.000Z', hintsUsed: 0 }, // 이제 없는 미션
          'mat:16:quiz': { clearedAt: '2026-01-01T00:00:00.000Z', hintsUsed: 0 },
        },
      },
    }),
  )
  await useProgress.persist.rehydrate()
  const ids = Object.keys(useProgress.getState().missions).sort()
  expect(ids).toEqual(['act:16:choice', 'mat:16:quiz'])
  for (const id of ids) expect(MISSION_IDS.has(id)).toBe(true)
})

test('이미 완료한 미션은 다음 회독에서도 잠기지 않는다', () => {
  useProgress.getState().clearMission('mat:16:quiz', 0) // 읽은 기록 없이 완료만 있는 상태(2회독 시작 직후)
  at('/missions/mat:16:quiz')
  expect(screen.queryByText(/읽으면 열립니다/)).not.toBeInTheDocument()
  expect(screen.getByText(/누가 이 말을/)).toBeInTheDocument()
})

test('산 힌트는 다시 들어와도 보석을 또 쓰지 않는다', async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('mat:16')
  useProgress.getState().addGem(2)
  const { unmount } = at('/missions/mat:16:quiz')
  await user.click(screen.getByRole('button', { name: /힌트/ }))
  expect(screen.getByRole('note')).toHaveTextContent('바요나 시몬')
  expect(useProgress.getState().gems).toBe(1)
  unmount()

  at('/missions/mat:16:quiz') // 나갔다 다시 들어와도
  expect(screen.getByRole('note')).toHaveTextContent('바요나 시몬')
  expect(screen.queryByRole('button', { name: /힌트/ })).not.toBeInTheDocument()
  expect(useProgress.getState().gems).toBe(1)
})

test('잘못된 북마크나 주소가 화면을 무너뜨리지 않는다', () => {
  expect(isValidBookmarkKey('jhn:3:16')).toBe(true)
  expect(isValidBookmarkKey('zzz:9:1')).toBe(false)
  expect(isValidBookmarkKey('jhn:99:1')).toBe(false)
  useProgress.setState({ bookmarks: { 'zzz:9:1': { memo: '깨진 것', createdAt: '2026-01-01T00:00:00.000Z' } } })
  at('/cycles')
  expect(screen.getByText(/아직 북마크가 없습니다/)).toBeInTheDocument()

  at('/read/zzz/1') // 없는 책 주소
  expect(screen.getByText(/화면을 열지 못했습니다/)).toBeInTheDocument()
})

test('백업 가져오기는 깨진 북마크를 버리고 상한을 지킨다', () => {
  const many: Record<string, { memo: string; createdAt: string }> = { 'zzz:1:1': { memo: '', createdAt: '' } }
  for (let i = 1; i <= 600; i++) many[`mat:1:${i}`] = { memo: '', createdAt: '2026-01-01T00:00:00.000Z' }
  useProgress.getState().importState({ bookmarks: many })
  const keys = Object.keys(useProgress.getState().bookmarks)
  expect(keys).toHaveLength(500)
  expect(keys).not.toContain('zzz:1:1')
})
