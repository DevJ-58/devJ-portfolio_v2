import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePortfolio } from '../moteur/contexte'
import { gsap, ScrollTrigger, useGSAP, EASE, mouvementReduit } from '../moteur/gsap'
import { SECTIONS, contacts, reseaux } from '../donnees'
import PanneauParametres from '@/composants/ui/PanneauParametres'

// Navigation minimale : un monogramme en haut à gauche et une forme
// organique en haut à droite qui fait office de menu. Un anneau autour de la
// forme indique la progression du défilement.
// Le menu s'ouvre en cercle depuis la forme : liens géants, aperçu de la
// section survolée, contacts et réglages d'affichage.
export default function NavPortfolio() {
  const { naviguer, contenuRef, lenisRef, accesDirecte } = usePortfolio()
  const navigate = useNavigate()
  const monoRef = useRef(null)
  const burgerRef = useRef(null)
  const anneauRef = useRef(null)
  const menuRef = useRef(null)
  const tlRef = useRef(null)
  const [actif, setActif] = useState('hero')
  const [survol, setSurvol] = useState(null)
  const [ouvert, setOuvert] = useState(false)
  const actifRef = useRef('hero')

  // Progression (anneau) + section active
  useGSAP(() => {
    const contenu = contenuRef.current
    if (!contenu) return
    const wrap = contenu.parentElement
    const sections = SECTIONS.map(({ id }) => [id, document.getElementById(`pf-${id}`)]).filter(([, el]) => el)
    const perimetre = 2 * Math.PI * 30
    const majActif = () => {
      const ligne = wrap.getBoundingClientRect().top + wrap.clientHeight * 0.45
      let id = sections[0]?.[0]
      // la dernière qui croise la ligne l'emporte (une section peut en recouvrir une autre épinglée)
      for (const [sid, el] of sections) if (el.getBoundingClientRect().top <= ligne) id = sid
      if (id && id !== actifRef.current) { actifRef.current = id; setActif(id) }
    }
    ScrollTrigger.create({
      trigger: contenu, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => {
        if (anneauRef.current) anneauRef.current.style.strokeDashoffset = String(perimetre * (1 - self.progress))
        // Le monogramme s'efface une fois le portrait passé (il chevaucherait le contenu)
        monoRef.current?.classList.toggle('est-cache', self.scroll() > wrap.clientHeight * 0.55)
        majActif()
      },
      onRefresh: majActif,
    })
  }, { dependencies: [] })

  // Ouverture / fermeture : cercle qui part de la forme
  useGSAP(() => {
    const menu = menuRef.current
    const b = burgerRef.current?.getBoundingClientRect()
    if (!menu || !b) return
    const origine = `${b.left + b.width / 2}px ${b.top + b.height / 2}px`
    const q = gsap.utils.selector(menu)
    const reduit = mouvementReduit()
    const lenis = lenisRef.current
    tlRef.current?.kill()
    if (ouvert) {
      lenis?.stop()
      const tl = gsap.timeline()
      tl.set(menu, { display: 'grid' })
        .fromTo(menu, { clipPath: `circle(0px at ${origine})` }, { clipPath: `circle(150vmax at ${origine})`, duration: reduit ? 0 : 1, ease: EASE.drame })
      if (!reduit) {
        tl.fromTo(q('[data-lien]'), { yPercent: 115 }, { yPercent: 0, duration: 1, ease: EASE.sortie, stagger: 0.045 }, 0.3)
          .fromTo(q('[data-cote] > *'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: EASE.sortie, stagger: 0.08 }, 0.45)
      }
      tlRef.current = tl
      q('[data-lien]')[0]?.focus({ preventScroll: true })
    } else if (menu.style.display !== 'none') {
      lenis?.start()
      tlRef.current = gsap.timeline({ onComplete: () => gsap.set(menu, { display: 'none' }) })
        .to(menu, { clipPath: `circle(0px at ${origine})`, duration: reduit ? 0 : 0.75, ease: EASE.drame })
    }
  }, { dependencies: [ouvert] })

  // Échap ferme le menu
  useEffect(() => {
    if (!ouvert) return
    const echap = (e) => { if (e.key === 'Escape') { setOuvert(false); burgerRef.current?.focus() } }
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [ouvert])

  const aller = (id) => {
    setOuvert(false)
    // laisse le menu commencer à se refermer, puis défile
    setTimeout(() => naviguer(id), mouvementReduit() ? 0 : 280)
  }

  const index = Math.max(0, SECTIONS.findIndex((s) => s.id === actif))
  const vise = SECTIONS.find((s) => s.id === (survol || actif)) || SECTIONS[0]
  const numVise = String(SECTIONS.indexOf(vise) + 1).padStart(2, '0')

  return (
    <>
      <button type="button" ref={monoRef} className={`pf-monogramme${ouvert ? ' est-force' : ''}`} onClick={() => aller('hero')} aria-label="Revenir au début" data-magnetique>
        &lt;<span>/DevJ</span>&gt;
      </button>

      <button
        type="button"
        ref={burgerRef}
        className={`pf-burger${ouvert ? ' est-ouvert' : ''}`}
        aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={ouvert}
        aria-controls="pf-menu"
        onClick={() => setOuvert((v) => !v)}
        data-magnetique
      >
        <svg className="pf-burger__anneau" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="30" className="fond" />
          <circle cx="32" cy="32" r="30" className="progres" ref={anneauRef} style={{ strokeDasharray: 2 * Math.PI * 30, strokeDashoffset: 2 * Math.PI * 30 }} />
        </svg>
        <span className="pf-burger__forme" aria-hidden="true" />
        <span className="pf-burger__traits" aria-hidden="true"><i /><i /></span>
        <span className="pf-burger__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      </button>

      <div id="pf-menu" className="pf-menu" ref={menuRef} style={{ display: 'none' }} data-lenis-prevent role="dialog" aria-modal="true" aria-label="Menu du portfolio">
        <span className="pf-menu__num" aria-hidden="true" key={numVise}>{numVise}</span>

        <nav className="pf-menu__liens" aria-label="Sections">
          <ol onPointerLeave={() => setSurvol(null)}>
            {SECTIONS.map(({ id, label }, i) => (
              <li key={id} className={actif === id ? 'est-actif' : ''}>
                <button
                  type="button"
                  data-lien
                  onClick={() => aller(id)}
                  onPointerEnter={() => setSurvol(id)}
                  onFocus={() => setSurvol(id)}
                  aria-current={actif === id ? 'true' : undefined}
                >
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  <span className="pf-roule"><span>{label}</span><span aria-hidden="true">{label}</span></span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <aside className="pf-menu__cote" data-cote>
          <div className="pf-menu__apercu">
            <span className="pf-label"><b>{numVise}</b> {vise.label}</span>
            <p>{vise.desc}</p>
          </div>
          <ul className="pf-menu__contacts">
            {contacts.slice(0, 3).map(({ label, val, href }) => (
              <li key={label}>
                <small>{label}</small>
                <a className="pf-lien" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{val}</a>
              </li>
            ))}
          </ul>
          <div className="pf-menu__reseaux">
            {reseaux.map(({ label, href }) => (
              <a key={label} className="pf-lien" href={href} target="_blank" rel="noopener noreferrer">{label}</a>
            ))}
          </div>
          {accesDirecte && (
            <button type="button" className="pf-menu__axis" onClick={() => navigate('/')}>
              <span aria-hidden="true">◈</span> Parler à AXIS, l'IA de Fréjus
            </button>
          )}
          <PanneauParametres variante="integre" />
        </aside>
      </div>
    </>
  )
}
