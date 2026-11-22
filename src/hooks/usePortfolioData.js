import { useState, useEffect } from 'react'
import { listerProjetsPublic, listerCompetencesPublic } from '@/services/portfolioPublic'
import { PROJETS_MASQUES } from '@/donnees/projets'

// Clé de comparaison d'un titre (sans accents, casse ni ponctuation)
const cle = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')

// Projets affichés : la liste du code dans son ordre, chaque projet remplacé
// par sa version Firebase si celle-ci est à jour (modifiée depuis l'admin),
// puis les projets présents seulement dans Firebase. Les projets masqués
// ne s'affichent jamais.
export function completerProjets(enregistres, parDefaut) {
  const masques = new Set(PROJETS_MASQUES.map(cle))
  const parCle = new Map(enregistres.map((p) => [cle(p.titre), p]))
  const utilises = new Set()
  const fusion = parDefaut.map((p) => {
    const f = parCle.get(cle(p.titre))
    if (!f) return p
    utilises.add(cle(p.titre))
    if (Number(f.version || 0) >= Number(p.version || 0)) {
      // Version Firebase à jour : elle prime, les champs vides sont complétés
      const complet = { ...p, ...f }
      for (const k of ['img', 'lien', 'desc', 'categorie']) if (!f[k]) complet[k] = p[k]
      return complet
    }
    return { ...f, ...p, id: f.id }
  })
  const seulementFirebase = enregistres.filter((p) => !utilises.has(cle(p.titre)))
  return [...fusion, ...seulementFirebase]
    .filter((p) => !masques.has(cle(p.titre)))
    .map((p, i) => ({ ...p, num: String(i + 1).padStart(2, '0') }))
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
