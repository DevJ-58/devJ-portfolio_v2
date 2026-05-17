
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Accueil from '@/pages/Accueil'
import Experience from '@/pages/Experience'
import PortfolioPage from '@/pages/PortfolioPage'
import ProjetsFull from '@/composants/ProjetsFull'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/projets" element={<ProjetsFull />} />
      </Routes>
    </BrowserRouter>
  )
}

