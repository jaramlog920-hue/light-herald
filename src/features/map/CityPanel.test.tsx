import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MapView } from './MapView'
import { useProgress } from '../../store/progress'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

test('tapping a city opens its record panel with note and date', async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('act:8')
  useProgress.getState().saveNote('act:8', '사마리아에도 복음이')
  render(
    <MemoryRouter>
      <MapView />
    </MemoryRouter>,
  )
  await user.click(screen.getByTestId('city-samaria'))
  const dialog = screen.getByRole('dialog', { name: '사마리아' })
  expect(dialog).toHaveTextContent('빛의 확산')
  expect(dialog).toHaveTextContent('사도행전 8장')
  expect(dialog).toHaveTextContent('사마리아에도 복음이')
  await user.click(screen.getByTestId('city-rome'))
  expect(screen.getByRole('dialog', { name: '로마' })).toHaveTextContent('아직 이곳에 닿은 기록이 없습니다')
})
