import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress } from '../../store/progress'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

test('book list → chapter list → read → mark read', async () => {
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
  expect(screen.getByRole('button', { name: /읽었어요/ })).toBeDisabled()
  expect(screen.getByRole('link', { name: /다음 장/ })).toHaveAttribute('href', '/read/mat/2')
})

test('last chapter of book links to next book', () => {
  render(
    <MemoryRouter initialEntries={['/read/mat/28']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: /다음 장/ })).toHaveAttribute('href', '/read/mrk/1')
})
