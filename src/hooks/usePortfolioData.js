import { useState, useEffect } from 'react'
import { listerProjetsPublic, listerCompetencesPublic } from '@/services/portfolioPublic'

// Clé de comparaison d'un titre (sans accents, casse ni ponctuation)
const cle = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')

// Projets de Firebase, complétés par ceux de la liste du code qui n'y sont
// pas encore : un projet ajouté au code apparaît sans import manuel.
export function completerProjets(enregistres, parDefaut) {
  const connus = new Set(enregistres.map((p) => cle(p.titre)))
  return [...enregistres, ...parDefaut.filter((p) => !connus.has(cle(p.titre)))]
}

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
        if (Array.isArray(p) && p.length > 0) setProjets(completerProjets(p, projetsParDefaut))
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
