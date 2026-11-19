import { useRef } from 'react'
import { usePortfolio } from '../moteur/contexte'
import { gsap, useGSAP, MEDIA } from '../moteur/gsap'

// Curseur personnalisé (souris uniquement) :
// - un point qui suit exactement, un anneau qui suit avec inertie ;
// - au survol d'un élément [data-curseur="Texte"], l'anneau grossit et
//   affiche le texte ;
// - les éléments [data-magnetique] sont attirés par le pointeur.
export default function Curseur() {
  const { wrapRef } = usePortfolio()
  const pointRef = useRef(null)
  const anneauRef = useRef(null)
  const texteRef = useRef(null)

  useGSAP(() => {
    const wrap = wrapRef.current
    const point = pointRef.current
    const anneau = anneauRef.current
    if (!wrap || !point || !anneau) return
    const mm = gsap.matchMedia()
    mm.add(MEDIA.pointeurFin, () => {
      wrap.classList.add('pf-curseur-actif')
      gsap.set([point, anneau], { xPercent: -50, yPercent: -50, autoAlpha: 0 })
      const px = gsap.quickTo(point, 'x', { duration: 0.08, ease: 'power3' })
      const py = gsap.quickTo(point, 'y', { duration: 0.08, ease: 'power3' })
      const ax = gsap.quickTo(anneau, 'x', { duration: 0.55, ease: 'power3' })
      const ay = gsap.quickTo(anneau, 'y', { duration: 0.55, ease: 'power3' })
      let magnet = null
      let mx = null
      let my = null

      const relacher = () => {
        if (!magnet) return
        gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
        magnet = null
      }

      const bouger = (e) => {
        px(e.clientX); py(e.clientY); ax(e.clientX); ay(e.clientY)
        gsap.to([point, anneau], { autoAlpha: 1, duration: 0.3, overwrite: 'auto' })

        // Étiquette contextuelle
        const cible = e.target.closest?.('[data-curseur]')
        const lien = e.target.closest?.('a, button, [role="button"]')
        const texte = cible?.dataset.curseur || ''
        if (texteRef.current.textContent !== texte) texteRef.current.textContent = texte
        anneau.classList.toggle('a-texte', !!texte)
        anneau.classList.toggle('sur-lien', !texte && !!lien)

        // Aimant
        const m = e.target.closest?.('[data-magnetique]')
        if (m !== magnet) { relacher(); magnet = m }
        if (magnet) {
          const r = magnet.getBoundingClientRect()
          if (!mx) { mx = gsap.quickTo(magnet, 'x', { duration: 0.5, ease: 'power3' }); my = gsap.quickTo(magnet, 'y', { duration: 0.5, ease: 'power3' }) }
          mx((e.clientX - (r.left + r.width / 2)) * 0.32)
          my((e.clientY - (r.top + r.height / 2)) * 0.32)
        } else { mx = null; my = null }
      }
      const sortir = () => { gsap.to([point, anneau], { autoAlpha: 0, duration: 0.3 }); relacher() }
      const presser = () => gsap.to(anneau, { scale: 0.8, duration: 0.15 })
      const lacher = () => gsap.to(anneau, { scale: 1, duration: 0.4, ease: 'back.out(3)' })

      wrap.addEventListener('pointermove', bouger)
      wrap.addEventListener('pointerleave', sortir)
      wrap.addEventListener('pointerdown', presser)
      wrap.addEventListener('pointerup', lacher)
      return () => {
        wrap.classList.remove('pf-curseur-actif')
        wrap.removeEventListener('pointermove', bouger)
        wrap.removeEventListener('pointerleave', sortir)
        wrap.removeEventListener('pointerdown', presser)
        wrap.removeEventListener('pointerup', lacher)
      }
    })
    return () => mm.revert()
  }, { dependencies: [] })

  return (
    <>
      <span className="pf-curseur-point" ref={pointRef} aria-hidden="true" />
      <span className="pf-curseur-anneau" ref={anneauRef} aria-hidden="true">
        <span ref={texteRef} />
      </span>
    </>
  )
}
