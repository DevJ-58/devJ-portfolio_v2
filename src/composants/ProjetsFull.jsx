import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Lenis from 'lenis'
import utiliserTheme from '@/store/utiliserTheme'
import usePortfolioData from '@/hooks/usePortfolioData'
import { PROJETS } from '@/donnees/projets'
import ProjectsScene from '@/composants/ui/projets3d/ProjectsScene'
import { genererPositions } from '@/composants/ui/projets3d/scenePositions'
import ProjectDetailOverlay from '@/composants/ui/projets3d/ProjectDetailOverlay'
import { gsap, ScrollTrigger, EASE, MEDIA, useGSAP, mouvementReduit } from '@/composants/portfolio/moteur/gsap'
import { animerAttributs, animerBandeau } from '@/composants/portfolio/moteur/animer'
import { variablesTheme } from '@/composants/portfolio/moteur/contexte'
import '@/composants/portfolio/portfolio.css'

const PROJETS_PAR_DEFAUT = PROJETS

const CATEGORIES = {
  frontend: { label: 'Frontend', icon: 'layout', color: '#5DCAA5', textDark: true },
  fullstack: { label: 'Fullstack', icon: 'server', color: '#378ADD', textDark: false },
  ia: { label: 'IA & Data', icon: 'cpu', color: '#D4537E', textDark: false },
  impact: { label: 'Impact social', icon: 'heart', color: '#EF9F27', textDark: true },
}

// Galerie complète des projets : en-tête éditorial, filtres, scène 3D
// (inchangée) et index en grandes lignes avec aperçu qui suit le curseur.
// Page toujours sombre (galerie de nuit), accent du thème.
export default function ProjetsFull() {
  const { theme, getThemeEffectif } = utiliserTheme()
  const eff = getThemeEffectif ? getThemeEffectif() : theme
  // La galerie est sombre : on garde les couleurs du mode sombre
  const vars = { ...variablesTheme({ ...eff, accent: eff.accentVif || theme.accent, accentRgb: eff.accentVifRgb || theme.accentRgb, fond: '#050608', fondSecondaire: '#0a0c10', texte: '#f2f0ec', textHigh: 'rgba(255,255,255,0.88)', textMedium: 'rgba(255,255,255,0.74)', textMuted: 'rgba(255,255,255,0.62)', textFaint: 'rgba(255,255,255,0.5)', borderStrong: 'rgba(255,255,255,0.14)', borderMedium: 'rgba(255,255,255,0.09)', borderLight: 'rgba(255,255,255,0.06)', cardBg: 'rgba(255,255,255,0.03)', glassOverlay: 'rgba(8,10,14,0.85)', navOverlay: 'rgba(5,6,8,0.85)', shadow: 'rgba(0,0,0,0.5)' }, false) }
  const a = vars['--a']
  const navigate = useNavigate()
  const ref = useRef(null)
  const filtresRef = useRef(null)
  const indicRef = useRef(null)
  const apercuRef = useRef(null)
  const [filtre, setFiltre] = useState('TOUS')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [projetSelectionne, setProjetSelectionne] = useState(null)
  const [survol, setSurvol] = useState(null)
  // Visite guidée : un projet après l'autre, sans empêcher la manipulation
  const [focusIndex, setFocusIndex] = useState(0)
  const [enPause, setEnPause] = useState(() => mouvementReduit())
  const [manipule, setManipule] = useState(false)
  const [sceneVisible, setSceneVisible] = useState(false)
  const reprise = useRef(null)
  const sceneRef = useRef(null)

  const { projets: projetsData } = usePortfolioData(PROJETS_PAR_DEFAUT, [])
  const projets = useMemo(() => projetsData.map((p, i) => ({
    ...p,
    num: p.num || String(i + 1).padStart(2, '0'),
    tags: Array.isArray(p.tags) ? p.tags : p.tags ? Object.values(p.tags) : [],
  })), [projetsData])

  const fermerDetail = () => setProjetSelectionne(null)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    const echap = (e) => { if (e.key === 'Escape') setProjetSelectionne(null) }
    window.addEventListener('resize', h)
    window.addEventListener('keydown', echap)
    return () => { window.removeEventListener('resize', h); window.removeEventListener('keydown', echap) }
  }, [])

  // Défilement fluide de la page (fenêtre)
  useEffect(() => {
    window.scrollTo(0, 0)
    if (mouvementReduit()) return
    ScrollTrigger.defaults({ scroller: window })
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tic = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tic)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(tic); lenis.destroy() }
  }, [])

  const projetsFiltres = filtre === 'TOUS' ? projets : projets.filter((p) => p.type === filtre)
  const nb = projetsFiltres.length
  const iFocus = nb > 0 ? Math.min(focusIndex, nb - 1) : 0
  const projetFocus = projetsFiltres[iFocus]
  const positions = useMemo(() => genererPositions(nb), [nb])
  const enLecture = !enPause && !manipule && !projetSelectionne && sceneVisible && nb > 1
  const aller = (i) => setFocusIndex(((i % nb) + nb) % nb)

  // Après une manipulation, la visite reprend seule au bout de quelques secondes
  const surManipulation = (actif) => {
    clearTimeout(reprise.current)
    if (actif) setManipule(true)
    else reprise.current = setTimeout(() => setManipule(false), 5000)
  }
  useEffect(() => () => clearTimeout(reprise.current), [])

  // La visite ne tourne que lorsque la scène est à l'écran
  useEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setSceneVisible(e.isIntersecting), { threshold: 0.35 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Chorégraphie de la page
  useGSAP(() => {
    const q = gsap.utils.selector(ref)
    const mm = gsap.matchMedia()
    mm.add({ anim: MEDIA.anim, bureau: MEDIA.bureau }, (c) => {
      if (!c.conditions.anim) return
      animerAttributs(ref.current)
      const b = animerBandeau(q('[data-bandeau]')[0], { vitesse: 60, declencheurEl: q('[data-entete]')[0] })
      gsap.fromTo(q('[data-scene]'),
        { clipPath: 'inset(10% 8% 10% 8% round 40px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 20px)', ease: 'none', scrollTrigger: { trigger: q('[data-scene]')[0], start: 'top bottom', end: 'center center', scrub: true } })
      gsap.fromTo(q('[data-ligne]'), { yPercent: 60, autoAlpha: 0 }, {
        yPercent: 0, autoAlpha: 1, duration: 1, ease: EASE.sortie, stagger: 0.07,
        scrollTrigger: { trigger: q('[data-index]')[0], start: 'top 80%', toggleActions: 'play none none reverse' },
      })
      gsap.fromTo(q('[data-monogramme]'), { yPercent: 50 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: q('[data-pied]')[0], start: 'top bottom', end: 'bottom bottom', scrub: true } })

      // Aperçu d'image qui suit le curseur au survol de l'index (bureau)
      if (c.conditions.bureau && apercuRef.current) {
        const ap = apercuRef.current
        gsap.set(ap, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.7 })
        const ax = gsap.quickTo(ap, 'x', { duration: 0.6, ease: 'power3' })
        const ay = gsap.quickTo(ap, 'y', { duration: 0.6, ease: 'power3' })
        const index = q('[data-index]')[0]
        const bouger = (e) => { ax(e.clientX); ay(e.clientY) }
        const entrer = () => gsap.to(ap, { autoAlpha: 1, scale: 1, duration: 0.5, ease: EASE.sortie })
        const sortir = () => gsap.to(ap, { autoAlpha: 0, scale: 0.7, duration: 0.4, ease: EASE.doux })
        index.addEventListener('pointermove', bouger)
        index.addEventListener('pointerenter', entrer)
        index.addEventListener('pointerleave', sortir)
        return () => {
          b?.kill()
          index.removeEventListener('pointermove', bouger)
          index.removeEventListener('pointerenter', entrer)
          index.removeEventListener('pointerleave', sortir)
        }
      }
      return () => b?.kill()
    })
    return () => mm.revert()
  }, { scope: ref, dependencies: [projets.length], revertOnUpdate: true })

  // Indicateur des filtres qui glisse vers le filtre actif
  useGSAP(() => {
    const zone = filtresRef.current
    const indic = indicRef.current
    const actif = zone?.querySelector('[aria-pressed="true"]')
    if (!actif || !indic) return
    const couleur = filtre === 'TOUS' ? a : CATEGORIES[filtre]?.color || a
    gsap.to(indic, { x: actif.offsetLeft, width: actif.offsetWidth, backgroundColor: couleur, duration: mouvementReduit() ? 0 : 0.6, ease: EASE.sortie })
  }, { dependencies: [filtre, isMobile, projets.length] })

  const filtres = [['TOUS', 'Tous', a], ...Object.entries(CATEGORIES).map(([k, c]) => [k, c.label, c.color])]
  const apercu = projets[survol] || null

  return (
    <div className="pj-page est-sombre" ref={ref} style={vars}>
      <nav className="pj-nav">
        <button type="button" className="pf-lien" onClick={() => navigate('/experience', { state: { skipGreeting: true } })}>← Retour</button>
        <span className="pj-nav__logo">&lt;<span>/DevJ</span>&gt;</span>
        <span className="pf-entete__note">{String(projetsFiltres.length).padStart(2, '0')} projets</span>
      </nav>

      <header className="pj-entete" data-entete>
        <div className="pj-entete__bandeau" aria-hidden="true">
          <div className="pf-bandeau__piste" data-bandeau>
            {Array.from({ length: 4 }).map((_, i) => <span key={i}>Work · Travaux ·</span>)}
          </div>
        </div>
        <span className="pf-label" data-a="fondu"><b>04</b> Portfolio complet</span>
        <h1 className="pf-titre-giga" data-a="chars">Tous mes <em className="pf-it">projets</em></h1>
        <p className="pf-corps pf-corps--grand" data-a="lignes">
          {projets.length} projets réalisés entre 2023 et 2024 — du frontend au fullstack, de la culture ivoirienne à la télémédecine.
        </p>
      </header>

      <div className="pj-filtres" ref={filtresRef} role="group" aria-label="Filtrer par catégorie">
        <span className="pj-filtres__indic" ref={indicRef} aria-hidden="true" />
        {filtres.map(([cle, label, couleur]) => (
          <button
            key={cle}
            type="button"
            aria-pressed={filtre === cle}
            className={filtre === cle ? 'est-actif' : ''}
            style={{ '--c': couleur }}
            onClick={() => { setFiltre(cle); setFocusIndex(0) }}
          >
            {cle !== 'TOUS' && <i aria-hidden="true" />}{label}
          </button>
        ))}
      </div>

      <section className="pj-scene" data-scene ref={sceneRef} aria-label="Exploration 3D des projets">
        <ProjectsScene
          projets={projetsFiltres}
          categories={CATEGORIES}
          filtreActif={filtre}
          focusIndex={iFocus}
          enLecture={enLecture}
          onFocus={aller}
          onSelectProjet={setProjetSelectionne}
          onManipulation={surManipulation}
          isMobile={isMobile}
          positions={positions}
        />
        <p className="pj-scene__aide" aria-hidden="true">{isMobile ? 'Glissez pour tourner · pincez pour zoomer' : 'Glissez pour tourner · molette pour zoomer'}</p>
        {projetFocus && (
          <aside className="pj-focus" style={{ '--c': CATEGORIES[projetFocus.type]?.color || a }} aria-live="polite">
            <div className="pj-focus__tete">
              <span className="pj-focus__num">{String(iFocus + 1).padStart(2, '0')} / {String(nb).padStart(2, '0')}</span>
              <span className="pj-focus__cat"><i aria-hidden="true" />{CATEGORIES[projetFocus.type]?.label || projetFocus.categorie}</span>
            </div>
            <div className="pj-focus__corps" key={projetFocus.num}>
              <h2 className="pj-focus__titre">{projetFocus.titre}</h2>
              <p className="pj-focus__desc">{projetFocus.desc}</p>
              <ul className="pj-focus__tags">{projetFocus.tags.slice(0, 4).map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
            <div className="pj-focus__barre" aria-hidden="true">
              <i key={`${filtre}-${iFocus}`} className={enLecture ? 'est-lecture' : ''} onAnimationEnd={() => aller(iFocus + 1)} />
            </div>
            <div className="pj-focus__actions">
              <button type="button" className="pj-focus__rond" onClick={() => aller(iFocus - 1)} aria-label="Projet précédent">←</button>
              <button type="button" className="pj-focus__rond" onClick={() => setEnPause((v) => !v)} aria-label={enPause ? 'Reprendre la visite' : 'Mettre la visite en pause'}>{enPause ? '▶' : 'II'}</button>
              <button type="button" className="pj-focus__rond" onClick={() => aller(iFocus + 1)} aria-label="Projet suivant">→</button>
              <button type="button" className="pf-btn pf-btn--a pj-focus__ouvrir" onClick={() => setProjetSelectionne(projetFocus)}><span>Voir le projet</span></button>
            </div>
            <ol className="pj-focus__points" aria-label="Choisir un projet">
              {projetsFiltres.map((p, i) => (
                <li key={p.num}><button type="button" className={i === iFocus ? 'est-actif' : ''} onClick={() => aller(i)} aria-label={p.titre} aria-current={i === iFocus} /></li>
              ))}
            </ol>
          </aside>
        )}
      </section>

      <section className="pj-index-section" aria-label="Index des projets">
        <header className="pf-entete">
          <span className="pf-label" data-a="fondu"><b>Index</b> Toutes les réalisations</span>
          <span className="pf-entete__note" data-a="fondu">Cliquez pour le détail</span>
        </header>
        <ol className="pj-index" data-index onPointerLeave={() => setSurvol(null)}>
          {projetsFiltres.map((p) => {
            const cat = CATEGORIES[p.type]
            const i = projets.indexOf(p)
            return (
              <li key={p.num} data-ligne>
                <button
                  type="button"
                  onPointerEnter={() => setSurvol(i)}
                  onFocus={() => setSurvol(i)}
                  onClick={() => setProjetSelectionne(p)}
                  data-curseur="Ouvrir"
                  style={{ '--c': cat?.color || a }}
                >
                  <span className="pj-index__num">{p.num}</span>
                  <span className="pj-index__titre">
                    <span className="pf-roule"><span>{p.titre}</span><span aria-hidden="true">{p.titre}</span></span>
                  </span>
                  <span className="pj-index__cat"><i aria-hidden="true" />{cat?.label || p.categorie || 'Projet'}</span>
                  <span className="pj-index__annee">{p.annee || '—'}</span>
                  <span className="pj-index__fleche" aria-hidden="true">↗</span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <div className="pj-apercu" ref={apercuRef} aria-hidden="true">
        {apercu && <img key={apercu.img} src={apercu.img} alt="" />}
      </div>

      <footer className="pj-pied" data-pied>
        <div className="pf-pied__haut">
          <span className="pf-entete__note">{new Date().getFullYear()} · Fréjus Kouadio</span>
          <button type="button" className="pf-btn pf-btn--a" data-magnetique onClick={() => navigate('/portfolio', { state: { skipGreeting: true } })}>
            <span>← Retour au portfolio</span>
          </button>
        </div>
        <div className="pf-pied__monogramme" data-monogramme aria-hidden="true">&lt;/DevJ&gt;</div>
      </footer>

      {projetSelectionne && (
        <div className="pj-detail">
          <ProjectDetailOverlay
            projet={projetSelectionne}
            categoryColor={CATEGORIES[projetSelectionne.type]?.color || a}
            onClose={fermerDetail}
          />
        </div>
      )}
    </div>
  )
}
