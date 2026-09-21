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

test('gallery shows locked and earned cards, filter by tab, open detail', async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('jhn:3')
  for (const m of missionsForRef('jhn:3')) useProgress.getState().clearMission(m.id, 0)
  render(
    <MemoryRouter initialEntries={['/cards']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText(/2\/\d+ 복원/)).toBeInTheDocument()
  await user.click(screen.getByRole('tab', { name: '인물' }))
  expect(screen.getByText('니고데모')).toBeInTheDocument()
  expect(screen.queryByText('베드로')).not.toBeInTheDocument()
  await user.click(screen.getByText('니고데모'))
  expect(screen.getByRole('dialog', { name: '니고데모' })).toHaveTextContent('밤에 찾아와')
})

test('people graph lights earned persons only', async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('act:9')
  for (const m of missionsForRef('act:9')) useProgress.getState().clearMission(m.id, 0)
  render(
    <MemoryRouter initialEntries={['/people']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByTestId('person-jesus')).toHaveAttribute('data-on', 'true')
  expect(screen.getByTestId('person-paul')).toHaveAttribute('data-on', 'true')
  expect(screen.getByTestId('person-peter')).toHaveAttribute('data-on', 'false')
  await user.click(screen.getByTestId('person-paul'))
  expect(screen.getByText(/이방인의 사도/)).toBeInTheDocument()
})
