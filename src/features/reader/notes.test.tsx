import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress } from '../../store/progress'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

test('notes view lists notes in canon order and links to chapter', () => {
  useProgress.getState().markRead('rom:8')
  useProgress.getState().saveNote('rom:8', '끊을 수 없는 사랑')
  useProgress.getState().markRead('mat:5')
  useProgress.getState().saveNote('mat:5', '팔복')
  useProgress.getState().saveNote('jhn:3', '   ')
  render(
    <MemoryRouter initialEntries={['/notes']}>
      <App />
    </MemoryRouter>,
  )
  const items = screen.getAllByRole('listitem')
  expect(items).toHaveLength(2)
  expect(items[0]).toHaveTextContent('마태복음 5장')
  expect(items[1]).toHaveTextContent('로마서 8장')
  expect(screen.getByRole('link', { name: /팔복/ })).toHaveAttribute('href', '/read/mat/5')
})
