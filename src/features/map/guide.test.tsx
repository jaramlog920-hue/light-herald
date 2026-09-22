import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress } from '../../store/progress'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

test('guide opens on first visit, closes and remembers; (?) reopens it', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('dialog', { name: '사용 안내' })).toHaveTextContent('구절을 길게 누르면 북마크')
  await user.click(screen.getByRole('button', { name: '시작하기' }))
  expect(screen.queryByRole('dialog', { name: '사용 안내' })).not.toBeInTheDocument()
  expect(localStorage.getItem('light-herald-guide-seen')).toBe('1')
  await user.click(screen.getByRole('button', { name: '사용 안내' }))
  expect(screen.getByRole('dialog', { name: '사용 안내' })).toBeInTheDocument()
})
