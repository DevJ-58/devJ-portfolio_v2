import { useState, useEffect } from 'react'
import { listerProjetsPublic, listerCompetencesPublic } from '@/services/portfolioPublic'

export default function usePortfolioData(projetsParDefaut = [], competencesParDefaut = []) {
  const [projets, setProjets] = useState(projetsParDefaut)
  const [competences, setCompetences] = useState(competencesParDefaut)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    let actif = true
    async function charger() {
      setChargement(true)
      try {
        const [p, c] = await Promise.all([listerProjetsPublic(), listerCompetencesPublic()])
        if (!actif) return
        if (Array.isArray(p) && p.length > 0) setProjets(p)
        else setProjets(projetsParDefaut)
        if (Array.isArray(c) && c.length > 0) setCompetences(c)
        else setCompetences(competencesParDefaut)
      } catch (e) {
        console.warn('[usePortfolioData] fetch error', e)
        setProjets(projetsParDefaut)
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
