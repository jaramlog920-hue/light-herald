import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../../app/App'
import { useProgress } from '../../store/progress'
import { getMission } from './grade'

beforeEach(() => {
  useProgress.setState(useProgress.getInitialState())
  localStorage.clear()
})

const at = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

test('mission locked until chapter read', () => {
  at('/missions/mat:16:quiz')
  expect(screen.getByText(/읽으면 열립니다/)).toBeInTheDocument()
})

test('quiz: wrong shows verse hint, right clears mission', async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('mat:16')
  at('/missions/mat:16:quiz')
  await user.click(screen.getByRole('button', { name: '요한' }))
  expect(screen.getByRole('status')).toHaveTextContent('마 16:16')
  await user.click(screen.getByRole('button', { name: '다시 도전' }))
  await user.click(screen.getByRole('button', { name: '베드로' }))
  expect(screen.getByRole('status')).toHaveTextContent('기록이 복원')
  expect(useProgress.getState().missions['mat:16:quiz']).toBeTruthy()
})

test('word puzzle rewards a gem; hint spends it', async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('mat:5')
  useProgress.getState().markRead('mat:3')
  at('/missions/mat:5:word-puzzle')
  const m = getMission('mat:5:word-puzzle')!
  if (m.type !== 'word-puzzle') throw new Error()
  for (const w of m.words) await user.click(screen.getByRole('button', { name: w }))
  await user.click(screen.getByRole('button', { name: '완성' }))
  expect(useProgress.getState().gems).toBe(1)

  // 힌트는 보석을 소모한다
  at('/missions/mat:3:quiz')
  await user.click(screen.getAllByRole('button', { name: /힌트/ })[0])
  expect(screen.getByRole('note')).toHaveTextContent('낙타털')
  expect(useProgress.getState().gems).toBe(0)
})

test('voyage and detective and deliver and choice grade through UI', async () => {
  const user = userEvent.setup()
  for (const r of ['act:27', 'luk:15', 'rom:1', 'luk:10']) useProgress.getState().markRead(r)

  at('/missions/act:27:voyage')
  for (const c of ['가이사랴', '그레데', '멜리데', '로마']) await user.click(screen.getByRole('button', { name: c }))
  await user.click(screen.getByRole('button', { name: '항해 출발' }))
  expect(screen.getByRole('status')).toHaveTextContent('복원')

  at('/missions/luk:15:gospel-detective')
  await user.click(screen.getAllByRole('button', { name: '누가복음' })[0])
  await user.click(screen.getByRole('button', { name: '확인' }))
  expect(useProgress.getState().missions['luk:15:gospel-detective']).toBeTruthy()

  at('/missions/rom:1:deliver')
  await user.click(screen.getAllByRole('button', { name: '로마' })[0])
  expect(useProgress.getState().missions['rom:1:deliver']).toBeTruthy()

  at('/missions/luk:10:choice')
  await user.click(screen.getByRole('button', { name: /상처를 싸매고/ }))
  expect(useProgress.getState().missions['luk:10:choice']).toBeTruthy()
})

test('mission list shows lock state and reward sheet links to mission', { timeout: 20000 }, async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('jhn:3')
  at('/missions')
  expect(screen.getAllByRole('link', { name: /^3장 · 말씀 조각 맞추기/ })[0]).not.toHaveClass('locked')
  expect(screen.getByRole('link', { name: /🔒 16장 · 누가 이 말을/ })).toHaveClass('locked')

  at('/read/mat/16')
  await user.click(screen.getByRole('button', { name: '읽음' }))
  expect(screen.getAllByRole('link', { name: /미션 해금/ })[0]).toHaveAttribute('href', '/missions/mat:16:quiz')
})

test('word puzzle shows gem message once', async () => {
  const user = userEvent.setup()
  useProgress.getState().markRead('mat:5')
  at('/missions/mat:5:word-puzzle')
  const m = getMission('mat:5:word-puzzle')!
  if (m.type !== 'word-puzzle') throw new Error()
  for (const w of m.words) await user.click(screen.getByRole('button', { name: w }))
  await user.click(screen.getByRole('button', { name: '완성' }))
  expect(screen.getByRole('status')).toHaveTextContent('약속의 보석을 얻었습니다')
  expect(screen.getByRole('status')).toHaveTextContent('보유 1개')
})
