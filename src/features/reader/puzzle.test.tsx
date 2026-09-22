import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress } from '../../store/progress'
import { puzzleGrid } from './ChapterList'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

test('puzzle grid keeps 3:2 picture for any chapter count', () => {
  for (const n of [1, 3, 4, 5, 13, 16, 21, 22, 24, 28]) {
    const { cols, rows, cellAspect } = puzzleGrid(n)
    expect(cols * rows).toBeGreaterThanOrEqual(n)
    expect((cols * 1) / (rows * cellAspect)).toBeCloseTo(1.5)
  }
})

test('read chapters reveal pieces; full book opens the picture', async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('phm:1')
  render(
    <MemoryRouter initialEntries={['/books/3jn']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: '1장' }).parentElement).not.toHaveClass('revealed')
  expect(screen.queryByRole('button', { name: /그림 열기/ })).not.toBeInTheDocument()

  useProgress.getState().markRead('3jn:1')
  const piece = await screen.findByRole('link', { name: '1장 (읽음)' })
  expect(piece.parentElement).toHaveClass('revealed')
  expect(piece.parentElement!.style.backgroundImage).toContain('/assets/books/3jn.webp')
  await user.click(screen.getByRole('button', { name: /그림 열기/ }))
  expect(screen.getByRole('dialog', { name: '요한삼서 그림' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /요한삼서 대표 그림/ })).toHaveAttribute('src', '/assets/books/3jn.webp')
})
