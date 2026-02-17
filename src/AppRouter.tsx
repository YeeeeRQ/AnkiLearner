import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Home from './pages/Home'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import DeckDetail from './pages/DeckDetail'
import Study from './pages/Study'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="deck/:id" element={<DeckDetail />} />
        <Route path="deck/:id/study" element={<Study />} />
        <Route path="study" element={<Study />} />
        <Route path="stats" element={<Stats />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
