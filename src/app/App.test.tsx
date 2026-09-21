import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from './App'

test('renders app title', () => {
  render(<MemoryRouter><App /></MemoryRouter>)
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})
