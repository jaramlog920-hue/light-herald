import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress } from '../../store/progress'
import { missionsForRef } from '../missions/grade'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

test('book list → chapter list → read → mark read → reward sheet with note', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/books']}>
      <App />
    </MemoryRouter>,
  )
  await user.click(screen.getByRole('link', { name: /마태복음/ }))
  await user.click(screen.getByRole('link', { name: '1' }))
  expect(screen.getByText(/아브라함과 다윗의 자손/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '읽음' }))
  expect(useProgress.getState().readChapters['mat:1']).toBeTruthy()
  expect(useProgress.getState().lastRef).toBe('mat:1')

  const sheet = screen.getByRole('dialog', { name: /기억의 조각/ })
  expect(sheet).toHaveTextContent('미션을 모두 완료하면')
  expect(sheet).toHaveTextContent('마 1:23')
  await user.type(screen.getAllByLabelText(/묵상 한 줄/)[0], '임마누엘')
  await new Promise((r) => setTimeout(r, 500))
  expect(useProgress.getState().notes['mat:1']).toBe('임마누엘')
  expect(screen.getAllByRole('link', { name: /다음 장/ })[0]).toHaveAttribute('href', '/read/mat/2')
  expect(screen.getByRole('button', { name: /읽었어요/ })).toBeDisabled()
})

test('already-read chapter shows record section; cards locked until missions done', () => {
  useProgress.getState().markRead('jhn:3')
  useProgress.getState().saveNote('jhn:3', '사랑')
  const { unmount } = render(
    <MemoryRouter initialEntries={['/read/jhn/3']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText('이 장의 기록')).toBeInTheDocument()
  expect(screen.getByText(/미션을 모두 완료하면/)).toBeInTheDocument()
  expect(screen.queryByText('니고데모')).not.toBeInTheDocument()
  expect(screen.getByLabelText(/묵상 한 줄/)).toHaveValue('사랑')
  unmount()
  for (const m of missionsForRef('jhn:3')) useProgress.getState().clearMission(m.id, 0)
  render(
    <MemoryRouter initialEntries={['/read/jhn/3']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText('니고데모')).toBeInTheDocument()
})

test('last chapter of book links to next book', () => {
  render(
    <MemoryRouter initialEntries={['/read/mat/28']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: /다음 장/ })).toHaveAttribute('href', '/read/mrk/1')
})
