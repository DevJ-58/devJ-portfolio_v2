import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserTheme from '@/store/utiliserTheme'
import usePortfolioData from '@/hooks/usePortfolioData'
import PanneauParametres from '@/composants/ui/PanneauParametres'
import RevealOnScroll from '@/composants/RevealOnScroll'

// Petit composant de secours pour éviter une erreur si `AxisBouton` manque.
function AxisBouton({ isMobile, a, aRgb, navigate, eff }) {
  const [survol, setSurvol] = useState(false)

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? 16 : 24,
      right: isMobile ? 12 : 24,
      zIndex: 40,
    }}>
      <style>{`
        @keyframes axisRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes axisPulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        @keyframes axisScan {
          from { top: 0%; }
          to   { top: 100%; }
        }
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {survol && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? 52 : 62,
          left: 0,
          width: isMobile ? 200 : 220,
          background: eff.glassOverlay,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid rgba(${aRgb},0.25)`,
          borderRadius: 10,
          padding: '10px 12px',
          animation: 'tooltipIn 0.2s ease forwards',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 12, right: 12, height: 1,
            background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.4),transparent)`,
          }} />
          <div style={{
            position: 'absolute',
            bottom: -5, left: 18,
            width: 8, height: 5,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: `rgba(${aRgb},0.3)`,
          }} />
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 8,
            color: `rgba(${aRgb},0.5)`,
            letterSpacing: '0.2em',
            marginBottom: 5,
          }}>AXIS // IA</div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: isMobile ? 10 : 11,
            color: eff.textMedium,
            lineHeight: 1.55,
          }}>
            Optimisez votre expérience en conversant avec AXIS, l'IA de Fréjus.
          </div>
        </div>
      )}

      <div
        onClick={() => navigate('/')}
        onMouseEnter={() => setSurvol(true)}
        onMouseLeave={() => setSurvol(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 0 : 10,
          cursor: 'pointer',
        }}
      >
        <div style={{
          position: 'relative',
          width: isMobile ? 44 : 52,
          height: isMobile ? 44 : 52,
          flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', inset: -4,
            borderRadius: '50%',
            border: `1px solid rgba(${aRgb},0.4)`,
            animation: 'axisRing 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: -4,
            borderRadius: '50%',
            border: `1px solid rgba(${aRgb},0.2)`,
            animation: 'axisRing 2s ease-out infinite',
            animationDelay: '0.7s',
            pointerEvents: 'none',
          }} />

          <div style={{
            width: '100%', height: '100%',
            borderRadius: '50%',
            background: survol
              ? `rgba(${aRgb},0.12)`
              : eff.glassOverlay,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid rgba(${aRgb},${survol ? '0.6' : '0.35'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: survol
              ? `0 0 28px rgba(${aRgb},0.35)`
              : `0 0 16px rgba(${aRgb},0.15)`,
            transition: 'all 0.25s',
          }}>
            <div style={{
              position: 'absolute',
              left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.6),transparent)`,
              animation: 'axisScan 2s linear infinite',
              zIndex: 2, pointerEvents: 'none',
            }} />

            <svg
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              viewBox="0 0 24 24"
              fill="none"
              style={{ position: 'relative', zIndex: 3 }}
            >
              <polygon
                points="12,2 20,7 20,17 12,22 4,17 4,7"
                stroke={a}
                strokeWidth="1.2"
                fill={`rgba(${aRgb},0.1)`}
              />
              <circle cx="12" cy="12" r="3" fill={a}
                style={{ animation: 'axisPulse 1.8s infinite' }}
              />
            </svg>
          </div>

          <div style={{
            position: 'absolute', bottom: 1, right: 1,
            width: isMobile ? 7 : 8, height: isMobile ? 7 : 8,
            borderRadius: '50%',
            background: a,
            border: `1.5px solid ${eff.fond}`,
            boxShadow: `0 0 6px ${a}`,
            animation: 'axisPulse 1.4s infinite',
            zIndex: 4,
          }} />
        </div>

        {!isMobile && (
          <div style={{
            background: eff.navOverlay,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid rgba(${aRgb},${survol ? '0.35' : '0.18'})`,
            borderRadius: 10,
            padding: '8px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            transition: 'border-color 0.25s',
          }}>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 7,
              color: `rgba(${aRgb},0.45)`,
              letterSpacing: '0.22em',
            }}>AXIS // IA</div>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 9,
              color: a,
              letterSpacing: '0.15em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{
                width: 5, height: 5,
                borderRadius: '50%',
                background: a,
                display: 'inline-block',
                animation: 'axisPulse 1.4s infinite',
              }} />
              PARLER À AXIS
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const Portfolio = forwardRef(function Portfolio({ onClose, accesDirecte = false }, ref) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [servicesOuverts, setServicesOuverts] = useState({}) // Initialize servicesOuverts
  const [githubData, setGithubData] = useState(null)
  const [githubLoading, setGithubLoading] = useState(true)
  const [githubError, setGithubError] = useState(null)
  const [tooltipInfo, setTooltipInfo] = useState(null)
  const [citationIdx, setCitationIdx] = useState(0)
  const [etapeActive, setEtapeActive] = useState(0)
  const [serviceActif, setServiceActif] = useState(0)
  const [projetSurvole, setProjetSurvole] = useState(null)
  const [projetSurvoleIdx, setProjetSurvoleIdx] = useState(null)
  const [categorieActive, setCategorieActive] = useState(0)
  const [categorieSurvolee, setCategorieSurvolee] = useState(null)
  const wrapRef = useRef(null)
  const { theme, mode, getThemeEffectif } = utiliserTheme()
  const eff = getThemeEffectif ? getThemeEffectif() : theme
  const isLight = mode === 'light'
  const a = theme.accent
  const aRgb = theme.accentRgb
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const onScroll = () => setShowScrollTop(wrap.scrollTop > 200)
    wrap.addEventListener('scroll', onScroll)
    return () => wrap.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    async function fetchGithub() {
      try {
        const res = await fetch(
          'https://github-contributions-api.jogruber.de/v4/DevJ-58?y=last'
        )
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        setGithubData(data)
      } catch (err) {
        setGithubError(true)
      } finally {
        setGithubLoading(false)
      }
    }
    fetchGithub()
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setCitationIdx(prev => (prev + 1) % 3)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const toggleService = (titre) => {
    setServicesOuverts((prev) => ({ ...prev, [titre]: !prev[titre] }))
  }

  function getContribColor(count, accent, accentRgb) {
    if (count === 0) return isLight ? 'rgba(20,20,20,0.06)' : 'rgba(242,240,236,0.05)'
    if (count <= 2)  return `rgba(${accentRgb},0.35)`
    if (count <= 5)  return `rgba(${accentRgb},0.55)`
    if (count <= 10) return `rgba(${accentRgb},0.8)`
    return accent
  }

  const citations = [
    "Je transforme des idées complexes en interfaces fluides et mémorables.",
    "Construire l'avenir du web, une ligne de code à la fois.",
    "Chaque ligne de code est une brique vers un logiciel qui dure."
    ] // List of citations for display

  const parcoursData = [
    { chap: 'I', periode: '2020—2021', titre: "BEPC", detail: "Brevet d'Études du Premier Cycle. Bons résultats généraux.", active: false },
    { chap: 'II', periode: '2023—2024', titre: 'Bac série D', detail: "Baccalauréat scientifique — ouverture vers l'ingénierie.", active: false },
    { chap: 'III', periode: '2024—en cours', titre: 'Génie Logiciel', detail: "Licence à l'UIYA, 2ème année. Cap sur l'IA.", active: true },
  ]

  // Exposer la fonction naviguerVers au parent
  useImperativeHandle(ref, () => ({
    naviguerVers(section) {
      console.log('[naviguerVers] appelé:', section)
      
      const doScroll = () => {
        const wrap = document.getElementById('pf-wrap')
        const el = document.getElementById(`pf-${section}`)
        if (!wrap || !el) {
          console.warn('[naviguerVers] manquant — wrap:', !!wrap, 'el:', !!el)
          return false
        }
        const top = el.offsetTop
        console.log('[naviguerVers] scrollTop avant:', wrap.scrollTop, '→ offsetTop:', top)
        wrap.scrollTop = top
        console.log('[naviguerVers] scrollTop après:', wrap.scrollTop)
        el.style.outline = `2px solid rgba(${aRgb},0.7)`
        el.style.outlineOffset = '12px'
        setTimeout(() => { el.style.outline = 'none' }, 2500)
        return true
      }
      
      // Premier essai immédiat
      if (!doScroll()) {
        // Si raté, réessayer toutes les 100ms jusqu'à 3 secondes
        let tries = 0
        const retry = setInterval(() => {
          tries++
          if (doScroll() || tries > 30) clearInterval(retry)
        }, 100)
      }
    }
  }))

  const projetsParDefaut = [
    {
      num: '01', titre: 'Eliko Voyage', tags: ['HTML/CSS', 'JavaScript', 'React'],
      desc: "Interface moderne pour agence de voyage permettant la réservation en ligne et la gestion de séjours personnalisés.",
      img: '/asset/eliko.PNG', lien: 'https://devj-58.github.io/eliko_voyage/'
    },
    {
      num: '02', titre: 'SanteAI', tags: ['React', 'Google AI', 'Python'],
      desc: "Plateforme de télémédecine avec IA intégrée, consultations vidéo et gestion de dossiers médicaux.",
      img: '/asset/santeAI.jpg', lien: 'https://devpost.com/software/santeai'
    },
    {
      num: '03', titre: 'Bibliothèque UIYA', tags: ['HTML', 'CSS', 'JavaScript'],
      desc: "Système complet de gestion de bibliothèque déployé pour l'Université Internationale de Yamoussoukro.",
      img: '/asset/uiya.PNG', lien: 'https://bibliotheque.igl-uiya.com/'
    },
    {
      num: '04', titre: 'GSB — Gestion de Stock', tags: ['PHP', 'Laravel', 'MySQL'],
      desc: "Application full-stack de gestion d'inventaire avec alertes automatiques et rapports exportables.",
      img: '/asset/GSB.jpg', lien: null
    },
    {
      num: '05', titre: 'ZikmuCI', tags: ['HTML5', 'CSS3', 'JavaScript'],
      desc: "Plateforme musicale ivoirienne célébrant le Coupé-Décalé, Zouglou et l'Afrobeat.",
      img: '/asset/zikmu.jpg', lien: 'https://devj-58.github.io/ZikmuCi/index.html'
    },
    {
      num: '06', titre: 'Terasse', tags: ['HTML', 'CSS', 'JavaScript'],
      desc: "Site de sensibilisation au changement climatique en Côte d'Ivoire.",
      img: '/asset/terasse.jpg', lien: 'https://terasse-ivoire.vercel.app'
    },
  ]

  const competencesParDefaut = [
    { cat: 'Frontend', items: [['HTML5',95],['CSS3',90],['JavaScript',85],['React',80],['TypeScript',75],['Bootstrap',90],['GSAP',75]] },
    { cat: 'Backend', items: [['PHP',85],['Laravel',80]] },
    { cat: 'IA & ML', items: [['Python',70],['TensorFlow',65],['NLP',60]] },
    { cat: 'Outils', items: [['Git & GitHub',90],['Figma',85],['Canva',88],['Docker',60]] },
  ]

  const { projets, competences } = usePortfolioData(projetsParDefaut, competencesParDefaut)

  const normaliserCompetences = (rawCompetences) => {
    if (!Array.isArray(rawCompetences)) return []
    return rawCompetences.map((cat = {}) => {
      const rawItems = cat.items
      const items = Array.isArray(rawItems)
        ? rawItems.map(item => {
            if (Array.isArray(item)) return item
            if (item && typeof item === 'object') {
              const nom = item.nom ?? item.name ?? item.label ?? item.titre ?? Object.values(item)[0]
              const pct = item.pct ?? item.value ?? item.score ?? item.niveau ?? Object.values(item)[1] ?? 0
              return [nom ?? '', pct ?? 0]
            }
            return [String(item ?? ''), 0]
          })
        : rawItems && typeof rawItems === 'object'
          ? Object.values(rawItems).map(item => Array.isArray(item)
              ? item
              : item && typeof item === 'object'
                ? [item.nom ?? item.name ?? item.label ?? item.titre ?? Object.values(item)[0], item.pct ?? item.value ?? item.score ?? item.niveau ?? Object.values(item)[1] ?? 0]
                : [String(item ?? ''), 0]
            )
          : []

      return { ...cat, items }
    })
  }

  const normaliserProjets = (rawProjets) => {
    if (!Array.isArray(rawProjets)) return []
    return rawProjets.map((p = {}) => ({
      ...p,
      tags: Array.isArray(p.tags)
        ? p.tags
        : p.tags && typeof p.tags === 'object'
          ? Object.values(p.tags)
          : [],
    }))
  }

  const projetsAffiches = normaliserProjets(projets)
  const competencesAffichees = normaliserCompetences(competences)

  const services = [
    { titre: 'Site Vitrine', prix: '300 000 FCFA', delai: '1 à 2 semaines',
      features: ['Design moderne responsive','Jusqu\'à 5 pages','Formulaire de contact','SEO de base','Hébergement 1 an','Support 24/7'] },
    { titre: 'Site E-commerce', prix: '500 000 FCFA', delai: '3 à 4 semaines', badge: 'Populaire',
      features: ['Boutique en ligne complète','Gestion produits illimitée','Paiement sécurisé','Dashboard admin','Formation incluse','Support prioritaire'] },
    { titre: 'Sur Mesure', prix: 'Sur Devis', delai: 'À définir',
      features: ['Solution 100% personnalisée','Fonctionnalités avancées','Intégrations sur mesure','Support prioritaire','Évolutivité garantie','Maintenance incluse'] },
  ]

  const etapes = [
    {
      n: '01',
      titre: 'Analyse & Audit',
      desc: "Avant d'écrire la moindre ligne de code, je prends le temps de comprendre en profondeur votre activité, vos objectifs et vos utilisateurs. Cette phase pose les fondations de tout le projet : elle évite les allers-retours coûteux plus tard et garantit que chaque décision technique sert un objectif métier clair.",
      duree: '~1 semaine',
      tags: ['Benchmark', 'Personas', 'Roadmap'],
      livrables: ['Audit concurrentiel détaillé', 'Cahier des charges fonctionnel', "Architecture de l'information"],
    },
    {
      n: '02',
      titre: 'Conception & UI',
      desc: "La phase créative où l'idée prend forme visuellement. Je conçois des maquettes qui traduisent votre identité de marque en une expérience cohérente et intuitive, testées et validées avec vous avant tout développement — pour que la version finale ne soit jamais une surprise.",
      duree: '~2 semaines',
      tags: ['Wireframes', 'Design system', 'Prototype'],
      livrables: ['Wireframes basse-fidélité', 'Maquettes haute-fidélité', 'Design system réutilisable'],
    },
    {
      n: '03',
      titre: 'Développement',
      desc: "L'implémentation technique, où la rigueur fait toute la différence. J'écris un code propre, documenté et scalable, en suivant les meilleures pratiques du secteur — pensé pour évoluer avec votre projet, pas pour être réécrit dans six mois.",
      duree: '~4 semaines',
      tags: ['Frontend', 'Backend', 'CI/CD'],
      livrables: ['Intégration frontend responsive', 'API et logique backend', 'Suite de tests unitaires'],
    },
    {
      n: '04',
      titre: 'Tests & Validation',
      desc: "Chaque fonctionnalité est passée au crible sur différents navigateurs, appareils et scénarios d'usage réels. Cette étape garantit un produit fiable, accessible et performant dès le premier jour de mise en ligne, pas après les premiers retours utilisateurs.",
      duree: '~1 semaine',
      tags: ['QA', 'Tests E2E', 'Accessibilité'],
      livrables: ['Tests cross-browser complets', "Audit d'accessibilité (WCAG)", 'Optimisation des performances et SEO'],
    },
    {
      n: '05',
      titre: 'Déploiement',
      desc: "La mise en ligne n'est pas la fin, c'est le début d'une relation continue. Je m'assure d'un déploiement sans accroc, forme les équipes concernées à l'outil livré, et reste disponible pour le suivi post-lancement.",
      duree: 'continu',
      tags: ['Déploiement', 'Monitoring', 'Support'],
      livrables: ['Mise en production sécurisée', "Formation à l'utilisation", 'Documentation technique complète'],
    },
  ]

  const s = {
    wrap: { fontFamily: 'Inter, sans-serif', background: eff.fond, color: eff.texte, overflowY: 'auto', overflowX: 'hidden', maxWidth: '100vw', height: '100%', scrollBehavior: 'smooth' },
    nav: { position: 'sticky', top: 0, zIndex: 100, background: `rgba(20,20,20,0.3), ${eff.navOverlay}`, WebkitBackdropFilter: 'blur(24px)', backdropFilter: 'blur(24px)', borderBottom: `1px solid ${eff.borderLight}`, padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { color: eff.texte, fontSize: 15, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'Fraunces, serif' },
    closeBtn: { background: eff.cardBg, border: `1px solid ${eff.borderStrong}`, color: eff.textMuted, padding: '8px 16px', cursor: 'pointer', fontSize: 9, letterSpacing: '0.2em', borderRadius: 6, fontFamily: 'Space Mono, monospace' },
    section: { padding: '100px 80px', borderBottom: `1px solid ${eff.borderLight}` },
    secNum: { color: `rgba(${aRgb},0.35)`, fontSize: 10, letterSpacing: '0.35em', fontFamily: 'Space Mono, monospace' },
    secTitle: { fontSize: 36, fontWeight: 700, color: eff.texte, margin: '0 0 56px', fontFamily: 'Fraunces, serif' },
    accent: { color: a },
    tag: { background: `rgba(${aRgb},0.08)`, border: `1px solid rgba(${aRgb},0.2)`, color: a, padding: '6px 16px', fontSize: 9, letterSpacing: '0.2em', borderRadius: 3, display: 'inline-block' },
    card: { border: `1px solid ${eff.borderStrong}`, background: eff.cardBg, padding: 24, marginBottom: 20, borderRadius: 12, WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' },
    barWrap: { background: eff.borderLight, height: 2, borderRadius: 2, margin: '8px 0 12px', width: '100%' },
  }

  const navStyle = { ...s.nav, padding: isMobile ? '12px 20px' : s.nav.padding }
  const sectionStyle = { ...s.section, padding: isMobile ? '64px 24px' : s.section.padding, overflowX: 'hidden', maxWidth: '100%' }
  const contactGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 8 : 12 }
  const navLinksStyle = { display: isMobile ? 'none' : 'flex', gap: 22, fontSize: 9, color: eff.textFaint, letterSpacing: '0.2em', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }
  const navSpanColor = isLight ? '#64748b' : eff.textFaint

  return (
    <div style={s.wrap} id="pf-wrap">
      <style>{`
        /* Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;1,9..144,400&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes waveFlow {
          to { stroke-dashoffset: -200; }
        }
        @keyframes waveDrift {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(var(--wave-lift, 8px)) scaleY(1.015); }
        }
        @keyframes waveShimmer {
          0%, 100% { opacity: var(--wave-op, 0.5); }
          50% { opacity: calc(var(--wave-op, 0.5) * 1.6); }
        }
        @keyframes constellationTwinkle {
          0%, 100% { opacity: var(--star-op, 0.6); }
          50% { opacity: calc(var(--star-op, 0.6) * 0.25); }
        }
        @keyframes orbitFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(var(--orbit-x, 6px), var(--orbit-y, -8px)); }
        }
        @keyframes signalFlow {
          to { stroke-dashoffset: -400; }
        }
        @keyframes facetShimmer {
          0%, 100% { opacity: var(--facet-op, 1); }
          50% { opacity: calc(var(--facet-op, 1) * 0.45); }
        }
        @keyframes crystalDrift {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(0.6deg); }
        }
        @keyframes beamSweep {
          0%   { transform: translate(-120%, -120%) rotate(35deg); opacity: 0; }
          15%  { opacity: 0.9; }
          50%  { opacity: 0.9; }
          85%  { opacity: 0; }
          100% { transform: translate(120%, 120%) rotate(35deg); opacity: 0; }
        }
        @keyframes networkSignal {
          to { stroke-dashoffset: -300; }
        }
        @keyframes centralPulse {
          0%, 100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 0px transparent); }
          50% { transform: rotate(3deg) scale(1.04); filter: drop-shadow(0 0 10px var(--pulse-color, transparent)); }
        }
        @keyframes nodeBreathe {
          0%, 100% { opacity: var(--node-op, 0.6); r: var(--node-r, 11); }
          50% { opacity: calc(var(--node-op, 0.6) * 1.6); }
        }
        @keyframes priceSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        #pf-wrap .pf-card { transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease; }
        #pf-wrap .pf-card:hover { transform: translateY(-4px); border-color: rgba(${aRgb},0.3); box-shadow: 0 8px 30px ${eff.shadow}; }
        #pf-wrap .pf-project-card { transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease; }
        #pf-wrap .pf-project-card:hover { transform: translateY(-3px); border-color: rgba(${aRgb},0.3); }
        #pf-wrap .pf-project-card img { transition: filter 400ms ease, transform 400ms ease; }
        #pf-wrap .pf-project-card:hover img { filter: brightness(0.95); }
        #pf-wrap .pf-project-link:hover { background: rgba(${aRgb},0.22); }
        #pf-wrap .pf-service-card { transition: border-color 300ms ease, transform 300ms ease; }
        #pf-wrap .pf-service-card:hover { transform: translateX(4px); border-color: rgba(${aRgb},0.35); }
        #pf-wrap .pf-skill-pill { transition: border-color 200ms, background 200ms; }
        #pf-wrap .pf-skill-pill:hover { border-color: rgba(${aRgb},0.3); background: rgba(${aRgb},0.05); }
        #pf-wrap nav span { color: ${navSpanColor}; cursor: pointer; }
        #pf-wrap nav span:hover { color: ${a}; transition: color 200ms; }
        #pf-wrap a.pf-btn:hover { background: ${a}; color: #050505; }
        #pf-wrap a.pf-ghost:hover { background: rgba(${aRgb},0.08); }
        #pf-github .github-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* NAV */}
      <nav style={navStyle}>
        <div style={s.logo}>&lt;<span style={{ color: a }}>/DevJ</span>&gt;</div>
        <div style={{ flex: 1, display: isMobile ? 'none' : 'flex', justifyContent: 'center' }}>
          <div style={navLinksStyle}>
            {['about','academic','skills','projects','github','services','methodology','contact'].map((id, index) => (
              <span key={id}
                onClick={() => document.getElementById(`pf-${id}`)?.scrollIntoView({ behavior:'smooth' })}
                style={{
                  cursor: 'pointer',
                  paddingBottom: 2,
                  borderBottom: index === 0 ? `1px solid ${a}` : 'none',
                  color: index === 0 ? a : navSpanColor,
                }}>
                {id.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        <div style={{ width: isMobile ? 20 : 32, minWidth: isMobile ? 20 : 32 }} />
      </nav>

      {/* HERO */}
      <section id="pf-hero" style={{
        position: 'relative',
        overflow: 'hidden',
        background: eff.fond,
        padding: isMobile ? '28px 24px' : '36px 40px',
        minHeight: isMobile ? 'auto' : '680px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '16px' : '24px',
      }}>
        {!isMobile && (
          <>
            <img
              src="/asset/2026010323251463.png"
              alt="Fréjus Kouadio"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '44%',
                objectFit: 'cover',
                objectPosition: 'top center',
                zIndex: 0,
                maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 15%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.3) 55%, transparent 85%)',
                WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 15%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.3) 55%, transparent 85%)',
              }}
            />
            <div style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '44%',
              background: `radial-gradient(circle at 70% 45%, rgba(${aRgb},${isLight ? 0.08 : 0.12}) 0%, transparent 55%)`,
              mixBlendMode: 'screen',
              zIndex: 0,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '44%',
              height: '30%',
              background: `linear-gradient(to top, ${eff.fond} 0%, transparent 100%)`,
              zIndex: 0,
              pointerEvents: 'none',
            }} />
          </>
        )}

        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${isLight ? 'rgba(20,20,20,0.12)' : 'rgba(255,255,255,0.12)'}`,
          paddingBottom: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              border: `1px solid ${a}`,
              transform: 'rotate(45deg)',
            }} />
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '8px',
              letterSpacing: '0.35em',
              color: isLight ? 'rgba(20,20,20,0.35)' : 'rgba(242,240,236,0.35)',
              textTransform: 'uppercase',
            }}>
              VOL. I · N°01
            </div>
          </div>

          {!isMobile && (
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '8px',
              letterSpacing: '0.3em',
              color: isLight ? 'rgba(20,20,20,0.25)' : 'rgba(242,240,236,0.25)',
              textTransform: 'uppercase',
            }}>
              CI · 2026
            </div>
          )}

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
              {[4,8,14,10,6,12,7,9].map((height, index) => (
                <div key={index} style={{
                  width: '2px',
                  height: `${height}px`,
                  background: isLight ? 'rgba(20,20,20,0.25)' : 'rgba(242,240,236,0.3)',
                }} />
              ))}
            </div>
          )}
        </div>

        <div style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '120px 1fr',
            gap: '28px',
          }}>
            <div style={{
              display: isMobile ? 'none' : 'flex',
              flexDirection: 'column',
              gap: '22px',
              borderRight: `1px solid ${isLight ? 'rgba(20,20,20,0.08)' : 'rgba(255,255,255,0.08)'}`,
              paddingRight: '20px',
            }}>
              <div style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '7px',
                letterSpacing: '0.2em',
                color: a,
                textTransform: 'uppercase',
              }}>
                SOMMAIRE
              </div>
              {[
                { num: '01', label: 'Portrait', target: 'about' },
                { num: '02', label: 'Parcours', target: 'academic' },
                { num: '03', label: 'Projets', target: 'projects' },
                { num: '04', label: 'Contact', target: 'contact' },
              ].map(({ num, label, target }) => (
                <div key={num}
                  onClick={() => document.getElementById(`pf-${target}`)?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: '10px',
                    color: isLight ? 'rgba(20,20,20,0.3)' : 'rgba(242,240,236,0.3)',
                  }}>
                    {num}
                  </div>
                  <div style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '8px',
                    color: isLight ? 'rgba(20,20,20,0.45)' : 'rgba(242,240,236,0.45)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    {label}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 'auto' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: `1px solid rgba(${aRgb},0.4)`,
                  borderRadius: '20px',
                  padding: '5px 10px',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '6px',
                  color: isLight ? 'rgba(20,20,20,0.65)' : 'rgba(242,240,236,0.7)',
                  textTransform: 'uppercase',
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: a,
                    animation: 'pulse 1.5s infinite',
                  }} />
                  DISPO
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <RevealOnScroll direction="up" delay={0} as="div">
                <div>
                  <div style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '9px',
                    letterSpacing: '0.4em',
                    color: a,
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                  }}>
                    LE PORTRAIT
                  </div>
                  <div style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: isMobile ? '36px' : '66px',
                    fontWeight: 800,
                    lineHeight: 0.88,
                    color: eff.texte,
                    letterSpacing: '-0.025em',
                    margin: 0,
                  }}>
                    Fréjus
                  </div>
                  <div style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: isMobile ? '36px' : '66px',
                    fontWeight: 500,
                    fontStyle: 'italic',
                    lineHeight: 0.88,
                    color: isLight ? 'rgba(20,20,20,0.35)' : 'rgba(242,240,236,0.4)',
                    letterSpacing: '-0.025em',
                    marginLeft: isMobile ? '20px' : '48px',
                    marginTop: '-4px',
                    marginBottom: 0,
                  }}>
                    Kouadio
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" delay={150} as="div" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1px 200px',
                gap: '24px',
                marginTop: '28px',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: '15px',
                    fontWeight: 500,
                    fontStyle: 'italic',
                    color: isLight ? 'rgba(20,20,20,0.6)' : 'rgba(242,240,236,0.62)',
                    lineHeight: 1.6,
                  }}>
                    “Développeur logiciel & UI/UX designer — je transforme des idées complexes en interfaces fluides et mémorables.”
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    alignItems: 'center',
                  }}>
                    {['REACT', 'JAVASCRIPT', 'PHP', 'LARAVEL', 'FIGMA'].map((tag, idx) => (
                      <div key={tag} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '8px',
                        letterSpacing: '0.18em',
                        color: isLight ? 'rgba(20,20,20,0.4)' : 'rgba(242,240,236,0.4)',
                        textTransform: 'uppercase',
                      }}>
                        <span>{tag}</span>
                        {idx < 4 && <div style={{ width: '1px', height: '12px', background: isLight ? 'rgba(20,20,20,0.15)' : 'rgba(242,240,236,0.15)' }} />}
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '16px',
                  }}>
                    <a href="mailto:devfred58@gmail.com" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 24px',
                      background: isLight ? '#141414' : '#f2f0ec',
                      color: isLight ? '#f5f5f0' : '#0a0a0a',
                      fontFamily: 'Space Mono, monospace',
                      fontSize: '9px',
                      fontWeight: '700',
                      letterSpacing: '0.2em',
                      textDecoration: 'none',
                      borderRadius: '2px',
                      border: 'none',
                      textTransform: 'uppercase',
                      width: isMobile ? '100%' : 'auto',
                    }}>
                      ME CONTACTER
                    </a>
                    <a href="https://wa.me/2250767998373" target="_blank" rel="noopener" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 24px',
                      background: 'transparent',
                      color: isLight ? 'rgba(20,20,20,0.5)' : 'rgba(242,240,236,0.5)',
                      fontFamily: 'Space Mono, monospace',
                      fontSize: '9px',
                      fontWeight: '700',
                      letterSpacing: '0.2em',
                      textDecoration: 'none',
                      borderBottom: `1px solid ${isLight ? 'rgba(20,20,20,0.25)' : 'rgba(242,240,236,0.25)'}`,
                      textTransform: 'uppercase',
                      width: isMobile ? '100%' : 'auto',
                    }}>
                      WhatsApp →
                    </a>
                  </div>
                </div>

                {!isMobile && (
                  <div style={{
                    width: '1px',
                    background: isLight ? 'rgba(20,20,20,0.08)' : 'rgba(242,240,236,0.1)',
                    minHeight: '120px',
                  }} />
                )}

                <RevealOnScroll direction="left" delay={300} as="div" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}>
                  <div style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '7px',
                    color: isLight ? 'rgba(20,20,20,0.3)' : 'rgba(242,240,236,0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    EN CHIFFRES
                  </div>
                  {[
                    { label: 'Projets déployés', value: '6' },
                    { label: `Années d'expérience`, value: '2+' },
                    { label: 'Satisfaction client', value: '100%' },
                  ].map((item, idx) => (
                    <div key={item.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: idx === 0 ? 'none' : `1px solid ${isLight ? 'rgba(20,20,20,0.08)' : 'rgba(242,240,236,0.08)'}`,
                      paddingTop: idx === 0 ? '0' : '12px',
                      gap: '16px',
                    }}>
                      <div style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '7px',
                        color: isLight ? 'rgba(20,20,20,0.4)' : 'rgba(242,240,236,0.4)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontFamily: 'Fraunces, serif',
                        fontSize: '17px',
                        fontWeight: 800,
                        color: a,
                      }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </RevealOnScroll>
              </RevealOnScroll>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          left: isMobile ? -6 : 10,
          bottom: isMobile ? 55 : 30,
          zIndex: 1,
          fontFamily: 'Fraunces, serif',
          fontWeight: 800,
          fontSize: isMobile ? 100 : 260,
          lineHeight: 1,
          color: a,
          opacity: 0.18,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
        }}>
          &lt;/DevJ&gt;
        </div>

        <div style={{
          position: 'relative',
          zIndex: 2,
          borderTop: `1px solid ${isLight ? 'rgba(20,20,20,0.1)' : 'rgba(255,255,255,0.1)'}`,
          paddingTop: '12px',
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: isMobile ? '10px' : '0',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <div
            onClick={() => document.getElementById('pf-academic')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '7px',
              letterSpacing: '0.15em',
              color: isLight ? 'rgba(20,20,20,0.3)' : 'rgba(242,240,236,0.3)',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            SUITE → PARCOURS ACADÉMIQUE, P.02
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: `1px solid rgba(${aRgb},0.5)`,
              display: 'grid',
              placeItems: 'center',
            }}>
              <span style={{
                fontFamily: 'Fraunces, serif',
                fontSize: '8px',
                color: a,
              }}>
                ✓
              </span>
            </div>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '7px',
              letterSpacing: '0.1em',
              color: isLight ? 'rgba(20,20,20,0.3)' : 'rgba(242,240,236,0.3)',
              textTransform: 'uppercase',
            }}>
              PROFIL VÉRIFIÉ
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="pf-about" style={{
        position: 'relative',
        overflow: 'hidden',
        background: eff.fond,
        padding: isMobile ? '56px 24px 44px' : '80px 64px 56px',
      }}>

        <RevealOnScroll direction="up" delay={0} as="div" style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 9,
          letterSpacing: '0.4em',
          color: a,
          marginBottom: isMobile ? 24 : 36,
          textTransform: 'uppercase',
        }}>
          01 // À PROPOS
        </RevealOnScroll>

        {isMobile && (
          <div style={{
            width: '100%',
            height: 170,
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 20,
          }}>
            <img
              src="/asset/2026010323253284.png"
              alt="Fréjus Kouadio"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
              }}
            />
          </div>
        )}

        <RevealOnScroll direction="up" delay={0} as="div" style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 800,
          fontSize: isMobile ? 32 : 78,
          lineHeight: isMobile ? 1.05 : 0.98,
          color: eff.texte,
          letterSpacing: '-0.03em',
          maxWidth: isMobile ? '100%' : 820,
        }}>
          Concevoir des interfaces qui se ressentent{' '}
          <span style={{ color: a, fontStyle: 'italic', fontWeight: 500 }}>avant</span>
          {' '}de se comprendre.
        </RevealOnScroll>

        <div style={{
          display: 'flex',
          gap: isMobile ? 32 : 60,
          marginTop: isMobile ? 32 : 56,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>

          <RevealOnScroll direction="up" delay={150} as="div" style={{
            maxWidth: 340,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: eff.textMuted,
            lineHeight: 1.8,
            fontWeight: 300,
          }}>
            Fréjus Kouadio — développeur logiciel et UI/UX designer basé à Yamoussoukro. En 2ème année de Licence Génie Logiciel, spécialisation progressive vers l'intelligence artificielle.
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={250} as="div" style={{ display: 'flex', gap: isMobile ? 24 : 44, flexWrap: 'wrap' }}>
            {[
              ['Yamoussoukro, CI', 'Localisation'],
              ['2ème / 3', 'Cursus'],
              ['Ouvert', 'Disponibilité'],
            ].map(([v, l]) => (
              <div key={l}>
                <div style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 700,
                  fontSize: 16,
                  color: eff.texte,
                  marginBottom: 6,
                }}>{v}</div>
                <div style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 7,
                  letterSpacing: '0.15em',
                  color: eff.textFaint,
                  textTransform: 'uppercase',
                }}>{l}</div>
              </div>
            ))}
          </RevealOnScroll>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginTop: isMobile ? 32 : 56,
          paddingTop: 24,
          borderTop: `1px solid ${isLight ? 'rgba(20,20,20,0.1)' : 'rgba(242,240,236,0.1)'}`,
          flexWrap: 'wrap',
        }}>
          <a href="/asset/cv_frejus.pdf" download="cv_frejus.pdf" style={{
            padding: '14px 30px',
            background: isLight ? '#141414' : '#f2f0ec',
            color: isLight ? '#f5f5f0' : '#0a0a0a',
            borderRadius: 2,
            fontFamily: 'Space Mono, monospace',
            fontSize: 9,
            letterSpacing: '0.18em',
            fontWeight: 700,
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}>
            Télécharger le CV
          </a>
          <a href="mailto:devfred58@gmail.com" style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 8,
            letterSpacing: '0.12em',
            color: eff.textFaint,
            borderBottom: `1px solid ${isLight ? 'rgba(20,20,20,0.2)' : 'rgba(242,240,236,0.2)'}`,
            paddingBottom: 3,
            textDecoration: 'none',
          }}>
            devfred58@gmail.com
          </a>
        </div>
      </section>

      {/* PARCOURS ACADÉMIQUE */}
      <section id="pf-academic" style={{
        position: 'relative',
        overflow: 'hidden',
        background: eff.fond,
        padding: isMobile ? '56px 24px 44px' : '80px 64px 90px',
      }}>

        <svg
          viewBox="0 0 1200 500"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: isMobile ? '60%' : '80%',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: isLight ? 0.3 : 0.5,
          }}
        >
          {Array.from({ length: 14 }).map((_, i) => {
            const offset = i * 6
            const amplitude = 40 + i * 3
            const baseOpacity = 1 - i * 0.06
            const flowDuration = 10 + (i % 5) * 1.4
            const driftDuration = 6 + (i % 4) * 1.1
            const shimmerDuration = 4 + (i % 3) * 1.3
            const flowDelay = -(i * 0.9)
            const driftDelay = -(i * 0.5)
            const shimmerDelay = -(i * 0.4)
            const lift = 5 + (i % 3) * 4
            const strokeW = 1 + (14 - i) * 0.05

            return (
              <path
                key={i}
                d={`M -50 ${380 - offset} C 200 ${280 - offset - amplitude}, 400 ${480 - offset + amplitude}, 650 ${330 - offset} S 1000 ${180 - offset - amplitude}, 1250 ${350 - offset}`}
                fill="none"
                stroke={a}
                strokeWidth={strokeW}
                strokeLinecap="round"
                strokeDasharray="16 12"
                opacity={baseOpacity}
                style={{
                  '--wave-lift': `${lift}px`,
                  '--wave-op': baseOpacity,
                  animation: `waveFlow ${flowDuration}s linear infinite, waveDrift ${driftDuration}s ease-in-out infinite, waveShimmer ${shimmerDuration}s ease-in-out infinite`,
                  animationDelay: `${flowDelay}s, ${driftDelay}s, ${shimmerDelay}s`,
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                }}
              />
            )
          })}
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>

        <RevealOnScroll direction="up" delay={0} as="div" style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.4em', color: a, marginBottom: 16, textTransform: 'uppercase' }}>
          01.5 // PARCOURS
        </RevealOnScroll>
        <RevealOnScroll direction="up" delay={0} as="div" style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 32 : 44, color: eff.texte, marginBottom: isMobile ? 40 : 80, letterSpacing: '-0.02em' }}>
          Trois <span style={{ color: a, fontStyle: 'italic', fontWeight: 500 }}>chapitres</span>
        </RevealOnScroll>

        {!isMobile && (
          <div style={{ position: 'relative', height: 280 }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: isLight ? 'rgba(20,20,20,0.15)' : 'rgba(242,240,236,0.15)' }} />
            {parcoursData.map((e, i) => {
              const x = ['6%', '38%', '70%'][i]
              const dirUp = i % 2 === 0
              return (
                <div key={e.chap}>
                  <div style={{ position: 'absolute', left: x, top: '50%', width: e.active ? 11 : 8, height: e.active ? 11 : 8, borderRadius: '50%', transform: 'translate(-50%,-50%)', background: e.active ? a : eff.fond, border: e.active ? 'none' : `1px solid ${isLight ? 'rgba(20,20,20,0.35)' : 'rgba(242,240,236,0.35)'}`, boxShadow: e.active ? `0 0 14px rgba(${aRgb},0.7)` : 'none', zIndex: 2 }} />
                  <RevealOnScroll as="div" direction={i % 2 === 0 ? 'up' : 'down'} delay={i * 150} style={{ position: 'absolute', left: x, [dirUp ? 'bottom' : 'top']: 'calc(50% + 22px)', width: 190 }}>
                    <span style={{ position: 'absolute', [dirUp ? 'bottom' : 'top']: -10, left: 0, fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 100, color: e.active ? a : eff.texte, opacity: 0.06, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
                      {e.chap}
                    </span>
                    <div style={{ position: 'relative' }}>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.15em', color: e.active ? a : (isLight ? 'rgba(20,20,20,0.35)' : 'rgba(242,240,236,0.35)'), marginBottom: 6, textTransform: 'uppercase' }}>
                        CH. {e.chap} · {e.periode}
                      </div>
                      <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 19, color: eff.texte, marginBottom: 6 }}>
                        {e.titre}
                      </div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 11, color: eff.textMuted, lineHeight: 1.6 }}>
                        {e.detail}
                      </div>
                    </div>
                  </RevealOnScroll>
                </div>
              )
            })}
          </div>
        )}

        {isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {parcoursData.map((e, i) => (
              <RevealOnScroll key={e.chap} as="div" direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 150} style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: i < parcoursData.length - 1 ? `1px solid ${isLight ? 'rgba(20,20,20,0.08)' : 'rgba(242,240,236,0.08)'}` : 'none' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 32, color: e.active ? a : (isLight ? 'rgba(20,20,20,0.2)' : 'rgba(242,240,236,0.2)'), lineHeight: 1, flexShrink: 0, width: 40 }}>
                  {e.chap}
                </div>
                <div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.15em', color: e.active ? a : (isLight ? 'rgba(20,20,20,0.35)' : 'rgba(242,240,236,0.35)'), marginBottom: 6, textTransform: 'uppercase' }}>
                    {e.periode}
                  </div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 17, color: eff.texte, marginBottom: 6 }}>
                    {e.titre}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12, color: eff.textMuted, lineHeight: 1.65 }}>
                    {e.detail}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        )}
        </div>
      </section>

      <section id="pf-skills" style={{
        position: 'relative',
        overflow: 'hidden',
        background: eff.fond,
        padding: isMobile ? '56px 24px 60px' : '80px 64px 100px',
      }}>
        {!isMobile && (
          <svg
            viewBox="0 0 400 400"
            style={{
              position: 'absolute',
              right: 20,
              top: 20,
              width: 340,
              height: 340,
              opacity: isLight ? 0.35 : 0.5,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <defs>
              <clipPath id="skillsGel-crystalClip">
                <polygon points="60,150 200,70 200,110 100,168 100,210 60,187" />
                <polygon points="200,70 260,105 260,145 200,110" />
                <polygon points="60,187 100,210 260,300 260,340 100,250 60,227" />
                <polygon points="200,110 260,145 260,220 220,242 220,200 200,190" />
                <polygon points="260,145 320,180 320,255 260,220" />
                <polygon points="220,242 260,265 260,300 220,278" />
              </clipPath>
              <linearGradient id="skillsGel-beamGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={a} stopOpacity="0" />
                <stop offset="50%" stopColor={a} stopOpacity="0.9" />
                <stop offset="100%" stopColor={a} stopOpacity="0" />
              </linearGradient>
            </defs>

            <g style={{ animation: 'crystalDrift 7s ease-in-out infinite', transformOrigin: 'center' }}>
              <polygon points="60,150 200,70 200,110 100,168 100,210 60,187" fill={isLight ? 'rgba(20,20,20,0.2)' : 'rgba(242,240,236,0.35)'} style={{ '--facet-op': 1, animation: 'facetShimmer 3.2s ease-in-out infinite', animationDelay: '0s' }} />
              <polygon points="200,70 260,105 260,145 200,110" fill={isLight ? 'rgba(20,20,20,0.5)' : 'rgba(0,0,0,0.6)'} style={{ '--facet-op': 1, animation: 'facetShimmer 3.2s ease-in-out infinite', animationDelay: '0.35s' }} />
              <polygon points="60,187 100,210 260,300 260,340 100,250 60,227" fill={a} style={{ '--facet-op': 1, animation: 'facetShimmer 3.2s ease-in-out infinite', animationDelay: '0.7s' }} />
              <polygon points="200,110 260,145 260,220 220,242 220,200 200,190" fill={isLight ? 'rgba(20,20,20,0.2)' : 'rgba(242,240,236,0.35)'} style={{ '--facet-op': 1, animation: 'facetShimmer 3.2s ease-in-out infinite', animationDelay: '1.05s' }} />
              <polygon points="260,145 320,180 320,255 260,220" fill={isLight ? 'rgba(20,20,20,0.5)' : 'rgba(0,0,0,0.6)'} style={{ '--facet-op': 1, animation: 'facetShimmer 3.2s ease-in-out infinite', animationDelay: '1.4s' }} />
              <polygon points="220,242 260,265 260,300 220,278" fill={isLight ? 'rgba(20,20,20,0.1)' : 'rgba(242,240,236,0.2)'} style={{ '--facet-op': 1, animation: 'facetShimmer 3.2s ease-in-out infinite', animationDelay: '1.75s' }} />
            </g>

            <g clipPath="url(#skillsGel-crystalClip)">
              <rect
                x="-100"
                y="-100"
                width="120"
                height="600"
                fill="url(#skillsGel-beamGradient)"
                style={{ animation: 'beamSweep 6s ease-in-out infinite' }}
              />
            </g>
          </svg>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <RevealOnScroll direction="up" delay={0} as="div" style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.4em', color: a, marginBottom: 16, textTransform: 'uppercase' }}>
            02 // COMPÉTENCES
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={0} as="div" style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 28 : 48, color: eff.texte, marginBottom: isMobile ? 40 : 70, letterSpacing: '-0.02em' }}>
            Signal <span style={{ color: a, fontStyle: 'italic', fontWeight: 500 }}>technique</span>
          </RevealOnScroll>

          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {competencesAffichees.map((group, gi) => {
                const items = Array.isArray(group.items) ? group.items : []
                const isActiveHover = categorieSurvolee === gi
                const isHighlighted = isActiveHover
                return (
                  <RevealOnScroll
                    key={group.cat}
                    as="div"
                    direction="up"
                    delay={gi * 120}
                    onClick={() => setCategorieSurvolee(categorieSurvolee === gi ? null : gi)}
                    style={{
                      display: 'flex',
                      gap: 16,
                      alignItems: 'flex-start',
                      padding: '18px 0',
                      borderBottom: gi < competencesAffichees.length - 1
                        ? `1px solid ${isLight ? 'rgba(20,20,20,0.08)' : 'rgba(242,240,236,0.1)'}`
                        : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 62,
                      height: 62,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: isHighlighted ? a : eff.cardBg,
                      border: isHighlighted ? 'none' : `1.4px solid ${isLight ? 'rgba(20,20,20,0.4)' : 'rgba(242,240,236,0.4)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.3s, border-color 0.3s',
                    }}>
                      <span style={{
                        fontFamily: 'Fraunces, serif', fontWeight: 800,
                        fontSize: 10, color: isHighlighted ? (isLight ? '#f5f5f0' : '#0a0a0a') : eff.texte,
                        textAlign: 'center', padding: '0 4px',
                      }}>
                        {group.cat}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 14px', flex: 1 }}>
                      {items.map(([name, pct]) => (
                        <div key={name}>
                          <div style={{
                            fontFamily: 'Fraunces, serif', fontWeight: 800,
                            fontSize: 13, color: isHighlighted ? a : eff.texte,
                          }}>
                            {name}
                          </div>
                          <div style={{
                            fontFamily: 'Space Mono, monospace', fontSize: 9,
                            color: eff.textFaint, marginTop: 2,
                          }}>
                            {pct}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </RevealOnScroll>
                )
              })}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              gap: isMobile ? 40 : 90,
              justifyContent: isMobile ? 'flex-start' : 'center',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              overflowX: isMobile ? 'auto' : 'visible',
              paddingBottom: isMobile ? 8 : 0,
            }}>
              {competencesAffichees.map((group, gi) => {
                const items = Array.isArray(group.items) ? group.items : []
                const isActiveHover = categorieSurvolee === gi
                const isHighlighted = isActiveHover
                const lineGap = isMobile ? 14 : 20
                const heightScale = isMobile ? 1.0 : 1.4
                const isDimmed = categorieSurvolee !== null && categorieSurvolee !== gi

                return (
                  <RevealOnScroll
                    key={group.cat}
                    as="div"
                    direction="up"
                    delay={gi * 120}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0,
                      transformOrigin: 'bottom center',
                    }}
                  >
                    <div
                      onMouseEnter={() => setCategorieSurvolee(gi)}
                      onMouseLeave={() => setCategorieSurvolee(null)}
                      onClick={() => setCategorieSurvolee(categorieSurvolee === gi ? null : gi)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transform: categorieSurvolee === gi ? 'scale(1.08)' : 'scale(1)',
                        transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                        opacity: isDimmed ? 0.5 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: lineGap, height: isMobile ? 130 : 170 }}>
                      {items.map(([name, pct]) => (
                        <div
                          key={name}
                          style={{
                            width: 2,
                            height: pct * heightScale * (isMobile ? 0.75 : 1),
                            background: isHighlighted ? a : (isLight ? 'rgba(20,20,20,0.5)' : 'rgba(242,240,236,0.55)'),
                            boxShadow: isActiveHover ? `0 0 8px rgba(${aRgb},0.5)` : 'none',
                          }}
                        />
                      ))}
                    </div>

                    <div style={{
                      width: isMobile ? 74 : 92,
                      height: isMobile ? 74 : 92,
                      borderRadius: '50%',
                      background: isHighlighted ? a : eff.cardBg,
                      border: isHighlighted ? 'none' : `1.4px solid ${isLight ? 'rgba(20,20,20,0.4)' : 'rgba(242,240,236,0.4)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: -2,
                      marginBottom: -2,
                      zIndex: 2,
                    }}>
                      <span style={{
                        fontFamily: 'Fraunces, serif', fontWeight: 800,
                        fontSize: isMobile ? 12 : 15,
                        color: isHighlighted ? (isLight ? '#f5f5f0' : '#0a0a0a') : eff.texte,
                        textAlign: 'center', padding: '0 6px',
                      }}>
                        {group.cat}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: lineGap, height: 40 }}>
                      {items.map(([name], ii) => (
                        <div
                          key={name}
                          style={{
                            width: 2,
                            height: 20 + ii * 4,
                            background: isHighlighted ? `rgba(${aRgb},0.4)` : (isLight ? 'rgba(20,20,20,0.2)' : 'rgba(242,240,236,0.25)'),
                            boxShadow: isActiveHover ? `0 0 8px rgba(${aRgb},0.5)` : 'none',
                          }}
                        />
                      ))}
                    </div>

                      <div style={{ display: 'flex', gap: lineGap, marginTop: 16 }}>
                        {items.map(([name, pct]) => (
                          <div key={name} style={{ textAlign: 'center', width: isMobile ? 56 : 64 }}>
                            <div style={{
                              fontFamily: 'Fraunces, serif', fontWeight: 800,
                              fontSize: isMobile ? 13 : 15,
                              color: isHighlighted ? a : eff.texte,
                              lineHeight: 1.15,
                              whiteSpace: 'normal',
                            }}>
                              {name}
                            </div>
                            <div style={{
                              fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 10 : 11,
                              color: eff.textFaint, marginTop: 6, letterSpacing: '0.05em',
                            }}>
                              {pct}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </RevealOnScroll>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* PROJECTS - CONSTELLATION */}
      <section id="pf-projects" style={{
        position: 'relative',
        overflow: 'hidden',
        background: eff.fond,
        padding: isMobile ? '56px 24px 44px' : '80px 64px 56px',
      }}>

        {/* Forme abstraite de fond — cercles filaires épars */}
        {!isMobile && (
          <svg viewBox="0 0 1100 480" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            opacity: isLight ? 0.2 : 0.35, zIndex: 0, pointerEvents: 'none',
          }}>
            {[
              { cx: 850, cy: 80,  r: 70  },
              { cx: 950, cy: 180, r: 95  },
              { cx: 1050, cy: 90, r: 55  },
              { cx: 780, cy: 220, r: 60  },
              { cx: 920, cy: 330, r: 110 },
              { cx: 1080, cy: 380, r: 70 },
              { cx: 1000, cy: 450, r: 45 },
            ].map((c, i) => {
              const twinkleDuration = 3 + (i % 4) * 1.1
              const twinkleDelay = -(i * 0.6)
              const orbitDuration = 8 + (i % 3) * 2.3
              const orbitDelay = -(i * 1.1)
              const flowDuration = 14 + (i % 5) * 2
              const flowDelay = -(i * 1.4)
              const orbitX = i % 2 === 0 ? 5 + i : -(5 + i)
              const orbitY = i % 3 === 0 ? -8 - i : 8 + i
              const baseOpacity = 0.9 - (i % 3) * 0.15
              const circumference = 2 * Math.PI * c.r

              return (
                <g
                  key={i}
                  style={{
                    '--orbit-x': `${orbitX}px`,
                    '--orbit-y': `${orbitY}px`,
                    animation: `orbitFloat ${orbitDuration}s ease-in-out infinite`,
                    animationDelay: `${orbitDelay}s`,
                    transformOrigin: `${c.cx}px ${c.cy}px`,
                  }}
                >
                  <circle
                    cx={c.cx} cy={c.cy} r={c.r}
                    fill="none"
                    stroke={a}
                    strokeWidth="1.2"
                    style={{
                      '--star-op': baseOpacity,
                      animation: `constellationTwinkle ${twinkleDuration}s ease-in-out infinite`,
                      animationDelay: `${twinkleDelay}s`,
                    }}
                  />
                  <circle
                    cx={c.cx} cy={c.cy} r={c.r}
                    fill="none"
                    stroke={a}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeDasharray={`10 ${circumference - 10}`}
                    opacity="0.85"
                    style={{
                      animation: `signalFlow ${flowDuration}s linear infinite`,
                      animationDelay: `${flowDelay}s`,
                    }}
                  />
                </g>
              )
            })}
          </svg>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <RevealOnScroll direction="up" delay={0} as="div" style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.4em', color: a, marginBottom: 16, textTransform: 'uppercase' }}>
            03 // PROJETS
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={0} as="div" style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 28 : 44, color: eff.texte, letterSpacing: '-0.02em', marginBottom: isMobile ? 32 : 50 }}>
            Constellation <span style={{ color: a, fontStyle: 'italic', fontWeight: 500 }}>de travaux</span>
          </RevealOnScroll>

          {/* DESKTOP : cercles-images superposés en constellation */}
          {!isMobile && (() => {
            const positions = [
              { cx: 150, cy: 150, r: 120, tx: 60, ty: 100, tw: 180 },
              { cx: 330, cy: 90, r: 80, tx: 280, ty: 55, tw: 100 },
              { cx: 420, cy: 220, r: 95, tx: 335, ty: 180, tw: 170 },
              { cx: 570, cy: 110, r: 65, tx: 520, ty: 80, tw: 100 },
              { cx: 590, cy: 260, r: 55, tx: 550, ty: 235, tw: 85 },
              { cx: 250, cy: 270, r: 50, tx: 215, ty: 245, tw: 75 },
            ]
            const items = projetsAffiches.slice(0, 6)
            return (
              <div style={{ position: 'relative', height: 340 }}>
                {items.map((p, i) => {
                  const pos = positions[i]
                  const isActive = projetSurvoleIdx === i
                  const size = pos.r * 2
                  return (
                    <RevealOnScroll
                      key={p.num || i}
                      as="div"
                      direction="none"
                      delay={i * 100}
                      style={{
                        position: 'absolute',
                        left: pos.cx - pos.r,
                        top: pos.cy - pos.r,
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        onMouseEnter={() => setProjetSurvoleIdx(i)}
                        onMouseLeave={() => setProjetSurvoleIdx(null)}
                        onClick={() => p.lien && window.open(p.lien, '_blank', 'noopener')}
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'relative',
                          cursor: 'pointer',
                          border: `${isActive ? 2 : 1}px solid ${isActive ? a : (isLight ? 'rgba(20,20,20,0.4)' : 'rgba(242,240,236,0.4)')}`,
                          boxShadow: isActive ? `0 0 30px rgba(${aRgb},0.35)` : 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.25s',
                          transform: isActive ? 'scale(1.04)' : 'scale(1)',
                          background: eff.cardBg,
                        }}
                      >
                        <img
                          src={p.img}
                          alt={p.titre}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: isActive ? 'brightness(0.85)' : 'brightness(0.55)',
                            transition: 'filter 0.2s',
                          }}
                          onError={e => { e.currentTarget.style.display = 'none' }}
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)',
                          pointerEvents: 'none',
                        }} />
                        <div style={{
                          position: 'absolute',
                          bottom: size * 0.14,
                          left: 8,
                          right: 8,
                          textAlign: 'center',
                          pointerEvents: 'none',
                        }}>
                          <div style={{
                            fontFamily: 'Space Mono, monospace',
                            fontSize: isActive ? 8 : 7,
                            color: isActive ? a : 'rgba(255,255,255,0.6)',
                            marginBottom: 4,
                            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                          }}>
                            {p.num || String(i + 1).padStart(2, '0')}{isActive ? ' · EN VEDETTE' : ''}
                          </div>
                          <div style={{
                            fontFamily: 'Fraunces, serif',
                            fontWeight: isActive ? 800 : 700,
                            fontSize: Math.max(10, Math.min(isActive ? 18 : 13, size * 0.11)),
                            color: '#fff',
                            lineHeight: 1.2,
                            textShadow: '0 1px 6px rgba(0,0,0,0.7)',
                            transition: 'font-size 0.2s',
                          }}>
                            {p.titre}
                          </div>
                        </div>
                      </div>
                    </RevealOnScroll>
                  )
                })}
              </div>
            )
          })()}

          {/* MOBILE : liste verticale simplifiée */}
          {isMobile && (() => {
            const positionsMobile = [
              { x: 5, y: 10, size: 110, fs: 11 },
              { x: 100, y: 0, size: 80, fs: 9 },
              { x: 150, y: 75, size: 100, fs: 11 },
              { x: 10, y: 130, size: 90, fs: 10 },
              { x: 90, y: 180, size: 75, fs: 9 },
              { x: 160, y: 195, size: 65, fs: 8 },
            ]
            const items = projetsAffiches.slice(0, 6)
            return (
              <div style={{ position: 'relative', height: 280, marginBottom: 8 }}>
                {items.map((p, i) => {
                  const pos = positionsMobile[i]
                  const isActive = projetSurvoleIdx === i
                  return (
                    <RevealOnScroll
                      key={p.num || i}
                      as="a"
                      direction="none"
                      delay={i * 100}
                      href={p.lien || '/projets'}
                      target={p.lien ? '_blank' : undefined}
                      rel={p.lien ? 'noopener' : undefined}
                      onTouchStart={() => setProjetSurvoleIdx(i)}
                      style={{
                        position: 'absolute',
                        left: pos.x,
                        top: pos.y,
                        width: pos.size,
                        height: pos.size,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        display: 'block',
                        border: `${isActive ? 2 : 1}px solid ${isActive ? a : (isLight ? 'rgba(20,20,20,0.3)' : 'rgba(242,240,236,0.3)')}`,
                        background: eff.cardBg,
                      }}
                    >
                      <img
                        src={p.img}
                        alt={p.titre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }}
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)',
                        pointerEvents: 'none',
                      }} />
                      <div style={{
                        position: 'absolute', top: 8, left: 8,
                        fontFamily: 'Space Mono, monospace', fontSize: 6,
                        color: 'rgba(255,255,255,0.6)',
                      }}>
                        {p.num || String(i + 1).padStart(2, '0')}
                      </div>
                      <div style={{
                        position: 'absolute', bottom: pos.size * 0.08, left: 4, right: 4,
                        textAlign: 'center',
                        fontFamily: 'Fraunces, serif', fontWeight: 700,
                        fontSize: pos.fs,
                        color: '#fff',
                        lineHeight: 1.15,
                        textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                      }}>
                        {p.titre}
                      </div>
                    </RevealOnScroll>
                  )
                })}
              </div>
            )
          })()}

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: isMobile ? 24 : 20, flexWrap: 'wrap', gap: 14,
          }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: '0.1em', color: eff.textFaint }}>
              {projets.length} PROJETS DÉPLOYÉS{!isMobile ? ' · SURVOLEZ POUR EXPLORER' : ''}
            </span>
            <a href="/projets" style={{
              padding: '12px 26px',
              background: isLight ? '#141414' : '#f2f0ec',
              color: isLight ? '#f5f5f0' : '#0a0a0a',
              borderRadius: 2,
              fontFamily: 'Space Mono, monospace',
              fontSize: 9,
              letterSpacing: '0.15em',
              fontWeight: 700,
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}>
              Tout voir →
            </a>
          </div>
        </div>
      </section>

      <section id="pf-github" style={{
        position: 'relative',
        overflow: 'hidden',
        background: eff.fond,
        padding: isMobile ? '56px 24px 70px' : '100px 64px 120px',
      }}>
        <RevealOnScroll direction="up" delay={0} as="div" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: isMobile ? 40 : 70, flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.4em', color: a, marginBottom: 18, textTransform: 'uppercase' }}>
              03.5 // ACTIVITÉ
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 34 : 62, color: eff.texte, letterSpacing: '-0.025em', lineHeight: 0.98 }}>
              Activité <span style={{ color: a, fontStyle: 'italic', fontWeight: 500 }}>GitHub</span>
            </div>
          </div>

          <a
            href="https://github.com/DevJ-58"
            target="_blank" rel="noopener"
            style={{
              fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.15em',
              color: a, borderBottom: `1px solid rgba(${aRgb},0.3)`, paddingBottom: 4,
              textDecoration: 'none',
            }}
          >
            @DevJ-58 →
          </a>
        </RevealOnScroll>

        {githubLoading && (
          <div style={{
            padding: '40px 0',
            fontFamily: 'Space Mono, monospace', fontSize: 10,
            color: `rgba(${aRgb},0.4)`, letterSpacing: '0.2em',
            animation: 'pulse 1.5s infinite',
          }}>
            // CONNEXION AU RÉSEAU GITHUB...
          </div>
        )}

        {githubError && (
          <div style={{
            padding: '40px 0',
            fontFamily: 'Space Mono, monospace', fontSize: 10,
            color: `rgba(${aRgb},0.5)`, letterSpacing: '0.15em',
          }}>
            // ERREUR DE CONNEXION — DONNÉES INDISPONIBLES
          </div>
        )}

        {githubData && (() => {
          const contributions = githubData.contributions ?? []
          const weeks = []
          let currentWeek = []
          contributions.forEach((day, i) => {
            const date = new Date(day.date)
            const dow = date.getDay()
            if (i === 0) {
              for (let p = 0; p < dow; p++) currentWeek.push(null)
            }
            currentWeek.push(day)
            if (dow === 6 || i === contributions.length - 1) {
              while (currentWeek.length < 7) currentWeek.push(null)
              weeks.push([...currentWeek])
              currentWeek = []
            }
          })

          const CELL = isMobile ? 12 : 16
          const GAP = isMobile ? 4 : 5
          const DAY_LABELS = ['', 'LUN', '', 'MER', '', 'VEN', '']

          const monthLabels = []
          weeks.forEach((week, wi) => {
            const first = week.find(d => d !== null)
            if (!first) return
            const d = new Date(first.date)
            if (d.getDate() <= 7) {
              monthLabels.push({
                wi,
                label: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase(),
              })
            }
          })

          return (
            <RevealOnScroll direction="up" delay={200} as="div" style={{ position: 'relative', marginBottom: isMobile ? 56 : 90 }}>
              <div style={{
                fontFamily: 'Space Mono, monospace', fontSize: 10, color: eff.textFaint,
                letterSpacing: '0.15em', marginBottom: 28,
              }}>
                {`${githubData.total?.lastYear ?? '—'} CONTRIBUTIONS · DERNIÈRE ANNÉE`}
              </div>

              <div style={{
                overflowX: 'auto', WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 4,
              }}>
                <style>{`.github-grand-scroll::-webkit-scrollbar { display: none; }`}</style>
                <div className="github-grand-scroll" style={{ display: 'inline-flex', flexDirection: 'column', minWidth: 'max-content' }}>
                  <div style={{ display: 'flex', marginLeft: !isMobile ? 34 : 0, marginBottom: 10, height: 18, position: 'relative' }}>
                    {monthLabels.map(({ wi, label }) => (
                      <div key={`${wi}-${label}`} style={{
                        position: 'absolute', left: wi * (CELL + GAP),
                        fontFamily: 'Space Mono, monospace', fontSize: 8,
                        color: eff.textFaint, letterSpacing: '0.1em', whiteSpace: 'nowrap',
                      }}>{label}</div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 0 }}>
                    {!isMobile && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 10 }}>
                        {DAY_LABELS.map((lbl, i) => (
                          <div key={i} style={{
                            height: CELL, fontFamily: 'Space Mono, monospace', fontSize: 7,
                            color: eff.textFaint, display: 'flex', alignItems: 'center',
                            justifyContent: 'flex-end', width: 24, letterSpacing: '0.05em',
                          }}>{lbl}</div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: GAP }}>
                      {weeks.map((week, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                          {week.map((day, di) => {
                            if (!day) return <div key={di} style={{ width: CELL, height: CELL, borderRadius: 2, background: 'transparent' }} />
                            const color = getContribColor(day.count, a, aRgb)
                            const isActive = day.count > 0
                            return (
                              <div
                                key={di}
                                style={{
                                  width: CELL, height: CELL, borderRadius: 2,
                                  background: color,
                                  border: isActive ? `1px solid rgba(${aRgb},0.4)` : `1px solid ${isLight ? 'rgba(20,20,20,0.08)' : 'rgba(242,240,236,0.06)'}`,
                                  boxShadow: day.count > 8 ? `0 0 8px rgba(${aRgb},0.5)` : 'none',
                                  cursor: isActive ? 'pointer' : 'default',
                                  transition: 'transform 0.15s, box-shadow 0.15s',
                                  position: 'relative',
                                }}
                                onMouseEnter={e => {
                                  if (!isActive) return
                                  e.currentTarget.style.transform = 'scale(1.4)'
                                  e.currentTarget.style.boxShadow = `0 0 14px rgba(${aRgb},0.8)`
                                  e.currentTarget.style.zIndex = '50'
                                  const rect = e.currentTarget.getBoundingClientRect()
                                  setTooltipInfo({ x: rect.left + rect.width / 2, y: rect.top - 8, date: day.date, count: day.count })
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.transform = 'scale(1)'
                                  e.currentTarget.style.boxShadow = day.count > 8 ? `0 0 8px rgba(${aRgb},0.5)` : 'none'
                                  e.currentTarget.style.zIndex = 'auto'
                                  setTooltipInfo(null)
                                }}
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: eff.textFaint, letterSpacing: '0.1em' }}>MOINS</span>
                {[0, 2, 5, 9, 15].map(v => (
                  <div key={v} style={{ width: CELL, height: CELL, borderRadius: 2, background: getContribColor(v, a, aRgb), border: `1px solid rgba(${aRgb},0.2)` }} />
                ))}
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: eff.textFaint, letterSpacing: '0.1em' }}>PLUS</span>
              </div>
            </RevealOnScroll>
          )
        })()}

        {githubData && (() => {
          const contribs = githubData.contributions ?? []
          let maxStreak = 0, cur = 0
          contribs.forEach(d => { if (d.count > 0) { cur++; if (cur > maxStreak) maxStreak = cur } else cur = 0 })
          const stats = [
            [githubData.total?.lastYear ?? '—', 'Contributions'],
            [maxStreak, 'Jours consécutifs'],
            [contribs.filter(d => d.count > 0).length, 'Jours actifs'],
            [Math.max(...contribs.map(d => d.count), 0), 'Best day'],
          ]
          return (
            <div>
              <div style={{ height: 1, background: isLight ? 'rgba(20,20,20,0.1)' : 'rgba(242,240,236,0.1)', marginBottom: isMobile ? 40 : 60 }} />
              <RevealOnScroll direction="up" delay={350} as="div" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: isMobile ? '36px 24px' : 40,
              }}>
                {stats.map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 40 : 64, color: a, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
                      {v}
                    </div>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9, letterSpacing: '0.12em', color: eff.textFaint, marginTop: 12, textTransform: 'uppercase' }}>
                      {l}
                    </div>
                  </div>
                ))}
              </RevealOnScroll>
            </div>
          )
        })()}
      </section>

      <section id="pf-services" style={{
        position: 'relative',
        overflow: 'hidden',
        background: eff.fond,
        padding: isMobile ? '56px 24px 70px' : '100px 64px 130px',
      }}>
        {/* Réseau radial abstrait de fond — étendu et bien plus visible */}
        {!isMobile && (
          <svg viewBox="0 0 900 900" style={{
            position: 'absolute', right: -180, top: '50%', transform: 'translateY(-50%)',
            width: 780, height: 780,
            opacity: isLight ? 0.35 : 0.55, zIndex: 0, pointerEvents: 'none',
          }}>
            <g stroke={isLight ? 'rgba(20,20,20,0.35)' : 'rgba(242,240,236,0.4)'} fill="none" strokeWidth="1.6">
              <path d="M 900 860 A 720 720 0 0 0 180 140" style={{ strokeDasharray: '8 14', animation: 'networkSignal 8s linear infinite', animationDelay: '0s' }} />
              <path d="M 900 700 A 560 560 0 0 0 340 140" style={{ strokeDasharray: '8 14', animation: 'networkSignal 9.5s linear infinite', animationDelay: '-2s' }} />
              <path d="M 900 540 A 400 400 0 0 0 500 140" style={{ strokeDasharray: '8 14', animation: 'networkSignal 11s linear infinite', animationDelay: '-4s' }} />
              <path d="M 900 380 A 240 240 0 0 0 660 140" style={{ strokeDasharray: '8 14', animation: 'networkSignal 12.5s linear infinite', animationDelay: '-6s' }} />
            </g>
            <g stroke={a} strokeWidth="2.2">
              <line x1="470" y1="470" x2="600" y2="210" />
              <circle cx="600" cy="210" r="7" fill={a} />
            </g>
            <g stroke={isLight ? 'rgba(20,20,20,0.4)' : 'rgba(242,240,236,0.45)'} strokeWidth="1.8">
              <line x1="470" y1="470" x2="740" y2="310" />
              <circle cx="740" cy="310" r="8" fill={isLight ? 'rgba(20,20,20,0.45)' : 'rgba(242,240,236,0.55)'} style={{ '--node-op': 0.72, '--node-r': 8, animation: 'nodeBreathe 3s ease-in-out infinite', animationDelay: '0s' }} />
              <line x1="470" y1="470" x2="800" y2="470" />
              <circle cx="800" cy="470" r="5" fill={isLight ? 'rgba(20,20,20,0.35)' : 'rgba(242,240,236,0.45)'} style={{ '--node-op': 0.68, '--node-r': 5, animation: 'nodeBreathe 4s ease-in-out infinite', animationDelay: '-1s' }} />
              <line x1="470" y1="470" x2="720" y2="640" />
              <circle cx="720" cy="640" r="10" fill={isLight ? 'rgba(20,20,20,0.3)' : 'rgba(242,240,236,0.35)'} style={{ '--node-op': 0.8, '--node-r': 10, animation: 'nodeBreathe 5s ease-in-out infinite', animationDelay: '-2s' }} />
              <line x1="470" y1="470" x2="560" y2="720" />
              <circle cx="560" cy="720" r="6" fill={isLight ? 'rgba(20,20,20,0.35)' : 'rgba(242,240,236,0.4)'} style={{ '--node-op': 0.7, '--node-r': 6, animation: 'nodeBreathe 4.5s ease-in-out infinite', animationDelay: '-3s' }} />
            </g>
          </svg>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <RevealOnScroll as="div" direction="up" delay={0} style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.4em', color: a, marginBottom: 16, textTransform: 'uppercase' }}>
            04 // SERVICES
          </RevealOnScroll>
          <RevealOnScroll as="div" direction="up" delay={0} style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 30 : 48, color: eff.texte, marginBottom: isMobile ? 50 : 90, letterSpacing: '-0.02em' }}>
            Offres <span style={{ color: a, fontStyle: 'italic', fontWeight: 500 }}>& tarifs</span>
          </RevealOnScroll>

          {services.map((sv, i) => {
            const isPopular = !!sv.badge
            const prixParts = sv.prix.split(' ')
            const hasCurrency = prixParts[prixParts.length - 1] === 'FCFA'
            const priceMain = hasCurrency ? prixParts.slice(0, -1).join(' ') : sv.prix
            const currency = hasCurrency ? 'FCFA' : ''
            const descriptionCourte = (sv.features || []).slice(0, 2).join(', ')
            const featuresRestantes = (sv.features || []).slice(2)

            return (
              <RevealOnScroll
                key={sv.titre}
                as="div"
                direction="up"
                delay={i * 150}
                style={{
                  position: 'relative',
                  padding: isMobile ? '44px 0' : '64px 0',
                  borderBottom: i < services.length - 1
                    ? `1px solid ${isLight ? 'rgba(20,20,20,0.1)' : 'rgba(242,240,236,0.1)'}`
                    : 'none',
                }}
              >
                <span style={{
                  position: 'absolute',
                  right: isMobile ? -8 : 0,
                  top: isMobile ? -14 : -24,
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 800,
                  fontSize: isMobile ? 100 : 190,
                  color: isPopular ? a : eff.texte,
                  opacity: isPopular ? 0.1 : 0.045,
                  lineHeight: 1,
                  userSelect: 'none',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {isPopular && (
                  <span style={{
                    position: 'relative',
                    display: 'inline-block',
                    fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.15em',
                    color: a, border: `1px solid rgba(${aRgb},0.4)`, borderRadius: 20,
                    padding: '3px 10px', marginBottom: 14, zIndex: 1,
                  }}>
                    POPULAIRE
                  </span>
                )}

                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 10,
                  marginBottom: 4, position: 'relative', zIndex: 1,
                }}>
                  <span style={{
                    fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
                    letterSpacing: '0.15em', color: `rgba(${aRgb},0.5)`,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontFamily: 'Fraunces, serif', fontWeight: 800,
                    fontSize: isMobile ? 38 : 68, color: eff.texte,
                    lineHeight: 1, letterSpacing: '-0.025em',
                  }}>
                    {sv.titre}
                  </span>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 10,
                  marginBottom: isMobile ? 18 : 26, position: 'relative', zIndex: 1,
                  paddingLeft: isMobile ? 0 : 26,
                }}>
                  <span style={{
                    fontFamily: 'Fraunces, serif', fontWeight: 700, fontStyle: 'italic',
                    fontSize: isMobile ? 22 : 30, color: a,
                  }}>
                    {priceMain}
                  </span>
                  {currency && (
                    <span style={{
                      fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 10 : 12,
                      color: `rgba(${aRgb},0.55)`, letterSpacing: '0.05em',
                    }}>
                      {currency}
                    </span>
                  )}
                  <span style={{
                    fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
                    color: eff.textFaint, letterSpacing: '0.1em', marginLeft: 10,
                  }}>
                    · {sv.delai.toUpperCase()}
                  </span>
                </div>

                <div style={{
                  fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: isMobile ? 14 : 16,
                  color: eff.textMuted, lineHeight: 1.7, maxWidth: 480,
                  paddingLeft: isMobile ? 0 : 26, marginBottom: featuresRestantes.length ? 16 : 0,
                  position: 'relative', zIndex: 1,
                }}>
                  {descriptionCourte}.
                </div>

                {featuresRestantes.length > 0 && (
                  <div style={{
                    display: 'flex', gap: isMobile ? 10 : 16, flexWrap: 'wrap',
                    paddingLeft: isMobile ? 0 : 26, position: 'relative', zIndex: 1,
                  }}>
                    {featuresRestantes.map(f => (
                      <span key={f} style={{
                        fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
                        letterSpacing: '0.06em', color: `rgba(${aRgb},0.5)`,
                      }}>
                        ✓ {f.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </RevealOnScroll>
            )
          })}

          <RevealOnScroll as="div" direction="up" delay={services.length * 150 + 100} style={{
            marginTop: isMobile ? 40 : 56, display: 'flex', alignItems: 'center',
            gap: 24, flexWrap: 'wrap',
          }}>
            <a href="mailto:devfred58@gmail.com" style={{
              padding: isMobile ? '14px 26px' : '16px 34px',
              background: isLight ? '#141414' : '#f2f0ec',
              color: isLight ? '#f5f5f0' : '#0a0a0a',
              borderRadius: 2,
              fontFamily: 'Space Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.15em',
              fontWeight: 700,
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}>
              Demander un devis
            </a>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.1em', color: eff.textFaint }}>
              RÉPONSE SOUS 24H
            </span>
          </RevealOnScroll>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section id="pf-methodology" style={{ ...sectionStyle, position: 'relative', overflow: 'hidden' }}>
        {/* Brume gauche */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          width: isMobile ? 160 : 320,
          height: isMobile ? 300 : 460,
          background: `radial-gradient(ellipse at center, rgba(${aRgb},0.16) 0%, rgba(${aRgb},0.06) 45%, transparent 75%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Brume droite */}
        <div style={{
          position: 'absolute',
          top: '50%',
          right: 0,
          transform: 'translateY(-50%)',
          width: isMobile ? 160 : 320,
          height: isMobile ? 300 : 460,
          background: `radial-gradient(ellipse at center, rgba(${aRgb},0.16) 0%, rgba(${aRgb},0.06) 45%, transparent 75%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={s.secNum}>05 // MÉTHODE</div>
          <RevealOnScroll as="h2" direction="up" delay={0} style={s.secTitle}>Ma <span style={s.accent}>Méthode</span></RevealOnScroll>

          {/* Sommaire — onglets fins */}
          <div style={{
            display: 'flex',
            gap: isMobile ? 14 : 26,
            marginBottom: isMobile ? 28 : 44,
            borderBottom: `1px solid ${eff.borderLight}`,
            paddingBottom: 14,
            flexWrap: isMobile ? 'nowrap' : 'wrap',
            overflowX: isMobile ? 'auto' : 'visible',
            WebkitOverflowScrolling: 'touch',
          }}>
            {etapes.map((e, i) => (
              <button
                key={e.n || i}
                onClick={() => setEtapeActive(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'Space Mono, monospace',
                  fontSize: isMobile ? 8 : 9,
                  letterSpacing: '0.15em',
                  color: i === etapeActive ? a : eff.textFaint,
                  borderBottom: i === etapeActive ? `1px solid ${a}` : '1px solid transparent',
                  paddingBottom: 6,
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                {e.n || String(i + 1).padStart(2, '0')} {e.titre}
              </button>
            ))}
          </div>

          {/* Page active en pleine grandeur — carrousel */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch', gap: isMobile ? 8 : 20 }}>
            {!isMobile && (
              <button
                onClick={() => setEtapeActive((etapeActive - 1 + etapes.length) % etapes.length)}
                aria-label="Étape précédente"
                style={{
                  background: 'none',
                  border: `1px solid ${eff.borderMedium}`,
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  alignSelf: 'center',
                  cursor: 'pointer',
                  color: eff.textFaint,
                  fontSize: 16,
                  fontFamily: 'Space Mono, monospace',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={ev => { ev.currentTarget.style.borderColor = `rgba(${aRgb},0.5)`; ev.currentTarget.style.color = a }}
                onMouseLeave={ev => { ev.currentTarget.style.borderColor = eff.borderMedium; ev.currentTarget.style.color = eff.textFaint }}
              >
                ←
              </button>
            )}

            {(() => {
              const e = etapes[etapeActive]
              const i = etapeActive
              return (
                <div key={i} style={{
                  position: 'relative',
                  minHeight: isMobile ? 'auto' : 340,
                  animation: 'fadeInUp 0.4s ease',
                  flex: 1,
                  minWidth: 0,
                }}>
                  <span style={{
                    position: 'absolute',
                    right: isMobile ? -10 : -20,
                    bottom: isMobile ? -10 : -30,
                    fontFamily: 'Fraunces, serif',
                    fontWeight: 800,
                    fontSize: isMobile ? 140 : 280,
                    color: a,
                    opacity: 0.08,
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}>
                    {e.n || String(i + 1).padStart(2, '0')}
                  </span>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: isMobile ? 8 : 9,
                      letterSpacing: '0.2em',
                      color: eff.textFaint,
                      marginBottom: isMobile ? 12 : 16,
                      textTransform: 'uppercase',
                    }}>
                      CHAPITRE {e.n || String(i + 1).padStart(2, '0')} · {e.duree}
                    </div>

                    <div style={{
                      fontFamily: 'Fraunces, serif',
                      fontWeight: 800,
                      fontSize: isMobile ? 40 : 64,
                      lineHeight: 0.96,
                      color: eff.texte,
                      letterSpacing: '-0.02em',
                      marginBottom: isMobile ? 20 : 28,
                      maxWidth: isMobile ? '100%' : 560,
                    }}>
                      {e.titre}
                    </div>

                    <div style={{
                      fontFamily: 'Fraunces, serif',
                      fontStyle: 'italic',
                      fontSize: isMobile ? 14 : 17,
                      lineHeight: 1.7,
                      color: eff.textMuted,
                      maxWidth: isMobile ? '100%' : 500,
                      marginBottom: isMobile ? 22 : 28,
                    }}>
                      {e.desc}
                    </div>

                    {(e.livrables || []).length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        marginBottom: isMobile ? 22 : 28,
                        maxWidth: isMobile ? '100%' : 420,
                      }}>
                        {e.livrables.map(l => (
                          <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: a }}>→</span>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: isMobile ? 12 : 13, color: eff.textMuted }}>
                              {l}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: isMobile ? 16 : 24, flexWrap: 'wrap' }}>
                      {(e.tags || []).map(t => (
                        <span key={t} style={{
                          fontFamily: 'Space Mono, monospace',
                          fontSize: isMobile ? 8 : 9,
                          letterSpacing: '0.1em',
                          color: a,
                          borderBottom: `1px solid rgba(${aRgb},0.4)`,
                          paddingBottom: 4,
                        }}>
                          {t.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            {!isMobile && (
              <button
                onClick={() => setEtapeActive((etapeActive + 1) % etapes.length)}
                aria-label="Étape suivante"
                style={{
                  background: 'none',
                  border: `1px solid ${eff.borderMedium}`,
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  alignSelf: 'center',
                  cursor: 'pointer',
                  color: eff.textFaint,
                  fontSize: 16,
                  fontFamily: 'Space Mono, monospace',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={ev => { ev.currentTarget.style.borderColor = `rgba(${aRgb},0.5)`; ev.currentTarget.style.color = a }}
                onMouseLeave={ev => { ev.currentTarget.style.borderColor = eff.borderMedium; ev.currentTarget.style.color = eff.textFaint }}
              >
                →
              </button>
            )}
          </div>

          {/* Points indicateurs du carrousel */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: isMobile ? 24 : 32 }}>
            {etapes.map((e, i) => (
              <button
                key={e.n || i}
                onClick={() => setEtapeActive(i)}
                aria-label={`Aller à l'étape ${i + 1}`}
                style={{
                  width: i === etapeActive ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  background: i === etapeActive ? a : eff.borderMedium,
                  transition: 'width 0.3s cubic-bezier(.65,0,.35,1), background 0.3s',
                }}
              />
            ))}
          </div>

          {/* Pied de page magazine */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: isMobile ? 24 : 32,
            borderTop: `1px solid ${eff.borderLight}`,
            paddingTop: 20,
            flexWrap: 'wrap',
            gap: 14,
          }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: '0.15em', color: eff.textFaint }}>
              P. {String(etapeActive + 1).padStart(2, '0')} / {String(etapes.length).padStart(2, '0')}
            </span>
            <button
              onClick={() => setEtapeActive((etapeActive + 1) % etapes.length)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: a,
                color: '#050505',
                border: 'none',
                borderRadius: 8,
                padding: isMobile ? '10px 18px' : '12px 24px',
                fontFamily: 'Space Mono, monospace',
                fontSize: isMobile ? 9 : 10,
                letterSpacing: '0.15em',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 0 20px rgba(${aRgb},0.25)`,
                transition: 'opacity 0.2s, transform 0.2s',
              }}
              onMouseEnter={ev => { ev.currentTarget.style.opacity = '0.88'; ev.currentTarget.style.transform = 'translateX(3px)' }}
              onMouseLeave={ev => { ev.currentTarget.style.opacity = '1'; ev.currentTarget.style.transform = 'translateX(0)' }}
            >
              SUIVANT · {etapes[(etapeActive + 1) % etapes.length].titre.toUpperCase()} →
            </button>
          </div>
        </div>
      </section>
      <section id="pf-contact" style={{ ...sectionStyle, position: 'relative', overflow: 'hidden' }}>
        {/* Réseau abstrait de fond — nœud central relié à des satellites */}
        {!isMobile && (
          <svg viewBox="0 0 600 680" style={{
            position: 'absolute', right: -80, top: '50%', transform: 'translateY(-50%)',
            width: 560, height: 640, opacity: isLight ? 0.3 : 0.45, zIndex: 0, pointerEvents: 'none',
          }}>
            <path d="M 130 160 C 230 160, 230 280, 300 280" fill="none" stroke={a} strokeWidth="1.4" />
            <path d="M 130 480 C 230 480, 230 360, 300 360" fill="none" stroke={a} strokeWidth="1.4" />
            <path d="M 500 160 C 400 160, 400 280, 300 280" fill="none" stroke={a} strokeWidth="1.4" />
            <path d="M 500 480 C 400 480, 400 360, 300 360" fill="none" stroke={a} strokeWidth="1.4" />
            <line x1="30" y1="320" x2="255" y2="320" stroke={a} strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />
            <line x1="345" y1="320" x2="570" y2="320" stroke={a} strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />

            <g transform="translate(300,320)">
              <rect x="-32" y="-32" width="64" height="64" rx="10" fill={eff.fond} stroke={a} strokeWidth="1.6" transform="rotate(45)" />
              <polygon points="0,-20 17,-10 17,10 0,20 -17,10 -17,-10" fill="none" stroke={a} strokeWidth="1.6" />
            </g>

            {[[130,160],[130,480],[500,160],[500,480]].map(([cx,cy], idx) => (
              <g key={idx}>
                <circle cx={cx} cy={cy} r={54} fill={isLight ? 'rgba(20,20,20,0.04)' : 'rgba(242,240,236,0.03)'} stroke={a} strokeWidth="1" />
                <circle cx={cx} cy={cy} r={11} fill={a} opacity="0.6" />
              </g>
            ))}
          </svg>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={s.secNum}>06 // CONTACT</div>

          <RevealOnScroll as="div" direction="up" delay={0} style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 800,
            fontSize: isMobile ? 40 : 88,
            lineHeight: isMobile ? 1.02 : 0.94,
            color: eff.texte,
            letterSpacing: '-0.03em',
            marginBottom: isMobile ? 28 : 44,
            maxWidth: isMobile ? '100%' : 640,
          }}>
            Travaillons <span style={{ color: a, fontStyle: 'italic', fontWeight: 500 }}>ensemble</span>.
          </RevealOnScroll>

          {accesDirecte && (
            <AxisBouton
              isMobile={isMobile}
              a={a}
              aRgb={aRgb}
              navigate={navigate}
              eff={eff}
            />
          )}

          <RevealOnScroll as="div" direction="up" delay={150} style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: isMobile ? 16 : 22,
            lineHeight: 1.6,
            color: eff.textMuted,
            maxWidth: isMobile ? '100%' : 480,
            marginBottom: isMobile ? 28 : 40,
          }}>
            Un projet en tête ? Que ce soit une refonte, une application sur mesure ou une collaboration ponctuelle — je suis disponible pour des missions freelance, des collaborations et des opportunités à temps plein.
          </RevealOnScroll>

          <RevealOnScroll as="div" direction="up" delay={200} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: isMobile ? 44 : 64,
            padding: '12px 20px',
            background: `rgba(${aRgb},0.06)`,
            border: `1px solid rgba(${aRgb},0.2)`,
            borderRadius: 50,
            width: 'fit-content',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: a, animation: 'pulse 1.4s infinite' }} />
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: a, letterSpacing: '0.2em' }}>
              DISPONIBLE POUR DE NOUVEAUX PROJETS
            </span>
          </RevealOnScroll>

          <div style={{ maxWidth: isMobile ? '100%' : 640 }}>
            {[
              { label: 'Email', val: 'devfred58@gmail.com', href: 'mailto:devfred58@gmail.com', desc: 'Réponse sous 24h' },
              { label: 'Téléphone', val: '+225 0767998373', href: 'tel:+2250767998373', desc: 'Lun–Sam, 8h–18h' },
              { label: 'WhatsApp', val: 'Envoyer un message', href: 'https://wa.me/2250767998373', desc: 'Chat rapide' },
              { label: 'LinkedIn', val: 'Voir le profil', href: 'https://www.linkedin.com/in/frejus-kouadio-316238329', desc: 'Réseau professionnel' },
            ].map(({ label, val, href, desc }, ci) => (
              <RevealOnScroll key={label} as="a" direction="up" delay={250 + ci * 100}
                href={href} target="_blank" rel="noopener"
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'baseline',
                  gap: isMobile ? 4 : 16,
                  padding: isMobile ? '20px 0' : '28px 0',
                  borderBottom: `1px solid ${isLight ? 'rgba(20,20,20,0.1)' : 'rgba(242,240,236,0.1)'}`,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9, color: `rgba(${aRgb},0.5)`, letterSpacing: '0.15em' }}>
                    {String(ci + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 26 : 40, color: eff.texte, letterSpacing: '-0.02em' }}>
                    {label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 500, fontSize: isMobile ? 13 : 16, color: a }}>
                    {val}
                  </span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: eff.textFaint, letterSpacing: '0.08em' }}>
                    · {desc.toUpperCase()}
                  </span>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll as="div" direction="up" delay={650} style={{ marginTop: isMobile ? 44 : 64 }}>
            <a href="mailto:devfred58@gmail.com"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: isMobile ? 'center' : undefined, gap: 12,
                background: a, color: '#050505',
                padding: isMobile ? '16px 20px' : '18px 44px',
                fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 11 : 12,
                letterSpacing: '0.2em', fontWeight: 700,
                textDecoration: 'none', borderRadius: 8,
                transition: 'opacity 0.2s, transform 0.2s',
                boxShadow: `0 0 30px rgba(${aRgb},0.3)`,
                width: isMobile ? '100%' : 'auto'
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              DÉMARRER UN PROJET →
            </a>
            <p style={{ marginTop: 16, fontFamily: 'Space Mono, monospace', fontSize: 9, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.15em' }}>
              Ou envoyez un message sur WhatsApp pour une réponse rapide
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: isMobile ? '24px 20px' : '40px 80px',
        borderTop: `1px solid rgba(${aRgb},0.08)`,
        background: isLight ? 'rgba(220,224,230,0.7)' : 'rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'center' : 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 14, color: eff.texte, letterSpacing: '0.06em' }}>
            &lt;<span style={{ color: a }}>/DevJ</span>&gt;
          </div>
          <div style={{ width: 1, height: 20, background: eff.borderStrong }} />
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: `rgba(${aRgb},0.45)`, letterSpacing: '0.15em', display: isMobile ? 'none' : 'block' }}>
            FRÉJUS KOUADIO · DÉVELOPPEUR LOGICIEL 
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {['GitHub', 'LinkedIn', 'WhatsApp'].map((item, i) => {
            const hrefs = ['https://github.com/devj-58', 'https://www.linkedin.com/in/frejus-kouadio-316238329', 'https://wa.me/2250767998373']
            return (
              <a key={item} href={hrefs[i]} target="_blank" rel="noopener"
                style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.12em', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = a}
                onMouseLeave={e => e.currentTarget.style.color = `rgba(${aRgb},0.4)`}
              >{item}</a>
            )
          })}
        </div>

        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: `rgba(${aRgb},0.3)`, letterSpacing: '0.12em' }}>
          © {new Date().getFullYear()} · YAMOUSSOUKRO, CI
        </div>
      </footer>

      {/* Panneau paramètres — même position que dans Experience */}
      <div style={{
        position: 'fixed',
        bottom: isMobile ? 80 : 16,
        right: isMobile ? 8 : 16,
        zIndex: 200,
      }}>
        <PanneauParametres />
      </div>

      {tooltipInfo && (
        <div
          style={{
            position: 'fixed',
            left: tooltipInfo.x,
            top: tooltipInfo.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'fadeInUp 0.15s ease forwards',
          }}
        >
          <div style={{
            background: eff.glassOverlay,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${a}`,
            borderRadius: 10,
            padding: '10px 14px',
            minWidth: 160,
            boxShadow: `${eff.shadow}, 0 8px 32px ${eff.shadow}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Ligne lumineuse */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg,transparent,${a},transparent)`,
            }} />
            {/* Coins HUD */}
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h],i) => (
              <div key={i} style={{
                position:'absolute', [v]:4, [h]:4,
                width:8, height:8,
                [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]:`1px solid ${a}`,
                [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]:`1px solid ${a}`,
              }} />
            ))}

            {/* Date */}
            <div style={{
              fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 6 : 7,
              color: `rgba(${aRgb},0.4)`, letterSpacing: '0.2em',
              marginBottom: 8,
            }}>
              {new Date(tooltipInfo.date).toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric',
                month: 'long', year: 'numeric'
              }).toUpperCase()}
            </div>

            {/* Compte */}
            <div style={{
              fontFamily: 'Fraunces, serif', fontWeight: 800,
              fontSize: isMobile ? 16 : 20, color: a,
              marginBottom: 2,
            }}>
              {tooltipInfo.count}
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontSize: 10,
              color: eff.textFaint,
            }}>
              contribution{tooltipInfo.count > 1 ? 's' : ''}
            </div>

            {/* Barre visuelle */}
            <div style={{
              marginTop: 8, height: 2,
              background: eff.borderLight,
              borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min((tooltipInfo.count / 15) * 100, 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg,rgba(${aRgb},0.5),${a})`,
                borderRadius: 2,
              }} />
            </div>

            {/* Flèche bas */}
            <div style={{
              position: 'absolute', bottom: -6, left: '50%',
              transform: 'translateX(-50%)',
              width: 10, height: 6,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: a,
            }} />
          </div>
        </div>
      )}

    </div>
  )
})

export default Portfolio


