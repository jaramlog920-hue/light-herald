import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress } from '../../store/progress'

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

test('long-press a verse opens bookmark sheet; saving marks the verse with a memo', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  at('/read/jhn/3')
  const verse = document.getElementById('v-16')!
  fireEvent.pointerDown(verse)
  await act(async () => {
    vi.advanceTimersByTime(600)
  })
  const sheet = screen.getByRole('dialog', { name: /북마크 요한복음 3:16/ })
  expect(sheet).toHaveTextContent('독생자')
  await user.type(screen.getByLabelText(/메모/), '가장 유명한 구절')
  await user.click(screen.getByRole('button', { name: '북마크' }))
  expect(useProgress.getState().bookmarks['jhn:3:16'].memo).toBe('가장 유명한 구절')
  expect(document.getElementById('v-16')).toHaveClass('bookmarked')
  vi.useRealTimers()
})

test('short press does not open the sheet', () => {
  at('/read/jhn/3')
  const verse = document.getElementById('v-16')!
  fireEvent.pointerDown(verse)
  fireEvent.pointerUp(verse)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('bookmarks survive next cycle, list links with ?v=, delete and clear all', async () => {
  const user = userEvent.setup()
  const s = useProgress.getState()
  s.setBookmark('jhn:3', 16, '메모')
  s.setBookmark('mat:5', 3, '')
  // 260장 완독 후 다음 회독
  const { ALL_REFS } = await import('../../content/books')
  for (const r of ALL_REFS) s.markRead(r)
  expect(useProgress.getState().startNextCycle()).toBe(true)
  expect(Object.keys(useProgress.getState().bookmarks)).toHaveLength(2)

  at('/cycles')
  expect(screen.getByText('북마크 · 2/500개')).toBeInTheDocument()
  const links = screen.getAllByRole('link', { name: /🔖/ })
  expect(links[0]).toHaveAttribute('href', '/read/mat/5?v=3')
  expect(links[1]).toHaveAttribute('href', '/read/jhn/3?v=16')
  expect(screen.getByText('메모')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /마태복음 5:3 북마크 삭제/ }))
  expect(Object.keys(useProgress.getState().bookmarks)).toEqual(['jhn:3:16'])

  await user.click(screen.getByRole('button', { name: '북마크 전체 초기화' }))
  await user.click(screen.getByRole('button', { name: /모두 삭제/ }))
  expect(useProgress.getState().bookmarks).toEqual({})
  expect(screen.getByText(/아직 북마크가 없습니다/)).toBeInTheDocument()
})

test('?v= deep link flashes the verse', () => {
  at('/read/jhn/3?v=16')
  expect(document.getElementById('v-16')).toHaveClass('flash')
})
