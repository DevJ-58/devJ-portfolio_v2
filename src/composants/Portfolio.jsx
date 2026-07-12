import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserTheme from '@/store/utiliserTheme'
import usePortfolioData from '@/hooks/usePortfolioData'
import PanneauParametres from '@/composants/ui/PanneauParametres'

// Petit composant de secours pour éviter une erreur si `AxisBouton` manque.
function AxisBouton({ isMobile, a, aRgb, navigate, eff }) {
  return (
    <button
      onClick={() => (navigate ? navigate('/contact') : window.location.assign('/contact'))}
      style={{
        padding: isMobile ? '10px 14px' : '12px 18px',
        background: `rgba(${aRgb},0.08)`,
        border: `1px solid rgba(${aRgb},0.18)`,
        color: a,
        fontFamily: 'Space Mono, monospace',
        fontSize: 12,
        borderRadius: 8,
        cursor: 'pointer',
      }}
    >
      Contacter →
    </button>
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
    if (count === 0) return isLight ? 'rgba(0,0,0,0.04)' : eff.cardBg
    if (count <= 2)  return `rgba(${accentRgb},0.2)`
    if (count <= 5)  return `rgba(${accentRgb},0.45)`
    if (count <= 10) return `rgba(${accentRgb},0.7)`
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
      desc: 'Compréhension des besoins, définition des objectifs et cartographie complète du projet.',
      duree: '~1 semaine',
      tags: ['Benchmark', 'Personas', 'Roadmap'],
    },
    {
      n: '02',
      titre: 'Conception & UI',
      desc: 'Design des maquettes, prototypage interactif et création de l\'identité visuelle.',
      duree: '~2 semaines',
      tags: ['Wireframes', 'Design system', 'Prototype'],
    },
    {
      n: '03',
      titre: 'Développement',
      desc: 'Codage propre et optimisé avec architecture scalable et maintenable.',
      duree: '~4 semaines',
      tags: ['Frontend', 'Backend', 'CI/CD'],
    },
    {
      n: '04',
      titre: 'Tests & Validation',
      desc: 'Tests multi-navigateurs, validation performance, accessibilité et SEO.',
      duree: '~1 semaine',
      tags: ['QA', 'Tests E2E', 'Accessibilité'],
    },
    {
      n: '05',
      titre: 'Déploiement',
      desc: 'Mise en ligne sécurisée, formation et documentation complète.',
      duree: 'continu',
      tags: ['Déploiement', 'Monitoring', 'Support'],
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

              <div style={{
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

                <div style={{
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
                </div>
              </div>
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

        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 9,
          letterSpacing: '0.4em',
          color: a,
          marginBottom: isMobile ? 24 : 36,
          textTransform: 'uppercase',
        }}>
          01 // À PROPOS
        </div>

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

        <div style={{
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
        </div>

        <div style={{
          display: 'flex',
          gap: isMobile ? 32 : 60,
          marginTop: isMobile ? 32 : 56,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>

          <div style={{
            maxWidth: 340,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: eff.textMuted,
            lineHeight: 1.8,
            fontWeight: 300,
          }}>
            Fréjus Kouadio — développeur logiciel et UI/UX designer basé à Yamoussoukro. En 2ème année de Licence Génie Logiciel, spécialisation progressive vers l'intelligence artificielle.
          </div>

          <div style={{ display: 'flex', gap: isMobile ? 24 : 44, flexWrap: 'wrap' }}>
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
          </div>
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
            return (
              <path
                key={i}
                d={`M -50 ${380 - offset} C 200 ${280 - offset - amplitude}, 400 ${480 - offset + amplitude}, 650 ${330 - offset} S 1000 ${180 - offset - amplitude}, 1250 ${350 - offset}`}
                fill="none"
                stroke={a}
                strokeWidth="1.3"
                opacity={1 - i * 0.06}
              />
            )
          })}
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>

        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.4em', color: a, marginBottom: 16, textTransform: 'uppercase' }}>
          01.5 // PARCOURS
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 32 : 44, color: eff.texte, marginBottom: isMobile ? 40 : 80, letterSpacing: '-0.02em' }}>
          Trois <span style={{ color: a, fontStyle: 'italic', fontWeight: 500 }}>chapitres</span>
        </div>

        {!isMobile && (
          <div style={{ position: 'relative', height: 280 }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: isLight ? 'rgba(20,20,20,0.15)' : 'rgba(242,240,236,0.15)' }} />
            {parcoursData.map((e, i) => {
              const x = ['6%', '38%', '70%'][i]
              const dirUp = i % 2 === 0
              return (
                <div key={e.chap}>
                  <div style={{ position: 'absolute', left: x, top: '50%', width: e.active ? 11 : 8, height: e.active ? 11 : 8, borderRadius: '50%', transform: 'translate(-50%,-50%)', background: e.active ? a : eff.fond, border: e.active ? 'none' : `1px solid ${isLight ? 'rgba(20,20,20,0.35)' : 'rgba(242,240,236,0.35)'}`, boxShadow: e.active ? `0 0 14px rgba(${aRgb},0.7)` : 'none', zIndex: 2 }} />
                  <div style={{ position: 'absolute', left: x, [dirUp ? 'bottom' : 'top']: 'calc(50% + 22px)', width: 190 }}>
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
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {parcoursData.map((e, i) => (
              <div key={e.chap} style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: i < parcoursData.length - 1 ? `1px solid ${isLight ? 'rgba(20,20,20,0.08)' : 'rgba(242,240,236,0.08)'}` : 'none' }}>
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
              </div>
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
            }}
          >
            <polygon points="60,150 200,70 200,110 100,168 100,210 60,187" fill={isLight ? 'rgba(20,20,20,0.2)' : 'rgba(242,240,236,0.35)'} />
            <polygon points="200,70 260,105 260,145 200,110" fill={isLight ? 'rgba(20,20,20,0.5)' : 'rgba(0,0,0,0.6)'} />
            <polygon points="60,187 100,210 260,300 260,340 100,250 60,227" fill={a} />
            <polygon points="200,110 260,145 260,220 220,242 220,200 200,190" fill={isLight ? 'rgba(20,20,20,0.2)' : 'rgba(242,240,236,0.35)'} />
            <polygon points="260,145 320,180 320,255 260,220" fill={isLight ? 'rgba(20,20,20,0.5)' : 'rgba(0,0,0,0.6)'} />
            <polygon points="220,242 260,265 260,300 220,278" fill={isLight ? 'rgba(20,20,20,0.1)' : 'rgba(242,240,236,0.2)'} />
          </svg>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.4em', color: a, marginBottom: 16, textTransform: 'uppercase' }}>
            02 // COMPÉTENCES
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 28 : 48, color: eff.texte, marginBottom: isMobile ? 40 : 70, letterSpacing: '-0.02em' }}>
            Signal <span style={{ color: a, fontStyle: 'italic', fontWeight: 500 }}>technique</span>
          </div>

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
              const isFilled = gi === 0
              const isActiveHover = categorieSurvolee === gi
              const isHighlighted = isFilled || isActiveHover
              const lineGap = isMobile ? 14 : 20
              const heightScale = isMobile ? 1.0 : 1.4
              const isDimmed = categorieSurvolee !== null && categorieSurvolee !== gi

              return (
                <div
                  key={group.cat}
                  onMouseEnter={() => setCategorieSurvolee(gi)}
                  onMouseLeave={() => setCategorieSurvolee(null)}
                  onClick={() => setCategorieSurvolee(categorieSurvolee === gi ? null : gi)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transform: categorieSurvolee === gi ? 'scale(1.08)' : 'scale(1)',
                    transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    transformOrigin: 'bottom center',
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
              )
            })}
          </div>
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
            <circle cx="850" cy="80" r="70" fill="none" stroke={a} strokeWidth="1.2" />
            <circle cx="950" cy="180" r="95" fill="none" stroke={a} strokeWidth="1.2" />
            <circle cx="1050" cy="90" r="55" fill="none" stroke={a} strokeWidth="1.2" />
            <circle cx="780" cy="220" r="60" fill="none" stroke={a} strokeWidth="1.2" />
            <circle cx="920" cy="330" r="110" fill="none" stroke={a} strokeWidth="1.2" />
            <circle cx="1080" cy="380" r="70" fill="none" stroke={a} strokeWidth="1.2" />
            <circle cx="1000" cy="450" r="45" fill="none" stroke={a} strokeWidth="1.2" />
          </svg>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.4em', color: a, marginBottom: 16, textTransform: 'uppercase' }}>
            03 // PROJETS
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 28 : 44, color: eff.texte, letterSpacing: '-0.02em', marginBottom: isMobile ? 32 : 50 }}>
            Constellation <span style={{ color: a, fontStyle: 'italic', fontWeight: 500 }}>de travaux</span>
          </div>

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
                    <div
                      key={p.num || i}
                      onMouseEnter={() => setProjetSurvoleIdx(i)}
                      onMouseLeave={() => setProjetSurvoleIdx(null)}
                      onClick={() => p.lien && window.open(p.lien, '_blank', 'noopener')}
                      style={{
                        position: 'absolute',
                        left: pos.cx - pos.r,
                        top: pos.cy - pos.r,
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        overflow: 'hidden',
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
                    <a
                      key={p.num || i}
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
                    </a>
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

      {/* GITHUB ACTIVITY */}
      <section id="pf-github" style={sectionStyle}>
        <div style={s.secNum}>03.5 // ACTIVITÉ</div>
        <h2 style={s.secTitle}>
          Activité <span style={s.accent}>GitHub</span>
        </h2>

        {/* Sous-titre + lien */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 32,
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{
            fontFamily: 'Space Mono, monospace', fontSize: 9,
            color: `rgba(${aRgb},0.45)`, letterSpacing: '0.2em',
          }}>
            {githubData
              ? `${githubData.total?.lastYear ?? '—'} CONTRIBUTIONS · DERNIÈRE ANNÉE`
              : 'CHARGEMENT...'}
          </div>
          <a
            href="https://github.com/DevJ-58"
            target="_blank" rel="noopener"
            style={{
              fontFamily: 'Space Mono, monospace', fontSize: 9,
              color: a, letterSpacing: '0.15em',
              textDecoration: 'none',
              border: `1px solid rgba(${aRgb},0.25)`,
              borderRadius: 6, padding: '5px 14px',
              background: `rgba(${aRgb},0.06)`,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = `rgba(${aRgb},0.12)`}
            onMouseLeave={e => e.currentTarget.style.background = `rgba(${aRgb},0.06)`}
          >
            @DevJ-58 →
          </a>
        </div>

        {/* Carte principale glass */}
        <div style={{
          background: eff.cardBg,
          border: `1px solid ${eff.borderStrong}`,
          borderRadius: 20,
          padding: isMobile ? '24px 16px' : '36px 40px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'relative',
          overflow: 'visible',
        }}>

          {/* Ligne lumineuse top */}
          <div style={{
            position: 'absolute', top: 0, left: 40, right: 40, height: 1,
            background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.3),transparent)`,
          }} />

          {githubLoading && (
            <div style={{
              textAlign: 'center', padding: '40px 0',
              fontFamily: 'Space Mono, monospace', fontSize: 9,
              color: `rgba(${aRgb},0.4)`, letterSpacing: '0.2em',
              animation: 'pulse 1.5s infinite',
            }}>
              // CONNEXION AU RÉSEAU GITHUB...
            </div>
          )}

          {githubError && (
            <div style={{
              textAlign: 'center', padding: '40px 0',
              fontFamily: 'Space Mono, monospace', fontSize: 9,
              color: 'rgba(255,100,100,0.5)', letterSpacing: '0.15em',
            }}>
              // ERREUR DE CONNEXION — DONNÉES INDISPONIBLES
            </div>
          )}

          {githubData && (() => {
            // Regrouper les contributions par semaine
            const contributions = githubData.contributions ?? []
            
            // Trouver le premier lundi
            const weeks = []
            let currentWeek = []
            
            contributions.forEach((day, i) => {
              const date = new Date(day.date)
              const dow = date.getDay() // 0=dim
              if (i === 0) {
                // Padding de début si on ne commence pas un dimanche
                for (let p = 0; p < dow; p++) {
                  currentWeek.push(null)
                }
              }
              currentWeek.push(day)
              if (dow === 6 || i === contributions.length - 1) {
                // Padding de fin
                while (currentWeek.length < 7) currentWeek.push(null)
                weeks.push([...currentWeek])
                currentWeek = []
              }
            })

            const CELL = isMobile ? 10 : 13
            const GAP = 3
            const DAY_LABELS = ['', 'L', '', 'M', '', 'V', '']

            // Mois pour les labels
            const monthLabels = []
            weeks.forEach((week, wi) => {
              const first = week.find(d => d !== null)
              if (!first) return
              const d = new Date(first.date)
              if (d.getDate() <= 7) {
                monthLabels.push({
                  wi,
                  label: d.toLocaleDateString('fr-FR', { month: 'short' })
                    .replace('.', '').toUpperCase()
                })
              }
            })

            return (
              <div style={{ position: 'relative' }}>

                {/* UN SEUL div scrollable qui contient labels + grille ensemble */}
                <div style={{
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  paddingBottom: 4,
                }}>
                  <style>{`
                    .github-unified::-webkit-scrollbar { display: none; }
                  `}</style>

                  {/* Conteneur interne à largeur fixe — labels + grille alignés */}
                  <div
                    className="github-unified"
                    style={{
                      display: 'inline-flex',
                      flexDirection: 'column',
                      minWidth: 'max-content',
                    }}
                  >
                    {/* Labels mois — même largeur que la grille */}
                    <div style={{
                      display: 'flex',
                      marginLeft: !isMobile ? 28 : 0,
                      marginBottom: 6,
                      height: 16,
                      position: 'relative',
                    }}>
                      {monthLabels.map(({ wi, label }) => (
                        <div key={`${wi}-${label}`} style={{
                          position: 'absolute',
                          left: wi * (CELL + GAP),
                          fontFamily: 'Space Mono, monospace',
                          fontSize: 8,
                          color: `rgba(${aRgb},0.4)`,
                          letterSpacing: '0.1em',
                          whiteSpace: 'nowrap',
                        }}>{label}</div>
                      ))}
                    </div>

                    {/* Labels jours + grille côte à côte */}
                    <div style={{ display: 'flex', gap: 0 }}>
                      {/* Labels jours — desktop uniquement */}
                      {!isMobile && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: GAP,
                          marginRight: 6,
                        }}>
                          {DAY_LABELS.map((lbl, i) => (
                            <div key={i} style={{
                              height: CELL,
                              fontFamily: 'Space Mono, monospace',
                              fontSize: 7,
                              color: `rgba(${aRgb},0.3)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              width: 14,
                            }}>{lbl}</div>
                          ))}
                        </div>
                      )}

                      {/* Grille des semaines */}
                      <div style={{
                        display: 'flex',
                        gap: GAP,
                      }}>
                        {weeks.map((week, wi) => (
                          <div key={wi} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: GAP,
                          }}>
                            {week.map((day, di) => {
                              if (!day) {
                                return (
                                  <div key={di} style={{
                                    width: CELL, height: CELL,
                                    borderRadius: 3,
                                    background: 'transparent',
                                  }} />
                                )
                              }
                              const color = getContribColor(day.count, a, aRgb)
                              const isActive = day.count > 0
                              return (
                                <div
                                  key={di}
                                  style={{
                                    width: CELL, height: CELL,
                                    borderRadius: 3,
                                    background: color,
                                    border: isActive
                                      ? `1px solid rgba(${aRgb},0.15)`
                                      : `1px solid ${eff.borderLight}`,
                                    cursor: isActive ? 'pointer' : 'default',
                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                    boxShadow: day.count > 8
                                      ? `0 0 6px rgba(${aRgb},0.5)`
                                      : 'none',
                                    position: 'relative',
                                  }}
                                  onMouseEnter={e => {
                                    if (!isActive) return
                                    e.currentTarget.style.transform = 'scale(1.4)'
                                    e.currentTarget.style.boxShadow = `0 0 10px rgba(${aRgb},0.7)`
                                    e.currentTarget.style.zIndex = '50'
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setTooltipInfo({
                                      x: rect.left + rect.width / 2,
                                      y: rect.top - 8,
                                      date: day.date,
                                      count: day.count,
                                    })
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                    e.currentTarget.style.boxShadow = day.count > 8
                                      ? `0 0 6px rgba(${aRgb},0.5)` : 'none'
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

                {/* Légende — en dehors du scroll */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginTop: 16, justifyContent: 'flex-end',
                }}>
                  <span style={{
                    fontFamily: 'Space Mono, monospace', fontSize: 7,
                    color: `rgba(${aRgb},0.3)`, letterSpacing: '0.1em',
                  }}>MOINS</span>
                  {[0, 2, 5, 9, 15].map(v => (
                    <div key={v} style={{
                      width: CELL, height: CELL, borderRadius: 3,
                      background: getContribColor(v, a, aRgb),
                      border: `1px solid rgba(${aRgb},0.1)`,
                    }} />
                  ))}
                  <span style={{
                    fontFamily: 'Space Mono, monospace', fontSize: 7,
                    color: `rgba(${aRgb},0.3)`, letterSpacing: '0.1em',
                  }}>PLUS</span>
                </div>

              </div>
            )
          })()}

          {/* Stats rapides sous la grille */}
          {githubData && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)',
              gap: 12, marginTop: 28,
              paddingTop: 24,
              borderTop: `1px solid rgba(${aRgb},0.08)`,
              overflow: 'hidden',
              maxWidth: '100%'
            }}>
              {[
                ['TOTAL', githubData.total?.lastYear ?? '—', 'contributions'],
                ['STREAK', (() => {
                  const contribs = githubData.contributions ?? []
                  let max = 0, cur = 0
                  contribs.forEach(d => {
                    if (d.count > 0) { cur++; if (cur > max) max = cur }
                    else cur = 0
                  })
                  return max
                })(), 'jours consécutifs'],
                ['ACTIF', (() => {
                  const contribs = githubData.contributions ?? []
                  return contribs.filter(d => d.count > 0).length
                })(), 'jours actifs'],
                ['BEST DAY', (() => {
                  const contribs = githubData.contributions ?? []
                  return Math.max(...contribs.map(d => d.count), 0)
                })(), 'contributions max/jour'],
              ].map(([label, value, sub]) => (
                <div key={label} style={{
                  padding: '14px 16px',
                  background: `rgba(${aRgb},0.03)`,
                  border: `1px solid rgba(${aRgb},0.1)`,
                  borderRadius: 12,
                  position: 'relative', overflow: 'hidden', minWidth: 0, wordBreak: 'break-word',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.2),transparent)`,
                  }} />
                  <div style={{
                    fontFamily: 'Space Mono, monospace', fontSize: 7,
                    color: `rgba(${aRgb},0.4)`, letterSpacing: '0.2em',
                    marginBottom: 8,
                  }}>{label}</div>
                        <div style={{
                          fontFamily: 'Fraunces, serif', fontWeight: 800,
                          fontSize: isMobile ? 18 : 24, color: a, marginBottom: 4, wordBreak: 'break-word',
                        }}>{value}</div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 10,
                    color: eff.textFaint,
                  }}>{sub}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SERVICES */}
      <section id="pf-services" style={sectionStyle}>
        <div style={s.secNum}>04 // SERVICES</div>
        <h2 style={s.secTitle}>Mes <span style={s.accent}>Services</span></h2>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 16,
          alignItems: 'stretch',
        }}>
          {(() => {
            const sv = services[serviceActif]
            const isPopular = !!sv.badge
            const prixParts = sv.prix.split(' ')
            const hasCurrency = prixParts[prixParts.length - 1] === 'FCFA'
            const priceMain = hasCurrency ? prixParts.slice(0, -1).join(' ') : sv.prix
            const currency = hasCurrency ? 'FCFA' : ''
            const half = Math.ceil(sv.features.length / 2)
            const col1 = sv.features.slice(0, half)
            const col2 = sv.features.slice(half)

            return (
              <div key={serviceActif} style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 16,
                border: `1px solid ${isPopular ? `rgba(${aRgb},0.3)` : eff.borderStrong}`,
                background: isPopular ? `rgba(${aRgb},0.04)` : eff.cardBg,
                WebkitBackdropFilter: 'blur(16px)',
                backdropFilter: 'blur(16px)',
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                animation: 'fadeInUp 0.4s ease',
                padding: isMobile ? '28px 24px' : '44px 48px',
              }}>
                {/* Prix en filigrane */}
                <span style={{
                  position: 'absolute',
                  right: isMobile ? -14 : -30,
                  bottom: isMobile ? -30 : -60,
                  fontFamily: 'Space Mono, monospace',
                  fontWeight: 700,
                  fontSize: isMobile ? 90 : 170,
                  color: a,
                  opacity: 0.07,
                  lineHeight: 1,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}>
                  {priceMain.replace(/\s/g, '')}
                </span>

                <div style={{ position: 'relative' }}>
                  {sv.badge && (
                    <div style={{
                      display: 'inline-block',
                      background: a, color: '#050505',
                      fontFamily: 'Space Mono, monospace', fontSize: 8, fontWeight: 700,
                      letterSpacing: '0.1em', padding: '4px 10px', borderRadius: 4,
                      marginBottom: 16,
                    }}>{sv.badge}</div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      fontFamily: 'Fraunces, serif', fontWeight: 800,
                      fontSize: isMobile ? 32 : 48, color: a, lineHeight: 1,
                    }}>{priceMain}</span>
                    {currency && (
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: `rgba(${aRgb},0.6)` }}>
                        {currency}
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontFamily: 'Fraunces, serif', fontWeight: 600,
                    fontSize: isMobile ? 16 : 19, color: eff.texte, marginBottom: 6,
                  }}>{sv.titre}</div>

                  <div style={{
                    fontFamily: 'Space Mono, monospace', fontSize: 9,
                    color: `rgba(${aRgb},0.45)`, letterSpacing: '0.1em',
                    marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ color: a }}>●</span><span>Délai : {sv.delai}</span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '10px 24px',
                    marginBottom: 28,
                    maxWidth: isMobile ? '100%' : 480,
                  }}>
                    {[col1, col2].map((col, ci) => (
                      <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {col.map(f => (
                          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 16, height: 16, flexShrink: 0,
                              background: `rgba(${aRgb},0.1)`, border: `1px solid rgba(${aRgb},0.25)`,
                              borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, color: a,
                            }}>✓</div>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12, color: eff.textMuted }}>{f}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <a href="mailto:devfred58@gmail.com" style={{
                    display: 'inline-block',
                    background: `rgba(${aRgb},0.1)`, border: `1px solid rgba(${aRgb},0.3)`,
                    color: a, fontFamily: 'Space Mono, monospace', fontSize: 10,
                    letterSpacing: '0.18em', padding: '12px 24px', borderRadius: 8,
                    textDecoration: 'none', width: isMobile ? '100%' : 'fit-content', textAlign: 'center',
                  }}>COMMANDER</a>
                </div>
              </div>
            )
          })()}

          {/* BLOCS D'INVITATION */}
          <div style={{
            display: isMobile ? 'grid' : 'flex',
            gridTemplateColumns: isMobile ? '1fr 1fr' : undefined,
            flexDirection: isMobile ? undefined : 'column',
            gap: 12,
            width: isMobile ? '100%' : 220,
            flexShrink: 0,
          }}>
            {services.map((sv, i) => {
              if (i === serviceActif) return null
              const prixParts = sv.prix.split(' ')
              const hasCurrency = prixParts[prixParts.length - 1] === 'FCFA'
              const displayPrix = hasCurrency ? `dès ${sv.prix}` : sv.prix
              return (
                <div
                  key={sv.titre}
                  role="button"
                  tabIndex={0}
                  aria-label={`Voir l'offre ${sv.titre}`}
                  onClick={() => setServiceActif(i)}
                  onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') setServiceActif(i) }}
                  style={{
                    position: 'relative',
                    borderRadius: 14,
                    border: `1px solid ${eff.borderMedium}`,
                    background: `rgba(${aRgb},0.02)`,
                    padding: isMobile ? 16 : 20,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: isMobile ? undefined : 1,
                    minHeight: isMobile ? 90 : 100,
                    transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `rgba(${aRgb},0.35)`
                    e.currentTarget.style.background = `rgba(${aRgb},0.06)`
                    if (!isMobile) e.currentTarget.style.transform = 'translateX(-3px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = eff.borderMedium
                    e.currentTarget.style.background = `rgba(${aRgb},0.02)`
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `rgba(${aRgb},0.1)`, border: `1px solid rgba(${aRgb},0.25)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 11, color: a,
                    }}>{String(i + 1).padStart(2, '0')}</div>
                    <span style={{ color: `rgba(${aRgb},0.4)`, fontSize: 13 }}>↗</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 12, color: eff.texte, marginBottom: 3 }}>
                      {sv.titre}
                    </div>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: `rgba(${aRgb},0.5)` }}>
                      {displayPrix}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
          <h2 style={s.secTitle}>Ma <span style={s.accent}>Méthode</span> de Travail</h2>

          <div style={{
            background: eff.cardBg,
            border: `1px solid ${eff.borderStrong}`,
            borderRadius: 16,
            overflow: 'hidden',
            width: '100%',
            padding: isMobile ? '20px' : '48px',
            position: 'relative',
          }}>
          <div style={{
            position: 'absolute', top: 0, left: 40, right: 40, height: 1,
            background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.3),transparent)`,
          }} />

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 6,
            height: isMobile ? 'auto' : 420,
          }}>
            {etapes.map((e, i) => {
              const isActive = i === etapeActive
              return (
                <div
                  key={e.n || i}
                  role="button"
                  tabIndex={0}
                  aria-label={e.titre}
                  onClick={() => setEtapeActive(i)}
                  onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') setEtapeActive(i) }}
                  style={{
                    position: 'relative',
                    flex: isMobile ? 'none' : (isActive ? 9 : 1),
                    minWidth: 0,
                    height: isMobile ? (isActive ? 320 : 56) : '100%',
                    cursor: 'pointer',
                    borderRadius: 14,
                    border: `1px solid ${isActive ? eff.borderStrong : eff.borderMedium}`,
                    borderLeft: isActive ? `2px solid ${a}` : `1px solid ${eff.borderMedium}`,
                    background: isActive ? eff.cardBg : `rgba(${aRgb},0.02)`,
                    overflow: 'hidden',
                    transition: isMobile
                      ? 'height 0.45s cubic-bezier(0.22,1,0.36,1), background 0.3s'
                      : 'flex 0.45s cubic-bezier(0.22,1,0.36,1), background 0.3s',
                    display: 'flex',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    fontFamily: 'Fraunces, serif',
                    fontWeight: 800,
                    color: a,
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    ...(isActive
                      ? { fontSize: isMobile ? 140 : 340, right: isMobile ? -20 : -40, bottom: isMobile ? -40 : -90, opacity: 0.09 }
                      : isMobile
                        ? { fontSize: 20, left: 18, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }
                        : { fontSize: 26, top: 14, left: '50%', transform: 'translateX(-50%)', opacity: 0.4 }
                    ),
                  }}>
                    {e.n || String(i + 1).padStart(2, '0')}
                  </span>

                  {isActive ? (
                    <div style={{
                      position: 'relative',
                      padding: isMobile ? '26px 24px' : '36px 40px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 520,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: a }}>
                          {e.n || String(i + 1).padStart(2, '0')}
                        </span>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: eff.textFaint }} />
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: eff.textFaint }}>
                          {e.duree}
                        </span>
                      </div>

                      <span style={{
                        fontFamily: 'Fraunces, serif', fontWeight: 700,
                        fontSize: isMobile ? 24 : 34, color: eff.textPrimary,
                        marginBottom: 14, lineHeight: 1.15,
                      }}>
                        {e.titre}
                      </span>

                      <span style={{
                        fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14,
                        color: eff.textMuted, lineHeight: 1.7, marginBottom: 18,
                      }}>
                        {e.desc}
                      </span>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(e.tags || []).map((t, ti) => (
                          <span key={ti} style={{
                            fontFamily: 'Space Mono, monospace', fontSize: 11, color: a,
                            border: `1px solid rgba(${aRgb},0.35)`, borderRadius: 8, padding: '4px 10px',
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : isMobile ? (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 18px 0 52px' }}>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: eff.textMuted, letterSpacing: '0.05em' }}>
                        {e.titre}
                      </span>
                    </div>
                  ) : (
                    <span style={{
                      position: 'absolute',
                      bottom: 24,
                      left: '50%',
                      transform: 'translateX(-50%) rotate(180deg)',
                      writingMode: 'vertical-rl',
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 13,
                      letterSpacing: '0.05em',
                      color: eff.textMuted,
                      whiteSpace: 'nowrap',
                    }}>
                      {e.titre}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      </section>
      <section id="pf-contact" style={sectionStyle}>
        <div style={s.secNum}>06 // CONTACT</div>
        <h2 style={s.secTitle}>Travaillons <span style={s.accent}>Ensemble</span></h2>

        {accesDirecte && (
          <AxisBouton
            isMobile={isMobile}
            a={a}
            aRgb={aRgb}
            navigate={navigate}
            eff={eff}
          />
        )}

        {/* Phrase d'accroche */}
        <div style={{
          maxWidth: 600, marginBottom: 48,
          padding: '24px 32px',
          background: `rgba(${aRgb},0.04)`,
          border: `1px solid rgba(${aRgb},0.12)`,
          borderLeft: `3px solid ${a}`,
          borderRadius: 12,
        }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: eff.textMedium, lineHeight: 1.8, margin: 0 }}>
            Vous avez un projet web, une idée à concrétiser ou vous cherchez un développeur  passionné par l'IA ? Je suis disponible pour des missions freelance, des collaborations et des opportunités à temps plein.
          </p>
        </div>

        {/* Disponibilité */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 40,
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
        </div>

        {/* Liens de contact */}
        <div style={contactGridStyle}>
          {[
            { label: 'Email', val: 'devfred58@gmail.com', href: 'mailto:devfred58@gmail.com', desc: 'Réponse sous 24h' },
            { label: 'Téléphone', val: '+225 0767998373', href: 'tel:+2250767998373', desc: 'Lun–Sam, 8h–18h' },
            { label: 'WhatsApp', val: 'Envoyer un message', href: 'https://wa.me/2250767998373', desc: 'Chat rapide' },
            { label: 'LinkedIn', val: 'Voir le profil', href: 'https://www.linkedin.com/in/frejus-kouadio-316238329', desc: 'Réseau professionnel' },
          ].map(({ label, val, href, desc }) => (
            <a key={label} href={href} target="_blank" rel="noopener"
              className="pf-card"
              style={{ ...s.card, padding: isMobile ? '12px 12px' : s.card.padding, textDecoration: 'none', display: 'block', transition: 'border-color 0.2s, transform 0.2s', marginBottom: isMobile ? 0 : 20 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${aRgb},0.35)`; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = eff.borderStrong; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 8, color: `rgba(${aRgb},0.5)`, letterSpacing: '0.2em', fontFamily: 'Space Mono, monospace' }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 8, color: `rgba(${aRgb},0.35)`, fontFamily: 'Space Mono, monospace' }}>{desc}</div>
              </div>
              <div style={{ fontSize: isMobile ? 11 : 13, color: a, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{val}</div>
            </a>
          ))}
        </div>

        {/* CTA principal */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <a href="mailto:devfred58@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: isMobile ? 'center' : undefined, gap: 12,
              background: a, color: '#050505',
              padding: isMobile ? '14px 18px' : '16px 40px',
              fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 11 : 11,
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


