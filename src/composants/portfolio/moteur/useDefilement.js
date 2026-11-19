// Défilement fluide du portfolio : Lenis pilote le conteneur #pf-wrap et
// ScrollTrigger se met à jour sur le même battement (ticker GSAP).
import { useCallback, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, mouvementReduit } from './gsap'

export default function useDefilement(wrapRef, contenuRef) {
  const lenisRef = useRef(null)

  useEffect(() => {
    const wrapper = wrapRef.current
    const content = contenuRef.current
    if (!wrapper || !content) return

    let lenis = null
    let tick = null
    if (!mouvementReduit()) {
      lenis = new Lenis({
        wrapper,
        content,
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false, // défilement natif au doigt : plus fiable sur mobile
        wheelMultiplier: 0.95,
      })
      lenis.on('scroll', ScrollTrigger.update)
      tick = (t) => lenis.raf(t * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      lenisRef.current = lenis
    }

    // Recalcul quand les polices et les images ont fini de charger
    // (capture : l'événement load des images ne remonte pas)
    let minuteur = null
    const recalculer = () => { clearTimeout(minuteur); minuteur = setTimeout(() => ScrollTrigger.refresh(), 120) }
    document.fonts?.ready?.then(recalculer)
    content.addEventListener('load', recalculer, true)

    return () => {
      clearTimeout(minuteur)
      content.removeEventListener('load', recalculer, true)
      if (tick) gsap.ticker.remove(tick)
      lenis?.destroy()
      lenisRef.current = null
    }
  }, [wrapRef, contenuRef])

  // Position réelle d'une section, y compris quand elle est épinglée
  const positionDe = useCallback((el) => {
    const wrap = wrapRef.current
    if (!wrap || !el) return 0
    const cible = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
    return cible.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop
  }, [wrapRef])

  // Aller à une position (nombre) ou à un élément
  const allerA = useCallback((cible, { immediat = false, decalage = 0 } = {}) => {
    const wrap = wrapRef.current
    if (!wrap) return
    const y = (typeof cible === 'number' ? cible : positionDe(cible)) + decalage
    const lenis = lenisRef.current
    if (lenis) lenis.scrollTo(y, { immediate: immediat, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
    else wrap.scrollTo({ top: y, behavior: immediat ? 'auto' : 'smooth' })
  }, [wrapRef, positionDe])

  return { lenisRef, allerA, positionDe }
}
