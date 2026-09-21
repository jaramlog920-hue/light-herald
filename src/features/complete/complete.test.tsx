import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress } from '../../store/progress'
import { ALL_REFS } from '../../content/books'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

test('incomplete shows progress hint', () => {
  useProgress.getState().markRead('mat:1')
  render(
    <MemoryRouter initialEntries={['/complete']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText(/아직 길 위에/)).toBeInTheDocument()
  expect(screen.getByText(/1\/260장/)).toBeInTheDocument()
})

test('complete shows the closing line and notes', () => {
  for (const r of ALL_REFS) useProgress.getState().markRead(r)
  useProgress.getState().saveNote('rom:8', '끊을 수 없는 사랑')
  render(
    <MemoryRouter initialEntries={['/complete']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('당신의 오늘까지 왔습니다')
  expect(screen.getByText('끊을 수 없는 사랑', { exact: false })).toBeInTheDocument()
  expect(screen.getByText(/길을 걷는 전령/)).toBeInTheDocument()
})

test('map shows complete link when all read', () => {
  for (const r of ALL_REFS) useProgress.getState().markRead(r)
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: '완주 보기' })).toHaveAttribute('href', '/complete')
})
