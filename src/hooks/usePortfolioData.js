import { useState, useEffect } from 'react'
import { listerProjetsPublic, listerCompetencesPublic } from '@/services/portfolioPublic'

export default function usePortfolioData(competencesParDefaut = []) {
  const [projets, setProjets] = useState([])
  const [competences, setCompetences] = useState(competencesParDefaut)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    let actif = true
    async function charger() {
      setChargement(true)
      try {
        const [p, c] = await Promise.all([listerProjetsPublic(), listerCompetencesPublic()])
        if (!actif) return
        // Projets : uniquement ceux de la base (gérés depuis l'admin)
        setProjets(Array.isArray(p) ? p : [])
        if (Array.isArray(c) && c.length > 0) setCompetences(c)
        else setCompetences(competencesParDefaut)
      } catch (e) {
        console.warn('[usePortfolioData] fetch error', e)
        setProjets([])
        setCompetences(competencesParDefaut)
      } finally {
        if (actif) setChargement(false)
      }
    }
    charger()
    return () => { actif = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { projets, competences, chargement }
}
