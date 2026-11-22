import { useEffect } from 'react'
import accesAdmin from '@/store/accesAdmin'

const SEQUENCE = 'frejus'
const DELAI = 1500 // ms maximum entre deux lettres

// Raccourci secret : maintenir Ctrl et taper F, R, E, J, U, S.
// Les lettres de la séquence sont interceptées (Ctrl+F, Ctrl+R… n'ouvrent
// pas leur action habituelle du navigateur pendant la saisie).
export function useAccesSecret() {
  useEffect(() => {
    let position = 0
    let dernier = 0
    const surTouche = (e) => {
      if (!e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) { if (e.key !== 'Control') position = 0; return }
      const lettre = e.key.toLowerCase()
      if (lettre.length !== 1) return
      const maintenant = performance.now()
      if (maintenant - dernier > DELAI) position = 0
      if (lettre === SEQUENCE[position]) {
        e.preventDefault()
        position += 1
        dernier = maintenant
        if (position === SEQUENCE.length) { position = 0; accesAdmin.getState().ouvrir() }
      } else {
        position = lettre === SEQUENCE[0] ? 1 : 0
        if (position) { e.preventDefault(); dernier = maintenant }
      }
    }
    const surRelache = (e) => { if (e.key === 'Control') position = 0 }
    window.addEventListener('keydown', surTouche, true)
    window.addEventListener('keyup', surRelache, true)
    return () => {
      window.removeEventListener('keydown', surTouche, true)
      window.removeEventListener('keyup', surRelache, true)
    }
  }, [])
}

// Compteur de touches rapides (mobile) : n touches en moins de `fenetre` ms
export function creerCompteurTouches(n = 5, fenetre = 2500) {
  let touches = []
  return () => {
    const t = performance.now()
    touches = [...touches.filter((x) => t - x < fenetre), t]
    if (touches.length >= n) { touches = []; accesAdmin.getState().ouvrir() }
  }
}
