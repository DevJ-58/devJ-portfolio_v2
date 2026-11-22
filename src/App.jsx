import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Accueil from '@/pages/Accueil'
import Experience from '@/pages/Experience'
import PortfolioPage from '@/pages/PortfolioPage'
import ProjetsFull from '@/composants/ProjetsFull'
import accesAdmin from '@/store/accesAdmin'
import { useAccesSecret } from '@/hooks/useAccesSecret'

// L'espace admin n'a pas d'URL : son code n'est chargé qu'après le geste secret
const EspaceAdmin = lazy(() => import('@/admin/EspaceAdmin'))

export default function App() {
  useAccesSecret()
  const adminOuvert = accesAdmin((s) => s.ouvert)
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/projets" element={<ProjetsFull />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {adminOuvert && (
        <Suspense fallback={null}>
          <EspaceAdmin />
        </Suspense>
      )}
    </BrowserRouter>
  )
}
