import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function useLenisScroll(wrapRef, enable = true) {
  const lenisRef = useRef(null)

  useEffect(() => {
    if (!enable || !wrapRef.current) return

    // Initialiser Lenis sur l'élément wrap
    const lenis = new Lenis({
      wrapper: wrapRef.current,
      lerp: 0.1,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    })

    lenisRef.current = lenis

    const raf = (time) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const id = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(id)
      lenis.destroy?.()
      lenisRef.current = null
    }
  }, [enable, wrapRef])

  return lenisRef
}
