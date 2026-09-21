import type { ReactNode } from 'react'
import { Routes, Route } from 'react-router'
import { BookList } from '../features/reader/BookList'
import { ChapterList } from '../features/reader/ChapterList'
import { ChapterView } from '../features/reader/ChapterView'
import { CardGallery } from '../features/cards/CardGallery'
import { PeopleGraph } from '../features/cards/PeopleGraph'
import { CompleteView } from '../features/complete/CompleteView'
import { MissionList } from '../features/missions/MissionList'
import { MissionPlay } from '../features/missions/MissionPlay'

export function AppRoutes({ home }: { home: ReactNode }) {
  return (
    <Routes>
      <Route path="/" element={home} />
      <Route path="/books" element={<BookList />} />
      <Route path="/books/:bookId" element={<ChapterList />} />
      <Route path="/read/:bookId/:chapter" element={<ChapterView />} />
      <Route path="/cards" element={<CardGallery />} />
      <Route path="/people" element={<PeopleGraph />} />
      <Route path="/complete" element={<CompleteView />} />
      <Route path="/missions" element={<MissionList />} />
      <Route path="/missions/:missionId" element={<MissionPlay />} />
    </Routes>
  )
}
