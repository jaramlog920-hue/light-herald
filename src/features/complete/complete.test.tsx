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

test('finale walks bookmarks, notes, then the great commandment', async () => {
  const { default: userEvent } = await import('@testing-library/user-event')
  for (const r of ALL_REFS) useProgress.getState().markRead(r)
  useProgress.getState().setBookmark('jhn:3', 16, '처음 외운 말씀')
  useProgress.getState().saveNote('rom:8', '끊을 수 없는 사랑')
  render(
    <MemoryRouter initialEntries={['/finale']}>
      <App />
    </MemoryRouter>,
  )
  const user = userEvent.setup()
  expect(screen.getByRole('heading', { name: '붙잡은 말씀' })).toBeInTheDocument()
  expect(screen.getByText('처음 외운 말씀')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '다음' }))
  expect(await screen.findByRole('heading', { name: '남긴 묵상' })).toBeInTheDocument()
  expect(screen.getByText('끊을 수 없는 사랑')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '다음' }))
  expect(await screen.findByText('이것이 크고 첫째 되는 계명이요')).toBeInTheDocument()
  expect(screen.getByText(/네 이웃을 네 몸과 같이 사랑하라/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '마치기' })).toHaveAttribute('href', '/')
})

test('finale skips empty steps and goes straight to the commandment', () => {
  for (const r of ALL_REFS) useProgress.getState().markRead(r)
  render(
    <MemoryRouter initialEntries={['/finale']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText('마태복음 22:37–40')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '다음' })).not.toBeInTheDocument()
})

test('finale is closed until every chapter is read', () => {
  useProgress.getState().markRead('mat:1')
  render(
    <MemoryRouter initialEntries={['/finale']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText(/아직 길 위에/)).toBeInTheDocument()
})

test('reading the last unread chapter offers the finale, wherever it is', async () => {
  const { default: userEvent } = await import('@testing-library/user-event')
  for (const r of ALL_REFS) if (r !== 'rom:8') useProgress.getState().markRead(r)
  render(
    <MemoryRouter initialEntries={['/read/rom/8']}>
      <App />
    </MemoryRouter>,
  )
  await userEvent.setup().click(screen.getByRole('button', { name: '읽음' }))
  expect(await screen.findByRole('link', { name: '완독' })).toHaveAttribute('href', '/finale')
})
