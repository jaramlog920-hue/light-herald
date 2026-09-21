import type { ReactNode } from 'react'
import { Routes, Route } from 'react-router'
import { BookList } from '../features/reader/BookList'
import { ChapterList } from '../features/reader/ChapterList'
import { ChapterView } from '../features/reader/ChapterView'
import { CardGallery } from '../features/cards/CardGallery'
import { PeopleGraph } from '../features/cards/PeopleGraph'

export function AppRoutes({ home }: { home: ReactNode }) {
  return (
    <Routes>
      <Route path="/" element={home} />
      <Route path="/books" element={<BookList />} />
      <Route path="/books/:bookId" element={<ChapterList />} />
      <Route path="/read/:bookId/:chapter" element={<ChapterView />} />
      <Route path="/cards" element={<CardGallery />} />
      <Route path="/people" element={<PeopleGraph />} />
    </Routes>
  )
}
