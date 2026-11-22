import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Lenis from 'lenis'
import utiliserTheme from '@/store/utiliserTheme'
import usePortfolioData from '@/hooks/usePortfolioData'
import ProjectDetailOverlay from '@/composants/ui/projets3d/ProjectDetailOverlay'
import { gsap, ScrollTrigger, EASE, MEDIA, useGSAP, mouvementReduit } from '@/composants/portfolio/moteur/gsap'
import { animerAttributs, animerBandeau } from '@/composants/portfolio/moteur/animer'
import { variablesTheme } from '@/composants/portfolio/moteur/contexte'
import '@/composants/portfolio/portfolio.css'

const CATEGORIES = {
  frontend: { label: 'Frontend', color: '#5DCAA5' },
  fullstack: { label: 'Fullstack', color: '#378ADD' },
  ia: { label: 'IA & Data', color: '#D4537E' },
  impact: { label: 'Impact social', color: '#EF9F27' },
}

// Galerie éditoriale de tous les projets (lus dans la base) :
// grandes cartes alternées gauche/droite, capture découverte par un rideau
// au défilement, texte en cascade. Page toujours sombre, accent du thème.
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
  const [filtre, setFiltre] = useState('TOUS')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [projetSelectionne, setProjetSelectionne] = useState(null)

  const { projets: projetsData, chargement } = usePortfolioData([])
  const projets = useMemo(() => projetsData.map((p, i) => ({
    ...p,
    num: p.num || String(i + 1).padStart(2, '0'),
    tags: Array.isArray(p.tags) ? p.tags : p.tags ? Object.values(p.tags) : [],
  })), [projetsData])

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
  const annees = projets.map((p) => Number(p.annee)).filter(Boolean)
  const periode = annees.length ? `entre ${Math.min(...annees)} et ${Math.max(...annees)}` : ''

  // En-tête, bandeau et pied
  useGSAP(() => {
    const q = gsap.utils.selector(ref)
    const mm = gsap.matchMedia()
    mm.add({ anim: MEDIA.anim }, (c) => {
      if (!c.conditions.anim) return
      animerAttributs(ref.current)
      const b = animerBandeau(q('[data-bandeau]')[0], { vitesse: 60, declencheurEl: q('[data-entete]')[0] })
      gsap.fromTo(q('[data-monogramme]'), { yPercent: 50 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: q('[data-pied]')[0], start: 'top bottom', end: 'bottom bottom', scrub: true } })
      return () => b?.kill()
    })
    return () => mm.revert()
  }, { scope: ref, dependencies: [projets.length > 0], revertOnUpdate: true })

  // Cartes : rideau sur la capture, léger zoom arrière, texte en cascade,
  // et la capture glisse un peu plus lentement que la page (parallaxe)
  useGSAP(() => {
    const q = gsap.utils.selector(ref)
    const mm = gsap.matchMedia()
    mm.add({ anim: MEDIA.anim, bureau: MEDIA.bureau }, (c) => {
      if (!c.conditions.anim) return
      q('[data-carte]').forEach((carte) => {
        const cadre = carte.querySelector('[data-cadre]')
        const img = carte.querySelector('[data-cadre] img')
        const textes = carte.querySelectorAll('[data-texte] > *')
        const tl = gsap.timeline({ scrollTrigger: { trigger: carte, start: 'top 82%', once: true } })
        tl.fromTo(cadre, { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.3, ease: EASE.rideau })
          .fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: EASE.sortie }, 0)
          .fromTo(textes, { y: 46, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: EASE.sortie, stagger: 0.07 }, 0.25)
        if (c.conditions.bureau && img) {
          gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: carte, start: 'top bottom', end: 'bottom top', scrub: true } })
        }
      })
      ScrollTrigger.refresh()
    })
    return () => mm.revert()
  }, { scope: ref, dependencies: [filtre, projetsFiltres.length], revertOnUpdate: true })

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
        {/* Clé liée aux données : le paragraphe découpé par l'animation est remplacé, pas modifié */}
        <p key={`${projets.length}-${periode}`} className="pf-corps pf-corps--grand" data-a="lignes">
          {projets.length} projets réalisés {periode} — sites, plateformes, outils et expériences 3D, de Yamoussoukro au reste du monde.
        </p>
      </header>

      <div className="pj-filtres" ref={filtresRef} role="group" aria-label="Filtrer par catégorie">
        <span className="pj-filtres__indic" ref={indicRef} aria-hidden="true" />
        {filtres.map(([cle, label, couleur]) => (
          <button key={cle} type="button" aria-pressed={filtre === cle} className={filtre === cle ? 'est-actif' : ''} style={{ '--c': couleur }} onClick={() => setFiltre(cle)}>
            {cle !== 'TOUS' && <i aria-hidden="true" />}{label}
          </button>
        ))}
      </div>

      <section className="pj-galerie" aria-label="Projets">
        {chargement && projets.length === 0 && <p className="pj-galerie__vide">Chargement des projets…</p>}
        {!chargement && projetsFiltres.length === 0 && <p className="pj-galerie__vide">Aucun projet dans cette catégorie pour l’instant.</p>}
        {projetsFiltres.map((p, i) => {
          const cat = CATEGORIES[p.type]
          const enLigne = p.status === 'EN LIGNE' || p.status === 'EN PRODUCTION'
          return (
            <article key={p.id || p.titre} className={`pj-carte${i % 2 ? ' est-inverse' : ''}`} style={{ '--c': cat?.color || a }} data-carte>
              <button type="button" className="pj-carte__cadre" data-cadre onClick={() => setProjetSelectionne(p)} data-curseur="Ouvrir" aria-label={`Détails de ${p.titre}`}>
                {p.img ? <img src={p.img} alt="" loading="lazy" /> : <span className="pj-carte__sans-image">{p.titre}</span>}
                {enLigne && <span className="pj-carte__badge"><i aria-hidden="true" />En ligne</span>}
              </button>
              <div className="pj-carte__texte" data-texte>
                <span className="pj-carte__num">{String(i + 1).padStart(2, '0')} <em>/ {String(projetsFiltres.length).padStart(2, '0')}</em></span>
                <span className="pj-carte__cat"><i aria-hidden="true" />{cat?.label || 'Projet'} · {p.categorie}</span>
                <h2 className="pj-carte__titre">{p.titre}</h2>
                <p className="pj-carte__desc">{p.desc}</p>
                <ul className="pj-carte__tags">{p.tags.slice(0, 5).map((t) => <li key={t}>{t}</li>)}</ul>
                <div className="pj-carte__pied">
                  <span className="pj-carte__meta">{p.annee || '—'} · {p.status || '—'}</span>
                  <div className="pj-carte__actions">
                    <button type="button" className="pf-lien" onClick={() => setProjetSelectionne(p)}>Détails</button>
                    {p.lien && (
                      <a className="pf-btn pf-btn--a" href={p.lien} target="_blank" rel="noopener noreferrer" data-magnetique>
                        <span>{enLigne ? 'Voir le site' : 'Voir le code'} ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </section>

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
            onClose={() => setProjetSelectionne(null)}
          />
        </div>
      )}
    </div>
  )
}
