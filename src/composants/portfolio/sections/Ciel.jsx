import { useEffect, useRef } from 'react'
import { mouvementReduit } from '../moteur/gsap'

// Ciel étoilé (canvas 2D) de la scène des projets : étoiles qui scintillent
// et dérivent légèrement selon la souris. Ne tourne que lorsqu'il est visible.
export default function Ciel({ couleur = '255,255,255', densite = 0.00016 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0, h = 0, etoiles = [], raf = null, visible = false
    let sx = 0, sy = 0, cx = 0, cy = 0
    const statique = mouvementReduit()

    const generer = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width; h = r.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(w * h * densite)
      etoiles = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() < 0.08 ? 1.1 + Math.random() * 0.9 : 0.3 + Math.random() * 0.7,
        p: Math.random() * Math.PI * 2, v: 0.4 + Math.random() * 1.4,
        z: 0.2 + Math.random() * 0.8,
      }))
    }

    const dessiner = (t) => {
      ctx.clearRect(0, 0, w, h)
      cx += (sx - cx) * 0.04; cy += (sy - cy) * 0.04
      for (const e of etoiles) {
        const a = statique ? 0.6 : 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(e.p + t * 0.001 * e.v))
        const x = (e.x + cx * e.z * 30 + w) % w
        const y = (e.y + cy * e.z * 20 + h) % h
        ctx.globalAlpha = a * (0.35 + e.z * 0.65)
        ctx.fillStyle = `rgb(${couleur})`
        ctx.beginPath(); ctx.arc(x, y, e.r, 0, Math.PI * 2); ctx.fill()
        if (e.r > 1.2) {
          ctx.globalAlpha = a * 0.25
          ctx.fillRect(x - e.r * 3, y - 0.3, e.r * 6, 0.6)
          ctx.fillRect(x - 0.3, y - e.r * 3, 0.6, e.r * 6)
        }
      }
      ctx.globalAlpha = 1
    }

    const boucle = (t) => { dessiner(t); raf = visible && !statique ? requestAnimationFrame(boucle) : null }
    const demarrer = () => { if (!raf && visible && !statique) raf = requestAnimationFrame(boucle) }

    generer(); dessiner(0)
    const ro = new ResizeObserver(() => { generer(); dessiner(performance.now()) })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) demarrer() })
    io.observe(canvas)
    const souris = (e) => { sx = e.clientX / window.innerWidth - 0.5; sy = e.clientY / window.innerHeight - 0.5 }
    window.addEventListener('pointermove', souris)
    return () => {
      ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', souris)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [couleur, densite])

  return <canvas ref={ref} className="pf-ciel" aria-hidden="true" />
}
