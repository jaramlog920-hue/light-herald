import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MapView } from './MapView'
import { useProgress } from '../../store/progress'
import { ALL_REFS } from '../../content/books'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

const renderMap = () =>
  render(
    <MemoryRouter>
      <MapView />
    </MemoryRouter>,
  )

test('initial map shows only jerusalem lit', () => {
  renderMap()
  expect(screen.getByTestId('city-jerusalem')).toHaveAttribute('data-lit', 'true')
  expect(screen.getByTestId('city-rome')).toHaveAttribute('data-lit', 'false')
  expect(screen.queryAllByTestId('spread-line')).toHaveLength(0)
  expect(screen.getByRole('link', { name: /읽기 시작/ })).toHaveAttribute('href', '/read/mat/1')
})

test('after acts, rome is lit and continue link points to last ref', () => {
  for (const r of ALL_REFS.filter((r) => r.startsWith('act:'))) useProgress.getState().markRead(r)
  useProgress.getState().setLastRef('act:28')
  renderMap()
  expect(screen.getByTestId('city-rome')).toHaveAttribute('data-lit', 'true')
  expect(screen.getAllByTestId('spread-line').length).toBeGreaterThan(5)
  expect(screen.getByRole('link', { name: /이어 읽기/ })).toHaveAttribute('href', '/read/act/28')
})

test('completed romans shows church label', () => {
  for (const r of ALL_REFS.filter((r) => r.startsWith('rom:'))) useProgress.getState().markRead(r)
  renderMap()
  expect(screen.getByText('은혜의 기초')).toBeInTheDocument()
})

test('gospel footprints and full completion', () => {
  for (const r of ALL_REFS) useProgress.getState().markRead(r)
  renderMap()
  expect(screen.getAllByTestId('footprint').length).toBeGreaterThan(10)
  expect(screen.getByTestId('new-jerusalem')).toBeInTheDocument()
})
