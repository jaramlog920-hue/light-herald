import { AppRoutes } from './routes'
import { BookList } from '../features/reader/BookList'

export function App() {
  return <AppRoutes home={<BookList />} />
}
