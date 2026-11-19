import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Lenis from 'lenis'
import utiliserTheme from '@/store/utiliserTheme'
import usePortfolioData from '@/hooks/usePortfolioData'
import ProjectsScene from '@/composants/ui/projets3d/ProjectsScene'
import { genererPositions } from '@/composants/ui/projets3d/scenePositions'
import ProjectsVerticalRail from '@/composants/ui/projets3d/ProjectsVerticalRail'
import ProjectDetailOverlay from '@/composants/ui/projets3d/ProjectDetailOverlay'
import { gsap, ScrollTrigger, EASE, MEDIA, useGSAP, mouvementReduit } from '@/composants/portfolio/moteur/gsap'
import { animerAttributs, animerBandeau } from '@/composants/portfolio/moteur/animer'
import { variablesTheme } from '@/composants/portfolio/moteur/contexte'
import '@/composants/portfolio/portfolio.css'

const PROJETS_PAR_DEFAUT = [
  {
    num: '01', titre: 'Eliko Voyage', categorie: 'Agence de voyage', type: 'frontend',
    tags: ['HTML/CSS', 'JavaScript', 'React'],
    desc: "Interface moderne pour agence de voyage permettant la réservation en ligne et la gestion de séjours personnalisés.",
    img: '/asset/eliko.PNG', lien: 'https://devj-58.github.io/eliko_voyage/', annee: '2024', status: 'EN LIGNE',
  },
  {
    num: '02', titre: 'SanteAI', categorie: 'Télémédecine & IA', type: 'ia',
    tags: ['React', 'Google AI', 'Python'],
    desc: "Plateforme de télémédecine avec IA intégrée, consultations vidéo et gestion de dossiers médicaux.",
    img: '/asset/santeAI.jpg', lien: 'https://devpost.com/software/santeai', annee: '2024', status: 'EN LIGNE',
  },
  {
    num: '03', titre: 'Bibliothèque UIYA', categorie: 'Application éducative', type: 'fullstack',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Système complet de gestion de bibliothèque déployé pour l'Université Internationale de Yamoussoukro.",
    img: '/asset/uiya.PNG', lien: 'https://bibliotheque.igl-uiya.com/', annee: '2024', status: 'EN PRODUCTION',
  },
  {
    num: '04', titre: 'GSB — Gestion de Stock', categorie: 'Application de gestion', type: 'fullstack',
    tags: ['PHP', 'Laravel', 'MySQL'],
    desc: "Application full-stack de gestion d'inventaire avec alertes automatiques et rapports exportables.",
    img: '/asset/GSB.jpg', lien: null, annee: '2023', status: 'PRIVÉ',
  },
  {
    num: '05', titre: 'ZikmuCI', categorie: 'Culture ivoirienne', type: 'impact',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    desc: "Plateforme musicale ivoirienne célébrant le Coupé-Décalé, Zouglou et l'Afrobeat.",
    img: '/asset/zikmu.jpg', lien: 'https://devj-58.github.io/ZikmuCi/index.html', annee: '2023', status: 'EN LIGNE',
  },
  {
    num: '06', titre: 'Terasse', categorie: 'Sensibilisation environnement', type: 'impact',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Site de sensibilisation au changement climatique en Côte d'Ivoire.",
    img: '/asset/terasse.jpg', lien: 'https://terasse-ivoire.vercel.app', annee: '2023', status: 'EN LIGNE',
  },
]

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
  const [projetApercuIndex, setProjetApercuIndex] = useState(0)
  const [survol, setSurvol] = useState(null)

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
  const previewIndex = projetsFiltres.length > 0 ? Math.min(projetApercuIndex, projetsFiltres.length - 1) : 0
  const positions = useMemo(() => genererPositions(projetsFiltres.length), [projetsFiltres.length])
  const previewTarget = projetSelectionne ? null : positions[previewIndex] || null

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
            onClick={() => setFiltre(cle)}
          >
            {cle !== 'TOUS' && <i aria-hidden="true" />}{label}
          </button>
        ))}
      </div>

      <section className="pj-scene" data-scene aria-label="Exploration 3D des projets">
        <ProjectsScene
          projets={projetsFiltres}
          categories={CATEGORIES}
          filtreActif={filtre}
          projetSelectionne={projetSelectionne}
          onSelectProjet={setProjetSelectionne}
          isMobile={isMobile}
          positions={positions}
          previewTarget={previewTarget}
        />
        {previewTarget && projetsFiltres[previewIndex] && (
          <p className="pj-scene__apercu" style={{ color: CATEGORIES[projetsFiltres[previewIndex]?.type]?.color || a }}>
            {projetsFiltres[previewIndex].titre} · {CATEGORIES[projetsFiltres[previewIndex]?.type]?.label || ''} — en aperçu
          </p>
        )}
        <ProjectsVerticalRail
          projets={projetsFiltres}
          projetApercuIndex={projetApercuIndex}
          onNaviguerApercu={setProjetApercuIndex}
          categories={CATEGORIES}
          isMobile={isMobile}
        />
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
