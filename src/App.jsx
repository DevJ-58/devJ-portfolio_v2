
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Accueil from '@/pages/Accueil'
import Experience from '@/pages/Experience'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/experience" element={<Experience />} />
      </Routes>
    </BrowserRouter>
  )
}

