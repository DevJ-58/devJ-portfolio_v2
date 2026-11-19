import { useRef, useState } from 'react'
import { usePortfolio } from '../moteur/contexte'
import { gsap, ScrollTrigger, useGSAP, EASE, MEDIA } from '../moteur/gsap'
import { SECTIONS } from '../donnees'

// Barre de navigation : progression du défilement, section active surlignée
// par un indicateur qui glisse, masquage au défilement vers le bas, et menu
// plein écran sur mobile.
export default function NavPortfolio() {
  const { naviguer, contenuRef } = usePortfolio()
  const navRef = useRef(null)
  const barreRef = useRef(null)
  const indicRef = useRef(null)
  const liensRef = useRef({})
  const menuRef = useRef(null)
  const [actif, setActif] = useState('hero')
  const [menuOuvert, setMenuOuvert] = useState(false)
  const actifRef = useRef('hero')

  const placerIndicateur = (id, immediat = false) => {
    const lien = liensRef.current[id]
    const indic = indicRef.current
    if (!indic) return
    if (!lien) { gsap.to(indic, { autoAlpha: 0, duration: 0.3 }); return }
    const { offsetLeft: x, offsetWidth: w } = lien
    gsap.to(indic, { x, width: w, autoAlpha: 1, duration: immediat ? 0 : 0.7, ease: EASE.sortie })
  }

  useGSAP(() => {
    const contenu = contenuRef.current
    if (!contenu) return
    // Progression globale + section active : la section qui croise la ligne
    // des 45 % de l'écran (mesure directe, fiable avec les sections épinglées)
    const wrap = contenu.parentElement
    const sections = SECTIONS.map(({ id }) => [id, document.getElementById(`pf-${id}`)]).filter(([, el]) => el)
    const majActif = () => {
      const ligne = wrap.getBoundingClientRect().top + wrap.clientHeight * 0.45
      let id = sections[0]?.[0]
      for (const [sid, el] of sections) {
        const r = el.getBoundingClientRect()
        // la dernière qui croise la ligne l'emporte (une section peut en recouvrir une autre épinglée)
        if (r.top <= ligne) id = sid
      }
      if (id && id !== actifRef.current) {
        actifRef.current = id
        setActif(id)
        placerIndicateur(id)
      }
    }
    ScrollTrigger.create({
      trigger: contenu, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => {
        if (barreRef.current) barreRef.current.style.transform = `scaleX(${self.progress})`
        majActif()
      },
      onRefresh: majActif,
    })
    // Masquer la barre en descendant vite, la rappeler en remontant
    const mm = gsap.matchMedia()
    mm.add(MEDIA.anim, () => {
      ScrollTrigger.create({
        trigger: contenu, start: 'top -120', end: 'max',
        onUpdate: (self) => {
          const cache = self.direction === 1 && self.getVelocity() > 400
          if (cache) gsap.to(navRef.current, { yPercent: -110, duration: 0.5, ease: EASE.doux, overwrite: 'auto' })
          else if (self.direction === -1) gsap.to(navRef.current, { yPercent: 0, duration: 0.6, ease: EASE.sortie, overwrite: 'auto' })
        },
        onLeaveBack: () => gsap.to(navRef.current, { yPercent: 0, duration: 0.4 }),
      })
    })
    placerIndicateur('hero', true)
    return () => mm.revert()
  }, { dependencies: [] })

  // Menu mobile : liens géants qui montent en cascade
  useGSAP(() => {
    const menu = menuRef.current
    if (!menu) return
    const liens = menu.querySelectorAll('[data-menu-lien]')
    if (menuOuvert) {
      gsap.timeline()
        .set(menu, { display: 'flex' })
        .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: EASE.rideau })
        .from(liens, { yPercent: 120, duration: 0.9, ease: EASE.sortie, stagger: 0.05 }, '-=0.35')
    } else {
      gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: EASE.rideau, onComplete: () => gsap.set(menu, { display: 'none' }) })
    }
  }, { dependencies: [menuOuvert] })

  const aller = (id) => { setMenuOuvert(false); naviguer(id) }
  const index = SECTIONS.findIndex((s) => s.id === actif)
  const liensNav = SECTIONS.filter((s) => s.id !== 'hero')

  return (
    <>
      <nav className="pf-nav" ref={navRef} aria-label="Sections du portfolio">
        <button type="button" className="pf-nav__logo" onClick={() => aller('hero')} data-magnetique>
          &lt;<span>/DevJ</span>&gt;
        </button>
        <div className="pf-nav__liens">
          <span className="pf-nav__indic" ref={indicRef} aria-hidden="true" />
          {liensNav.map(({ id, court }) => (
            <button
              key={id}
              type="button"
              ref={(el) => { liensRef.current[id] = el }}
              className={`pf-nav__lien${actif === id ? ' est-actif' : ''}`}
              aria-current={actif === id ? 'true' : undefined}
              onClick={() => aller(id)}
            >
              {court}
            </button>
          ))}
        </div>
        <div className="pf-nav__compteur" aria-hidden="true">
          <span>{String(Math.max(index, 0) + 1).padStart(2, '0')}</span>
          <i />
          <span>{String(SECTIONS.length).padStart(2, '0')}</span>
        </div>
        <button
          type="button"
          className={`pf-nav__burger${menuOuvert ? ' est-ouvert' : ''}`}
          aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOuvert}
          onClick={() => setMenuOuvert((v) => !v)}
        >
          <i /><i />
        </button>
        <span className="pf-nav__progression" ref={barreRef} aria-hidden="true" />
      </nav>

      <div className="pf-menu" ref={menuRef} style={{ display: 'none' }}>
        {SECTIONS.map(({ id, label }, i) => (
          <div key={id} className="pf-menu__masque">
            <button type="button" data-menu-lien className={actif === id ? 'est-actif' : ''} onClick={() => aller(id)}>
              <small>{String(i + 1).padStart(2, '0')}</small>{label}
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
