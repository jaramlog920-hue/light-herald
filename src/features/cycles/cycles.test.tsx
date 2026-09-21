import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress } from '../../store/progress'
import { ALL_REFS } from '../../content/books'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

test('next cycle requires completion; completing archives and retitles', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/cycles']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.queryByRole('button', { name: /다음 회독 시작/ })).not.toBeInTheDocument()
  for (const r of ALL_REFS) useProgress.getState().markRead(r)
  await user.click(await screen.findByRole('button', { name: /다음 회독 시작/ }))
  await user.click(screen.getByRole('button', { name: '2회차 시작' }))
  expect(useProgress.getState().cycle).toBe(2)
  expect(screen.getByText(/2회차 · 복음을 아는 증인/)).toBeInTheDocument()
  expect(screen.getByText(/1회차 · 길을 걷는 전령/)).toBeInTheDocument()
  expect(document.documentElement.dataset.cycle).toBe('2')
})

test('import merges a backup file', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/cycles']}>
      <App />
    </MemoryRouter>,
  )
  const file = new File([JSON.stringify({ readChapters: { 'mat:1': '2025-01-01T00:00:00.000Z' }, notes: { 'mat:1': 'hi' } })], 'b.json', { type: 'application/json' })
  await user.upload(screen.getByLabelText('백업 파일'), file)
  expect(await screen.findByRole('status')).toHaveTextContent('1개')
  expect(useProgress.getState().readChapters['mat:1']).toBe('2025-01-01T00:00:00.000Z')
})
