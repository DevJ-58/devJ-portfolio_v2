import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserTheme from '@/store/utiliserTheme'
import PanneauParametres from '@/composants/ui/PanneauParametres'

const Portfolio = forwardRef(function Portfolio({ onClose, accesDirecte = false }, ref) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [servicesOuverts, setServicesOuverts] = useState({}) // Initialize servicesOuverts
  const [githubData, setGithubData] = useState(null)
  const [githubLoading, setGithubLoading] = useState(true)
  const [githubError, setGithubError] = useState(null)
  const [tooltipInfo, setTooltipInfo] = useState(null)
  const [citationIdx, setCitationIdx] = useState(0)
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
    "L'IA n'est pas un outil — c'est un nouveau langage que je parle."
    ] // List of citations for display

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

  const projets = [
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

  const competences = [
    { cat: 'Frontend', items: [['HTML5',95],['CSS3',90],['JavaScript',85],['React',80],['TypeScript',75],['Bootstrap',90],['GSAP',75]] },
    { cat: 'Backend', items: [['PHP',85],['Laravel',80]] },
    { cat: 'IA & ML', items: [['Python',70],['TensorFlow',65],['NLP',60]] },
    { cat: 'Outils', items: [['Git & GitHub',90],['Figma',85],['Canva',88],['Docker',60]] },
  ]

  const services = [
    { titre: 'Site Vitrine', prix: '300 000 FCFA', delai: '1 à 2 semaines',
      features: ['Design moderne responsive','Jusqu\'à 5 pages','Formulaire de contact','SEO de base','Hébergement 1 an','Support 24/7'] },
    { titre: 'Site E-commerce', prix: '500 000 FCFA', delai: '3 à 4 semaines', badge: 'Populaire',
      features: ['Boutique en ligne complète','Gestion produits illimitée','Paiement sécurisé','Dashboard admin','Formation incluse','Support prioritaire'] },
    { titre: 'Sur Mesure', prix: 'Sur Devis', delai: 'À définir',
      features: ['Solution 100% personnalisée','Fonctionnalités avancées','Intégrations sur mesure','Support prioritaire','Évolutivité garantie','Maintenance incluse'] },
  ]

  const etapes = [
    { n:'01', titre:'Analyse & Audit', desc:'Compréhension des besoins, définition des objectifs et cartographie complète du projet.' },
    { n:'02', titre:'Conception & UI', desc:'Design des maquettes, prototypage interactif et création de l\'identité visuelle.' },
    { n:'03', titre:'Développement', desc:'Codage propre et optimisé avec architecture scalable et maintenable.' },
    { n:'04', titre:'Tests & Validation', desc:'Tests multi-navigateurs, validation performance, accessibilité et SEO.' },
    { n:'05', titre:'Déploiement', desc:'Mise en ligne sécurisée, formation et documentation complète.' },
  ]

  const s = {
    wrap: { fontFamily: 'Inter, sans-serif', background: eff.fond, color: eff.texte, overflowY: 'auto', overflowX: 'hidden', maxWidth: '100vw', height: '100%', scrollBehavior: 'smooth' },
    nav: { position: 'sticky', top: 0, zIndex: 100, background: eff.navOverlay, WebkitBackdropFilter: 'blur(24px)', backdropFilter: 'blur(24px)', borderBottom: `1px solid ${eff.borderLight}`, padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
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
  const servicesGridStyle = { display: 'flex', flexDirection: 'column', gap: 12 }
  const contactGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 8 : 12 }
  const navLinksStyle = { display: isMobile ? 'none' : 'flex', gap: 16, fontSize: 9, color: eff.textFaint, letterSpacing: '0.2em', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }
  const navSpanColor = isLight ? '#64748b' : eff.textFaint

  function AxisBouton({ isMobile, a, aRgb, navigate }) {
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

        {/* Tooltip au survol */}
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
            {/* Ligne lumineuse top */}
            <div style={{
              position: 'absolute', top: 0, left: 12, right: 12, height: 1,
              background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.4),transparent)`,
            }} />

            {/* Flèche bas */}
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

        {/* Bouton principal */}
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
          {/* Cercle HUD */}
          <div style={{
            position: 'relative',
            width: isMobile ? 44 : 52,
            height: isMobile ? 44 : 52,
            flexShrink: 0,
          }}>
            {/* Anneaux pulsants */}
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

            {/* Cercle principal */}
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
              {/* Scan interne */}
              <div style={{
                position: 'absolute',
                left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.6),transparent)`,
                animation: 'axisScan 2s linear infinite',
                zIndex: 2, pointerEvents: 'none',
              }} />

              {/* Hexagone SVG */}
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

            {/* Point statut */}
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

          {/* Label — masqué sur mobile */}
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
        #pf-wrap #pf-academic .timeline-scroll::-webkit-scrollbar { display: none; }
        #pf-github .github-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* NAV */}
      <nav style={navStyle}>
        <div style={s.logo}>&lt;<span style={{ color: a }}>/DevJ</span>&gt;</div>
        <div style={navLinksStyle}>
          {['about','academic','skills','projects','github','services','methodology','contact'].map(id => (
            <span key={id} style={{ cursor:'pointer' }}
              onClick={() => document.getElementById(`pf-${id}`)?.scrollIntoView({ behavior:'smooth' })}>
              {id.toUpperCase()}
            </span>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section id="pf-hero" style={{ ...sectionStyle, overflowX: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 32 }}>
          <div>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'5px 14px',
              border:`1px solid rgba(${aRgb},0.25)`,
              borderRadius:20,
              fontFamily:'Space Mono, monospace', fontSize:8,
              color:`rgba(${aRgb},0.8)`, letterSpacing:'0.2em',
              width:'fit-content',
            }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:a, animation:'pulse 1.5s infinite' }}/>
              DÉVELOPPEUR FRONTEND & IA
            </div>

            <div style={{
              fontFamily:'Fraunces, serif',
              fontSize: isMobile ? 32 : 56,
              fontWeight:800, lineHeight:1,
              letterSpacing:'-0.03em',
              marginTop: 12,
            }}>
              Fréjus<br/>
              <span style={{ color:a }}>Kouadio</span>
            </div>

            <p style={{ color:eff.textMuted, fontSize:13, lineHeight:1.8, maxWidth:isMobile ? '100%' : 520, margin:0, marginTop:12 }}>
              Passionné par la création d'expériences web exceptionnelles et l'intelligence artificielle. De Yamoussoukro à l'international.
            </p>

            <div style={{
              position:'relative',
              height:56,
              overflow:'hidden',
              borderLeft:`2px solid rgba(${aRgb},0.3)`,
              paddingLeft:14,
              marginTop: 16,
            }}>
              {citations.map((c, i) => (
                <div
                  key={i}
                  style={{
                    position:'absolute',
                    top:0, left:14, right:0,
                    fontFamily:'Fraunces, serif',
                    fontSize:13,
                    color: eff.textMuted,
                    lineHeight:1.6,
                    fontStyle:'italic',
                    transition:'opacity 0.6s ease, transform 0.6s ease',
                    opacity: i === citationIdx ? 1 : 0,
                    transform: i === citationIdx
                      ? 'translateY(0)'
                      : i < citationIdx ? 'translateY(-12px)' : 'translateY(12px)',
                    pointerEvents:'none',
                  }}
                >
                  "{c}"
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:5, alignItems:'center', marginTop:10 }}>
              {citations.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCitationIdx(i)}
                  style={{
                    height:2,
                    width: i === citationIdx ? 28 : 8,
                    borderRadius:2,
                    background: i === citationIdx
                      ? a
                      : eff.borderStrong,
                    transition:'width 0.4s ease, background 0.4s ease',
                    cursor:'pointer',
                  }}
                />
              ))}
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:12 }}>
              {['REACT','NODE.JS','PYTHON','IA & ML','FIGMA'].map(t => (
                <span key={t} style={{
                  padding:'4px 12px',
                  border:`1px solid ${eff.borderStrong}`,
                  borderRadius:4,
                  fontFamily:'Space Mono, monospace', fontSize:8,
                  color: eff.textFaint, letterSpacing:'0.1em',
                }}>{t}</span>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap:12, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : undefined, marginTop:16 }}>
              <a href="mailto:devfred58@gmail.com" style={{
                display:'inline-flex', alignItems:'center', justifyContent: 'center',
                gap:8, background:`rgba(${aRgb},0.1)`,
                border:`1px solid rgba(${aRgb},0.35)`,
                color:a, borderRadius:8, padding:'10px 24px',
                fontFamily:'Space Mono, monospace', fontSize:9,
                letterSpacing:'0.2em', textDecoration:'none', fontWeight:700,
                width: isMobile ? '100%' : 'auto'
              }}>
                ME CONTACTER
              </a>
                <a href="https://wa.me/2250767998373" target="_blank" rel="noopener" style={{
                display:'inline-flex', alignItems:'center', justifyContent: 'center',
                gap:8, background: isLight ? 'rgba(0,0,0,0.08)' : eff.cardBg,
                border:`1px solid ${eff.borderStrong}`,
                color: eff.textFaint, borderRadius:8,
                padding:'10px 24px', fontFamily:'Space Mono, monospace', fontSize:9,
                letterSpacing:'0.2em', textDecoration:'none',
                width: isMobile ? '100%' : 'auto'
              }}>
                WHATSAPP
              </a>
            </div>
          </div>

          <div style={{ position:'relative' }}>
            <div style={{
              position:'absolute',
              top:0, right:0, bottom:0,
              width: isMobile ? '100%' : '100%',
              overflow:'hidden',
              zIndex:0,
            }}>
              <img
                src="/asset/2026010323251463.png"
                alt="Fréjus Kouadio"
                style={{
                  position:'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  objectFit:'cover',
                  objectPosition:'top center',
                  display: isMobile ? 'none' : 'block',
                  filter: isLight
                    ? `drop-shadow(0 0 40px rgba(${aRgb},0.12)) contrast(1.05) brightness(0.97)`
                    : `drop-shadow(0 0 60px rgba(${aRgb},0.06))`,
                  maskImage: isLight
                    ? 'linear-gradient(to left, rgba(0,0,0,0.92) 50%, transparent 100%)'
                    : 'linear-gradient(to left, rgba(0,0,0,0.85) 40%, transparent 100%)',
                  WebkitMaskImage: isLight
                    ? 'linear-gradient(to left, rgba(0,0,0,0.92) 50%, transparent 100%)'
                    : 'linear-gradient(to left, rgba(0,0,0,0.85) 40%, transparent 100%)',
                }}
              />
              <div style={{
                position:'absolute', inset:0,
                background: isLight
                  ? `linear-gradient(to right, ${eff.fond} 0%, ${eff.fond}55 30%, transparent 80%)`
                  : `linear-gradient(to right, ${eff.fond} 0%, ${eff.fond}33 50%, transparent 100%)`,
                zIndex:1,
              }}/>
              <div style={{
                position:'absolute', inset:0,
                background: isLight
                  ? `linear-gradient(to top, ${eff.fond} 0%, transparent 25%)`
                  : `linear-gradient(to top, ${eff.fond} 0%, transparent 40%)`,
                zIndex:1,
              }}/>
            </div>

            <div style={{
              position:'relative', zIndex:2,
              marginTop:'auto',
              borderTop:`1px solid ${eff.borderLight}`,
              display:'flex', gap:0,
              minHeight: isMobile ? 'auto' : '85vh',
              alignItems:'flex-end',
            }}>
              {[['6','PROJETS'],['2+','ANNÉES'],['100%','SATISFACTION']].map(([v,l], i) => (
                <div key={l} style={{
                  flex:1, padding: isMobile ? '12px 10px' : '16px 20px',
                  borderRight: i < 2 ? `1px solid ${eff.borderLight}` : 'none',
                  display:'flex', flexDirection:'column', gap:4,
                }}>
                  <div style={{
                    fontFamily:'Fraunces, serif',
                    fontSize: isMobile ? 16 : 22, fontWeight:800, color:a
                  }}>{v}</div>
                  <div style={{
                    fontFamily:'Space Mono, monospace',
                    fontSize: isMobile ? 6 : 7, color: eff.textFaint,
                    letterSpacing:'0.2em'
                  }}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,rgba(${aRgb},0.2),transparent)` }} />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="pf-about" style={sectionStyle}>
        <div style={s.secNum}>01 // À PROPOS</div>
        <h2 style={s.secTitle}>À Propos de <span style={s.accent}>Moi</span></h2>
        <div style={{
          display:'grid',
          gridTemplateColumns: isMobile ? '1fr' : '260px 1fr',
          gap: isMobile ? 24 : 48,
          alignItems:'start',
        }}>

          <div style={isMobile ? {
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            gap:16,
            width:'100%',
            borderRadius:16,
            overflow:'hidden',
          } : {
            position:'relative',
            borderRadius:16,
            overflow:'hidden',
          }}>
            <img src="/asset/2026010323253284.png" alt="DevJ"
              style={{
                width:'100%',
                height: isMobile ? 'auto' : 340,
                maxHeight: isMobile ? 280 : undefined,
                objectFit:'cover', objectPosition:'top center',
                display:'block', borderRadius:16,
                filter:`drop-shadow(0 0 30px rgba(${aRgb},0.08))`,
              }}
            />
            <div style={{
              position: isMobile ? 'static' : 'absolute',
              bottom: isMobile ? undefined : 12,
              left: isMobile ? undefined : 12,
              right: isMobile ? undefined : 12,
              background: eff.glassOverlay,
              border:`1px solid rgba(${aRgb},0.2)`,
              borderRadius:10, padding:'10px 12px',
              backdropFilter: isMobile ? 'none' : 'blur(10px)',
              WebkitBackdropFilter: isMobile ? 'none' : 'blur(10px)',
              textAlign: isMobile ? 'center' : undefined,
              marginTop: isMobile ? 8 : undefined,
            }}>
              <div style={{
                fontFamily:'Fraunces, serif',
                fontSize:13, fontWeight:700,
                color: eff.texte, marginBottom:2,
              }}>
                Fréjus Kouadio
              </div>
              <div style={{
                fontFamily:'Space Mono, monospace',
                fontSize:8, color:`rgba(${aRgb},0.7)`,
                letterSpacing:'0.15em',
              }}>
                DEV FULLSTACK · IA
              </div>
            </div>
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h], i) => (
              <div key={i} style={{
                position:'absolute', [v]:-1, [h]:-1,
                width:16, height:16,
                [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]:`2px solid ${a}`,
                [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]:`2px solid ${a}`,
              }}/>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            <div style={{ color: eff.textMuted, lineHeight:1.9, fontSize:13 }}>
              Développeur Frontend passionné, spécialisé en <strong style={{ color: eff.textHigh, fontWeight:500 }}>React</strong> et <strong style={{ color: eff.textHigh, fontWeight:500 }}>intelligence artificielle</strong>. Conception d'interfaces performantes, accessibles et esthétiques, avec un souci du détail et de la performance.
            </div>

            <div style={{
              padding:'16px 20px',
              borderLeft:`2px solid rgba(${aRgb},0.4)`,
              background:`rgba(${aRgb},0.04)`,
              borderRadius:'0 8px 8px 0',
              fontSize:13,
              color: eff.textMuted,
              lineHeight:1.8,
              fontStyle:'italic',
            }}>
              Actuellement en formation d'ingénieur en intelligence artificielle, basé à Yamoussoukro, Côte d'Ivoire. Disponible pour des projets locaux et internationaux.
            </div>

            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2,1fr)', gap:12 }}>
              {[['Email','devfred58@gmail.com'],['Téléphone','+225 0767998373'],['Localisation','Yamoussoukro, CI'],['Disponibilité','Ouverts aux projets']].map(([k,v]) => (
                <div key={k} style={{
                  background: eff.cardBg,
                  border: `1px solid ${eff.borderMedium}`,
                  borderRadius:10,
                  padding:'12px 14px',
                  position:'relative',
                  overflow:'hidden',
                }}>
                  <div style={{
                    position:'absolute', top:0, left:0, right:0, height:1,
                    background:`linear-gradient(90deg,transparent,rgba(${aRgb},0.15),transparent)`,
                  }}/>
                  <div style={{ position:'relative' }}>
                    <div style={{
                      fontSize:7,
                      color:`rgba(${aRgb},0.45)`,
                      letterSpacing:'0.22em',
                      fontFamily:'Space Mono, monospace',
                      marginBottom:6,
                    }}>{k.toUpperCase()}</div>
                    <div style={{ fontSize:12, color: eff.textHigh, fontFamily:'Inter, sans-serif' }}>{v}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'8px 16px',
              background:`rgba(${aRgb},0.06)`,
              border:`1px solid rgba(${aRgb},0.18)`,
              borderRadius:20,
            }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:a, animation:'pulse 1.4s infinite' }}/>
              <span style={{
                fontFamily:'Space Mono, monospace',
                fontSize:8, color:`rgba(${aRgb},0.8)`,
                letterSpacing:'0.15em',
              }}>
                DISPONIBLE POUR DE NOUVEAUX PROJETS
              </span>
            </div>
            <a
              href="/asset/cv_frejus.pdf"
              download="cv_frejus.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 16,
                padding: isMobile ? '12px 20px' : '12px 28px',
                background: `rgba(${aRgb},0.08)`,
                border: `1px solid rgba(${aRgb},0.3)`,
                borderRadius: 10,
                fontFamily: 'Space Mono, monospace',
                fontSize: isMobile ? 9 : 10,
                letterSpacing: '0.18em',
                color: a,
                textDecoration: 'none',
                fontWeight: 700,
                width: isMobile ? '100%' : 'fit-content',
                justifyContent: isMobile ? 'center' : 'flex-start',
                transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
                boxShadow: `0 0 20px rgba(${aRgb},0.1)`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `rgba(${aRgb},0.15)`
                e.currentTarget.style.borderColor = a
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `rgba(${aRgb},0.08)`
                e.currentTarget.style.borderColor = `rgba(${aRgb},0.3)`
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              TÉLÉCHARGER MON CV
            </a>
          </div>
        </div>
      </section>

      {/* PARCOURS ACADÉMIQUE */}
      <section id="pf-academic" style={sectionStyle}>
        <div style={s.secNum}>01.5 // PARCOURS</div>
        <h2 style={s.secTitle}>Parcours <span style={s.accent}>Académique</span></h2>

        {/* Conteneur de la timeline */}
        <div className="timeline-scroll" style={{ position: 'relative', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 32, maxWidth: '100%' }}>

          <div style={{ minWidth: 600 }}>
          {/* Ligne sinusoïdale SVG */}
          <svg
            viewBox="0 0 900 160"
            preserveAspectRatio="none"
            style={{
              width: '100%',
              minWidth: 600,
              height: 160,
              display: 'block',
              overflow: 'visible',
            }}
          >
            {/* Dégradé pour la courbe */}
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={a} stopOpacity="0.1" />
                <stop offset="40%" stopColor={a} stopOpacity="0.6" />
                <stop offset="70%" stopColor={a} stopOpacity="0.9" />
                <stop offset="100%" stopColor={a} stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Courbe sinusoïdale */}
            <path
              d="M 0 80 C 100 80, 150 40, 225 80 S 375 120, 450 80 S 600 40, 675 80 S 825 120, 900 80"
              fill="none"
              stroke={`url(#waveGrad)`}
              strokeWidth="2"
              filter="url(#glow)"
            />

            {/* Points sur la courbe avec cercles */}
            {[
              { x: 225, y: 80, label: 'BEPC', annee: '2020 – 2021', desc: 'Brevet d\'Études du\nPremier Cycle', done: true },
              { x: 450, y: 80, label: 'BAC', annee: '2023 – 2024', desc: 'Baccalauréat\nSérie D', done: true },
              { x: 675, y: 80, label: 'LICENCE 2', annee: '2024 – 2025', desc: 'Génie Logiciel\nCycle Supérieur', done: false },
            ].map((item, i) => (
              <g key={i}>
                {/* Halo extérieur */}
                <circle
                  cx={item.x} cy={item.y} r={item.done ? 22 : 26}
                  fill="none"
                  stroke={a}
                  strokeWidth="1"
                  strokeOpacity={item.done ? 0.2 : 0.5}
                />
                {/* Cercle principal */}
                <circle
                  cx={item.x} cy={item.y} r={item.done ? 14 : 18}
                  fill={item.done ? `rgba(${aRgb},0.15)` : `rgba(${aRgb},0.25)`}
                  stroke={a}
                  strokeWidth={item.done ? 1.5 : 2}
                  filter={item.done ? undefined : 'url(#glow)'}
                />
                {/* Point central */}
                <circle
                  cx={item.x} cy={item.y} r={item.done ? 4 : 6}
                  fill={a}
                  filter="url(#glow)"
                />
                {/* Ligne verticale vers le label */}
                <line
                  x1={item.x} y1={i % 2 === 0 ? item.y - 22 : item.y + 22}
                  x2={item.x} y2={i % 2 === 0 ? item.y - 48 : item.y + 48}
                  stroke={a}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  strokeDasharray="3,3"
                />
              </g>
            ))}
          </svg>

          {/* Labels texte positionnés sous/sur la courbe */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: -160,
            minWidth: 600,
            position: 'relative',
            pointerEvents: 'none',
          }}>
            {[
              { label: 'BEPC', annee: '2020 – 2021', desc: "Brevet d'Études\ndu Premier Cycle", done: true, top: false },
              { label: 'BAC', annee: '2023 – 2024', desc: 'Baccalauréat\nSérie D', done: true, top: true },
              { label: 'LICENCE 2', annee: '2024 – En cours', desc: 'Génie Logiciel\nCycle Supérieur', done: false, top: false },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '33%',
                marginTop: item.top ? 0 : 100,
              }}>
                {/* Badge label */}
                <div style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 10,
                  fontWeight: 700,
                  color: item.done ? a : eff.texte,
                  letterSpacing: '0.2em',
                  background: item.done
                    ? `rgba(${aRgb},0.1)`
                    : `rgba(${aRgb},0.2)`,
                  border: `1px solid ${item.done ? `rgba(${aRgb},0.3)` : a}`,
                  padding: '4px 14px',
                  borderRadius: 4,
                  marginBottom: 6,
                  boxShadow: item.done ? 'none' : `0 0 12px rgba(${aRgb},0.3)`,
                }}>
                  {item.label}
                </div>

                {/* Année */}
                <div style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 9,
                  color: a,
                  letterSpacing: '0.15em',
                  marginBottom: 4,
                  opacity: 0.7,
                }}>
                  {item.annee}
                </div>

                {/* Description */}
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  color: eff.textMuted,
                  textAlign: 'center',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                }}>
                  {item.desc}
                </div>

                {/* Badge "EN COURS" pour le dernier */}
                {!item.done && (
                  <div style={{
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: `rgba(${aRgb},0.08)`,
                    border: `1px solid rgba(${aRgb},0.25)`,
                    borderRadius: 20,
                    padding: '3px 10px',
                  }}>
                    <div style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: a,
                      animation: 'pulse 1.4s infinite',
                    }} />
                    <span style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 8,
                      color: a,
                      letterSpacing: '0.15em',
                    }}>EN COURS</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      </section>

      {/* SKILLS */}
      <section id="pf-skills" style={sectionStyle}>
        <div style={s.secNum}>02 // COMPÉTENCES</div>
        <h2 style={s.secTitle}>Compétences <span style={s.accent}>Techniques</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16 }}>
          {competences.map(cat => (
            <div key={cat.cat} style={{ background: eff.cardBg, border: `1px solid ${eff.borderMedium}`, borderRadius:16, padding: isMobile ? 16 : 28, WebkitBackdropFilter:'blur(12px)', backdropFilter:'blur(12px)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div style={{ fontFamily:'Fraunces, serif', fontWeight:700, fontSize:14, color: eff.texte }}>{cat.cat}</div>
                <div style={{ fontFamily:'Space Mono, monospace', fontSize:9, color:`rgba(${aRgb},0.4)`, background:`rgba(${aRgb},0.06)`, border:`1px solid rgba(${aRgb},0.15)`, padding:'3px 8px', borderRadius:4 }}>{cat.items.length}</div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {cat.items.map(([nom, pct]) => {
                  const indicatorColor = pct >= 85 ? a : (pct >= 70 ? `rgba(${aRgb},0.5)` : `rgba(${aRgb},0.25)`)
                  return (
                    <div key={nom} className="pf-skill-pill" style={{ display:'flex', alignItems:'center', gap:8, background: isLight ? 'rgba(0,0,0,0.05)' : eff.cardBg, border:`1px solid ${eff.borderStrong}`, borderRadius:8, padding: isMobile ? '6px 10px' : '8px 14px' }}>
                      <div style={{ width:6, height:6, borderRadius:6, background: indicatorColor, flexShrink:0 }} />
                      <div style={{ fontFamily:'Inter, sans-serif', fontSize: isMobile ? 12 : 13, color: eff.textHigh }}>{nom}</div>
                      <div style={{ fontFamily:'Space Mono, monospace', fontSize: isMobile ? 9 : 10, color:`rgba(${aRgb},0.55)`, marginLeft:'auto' }}>{pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="pf-projects" style={sectionStyle}>
        <div style={s.secNum}>03 // PROJETS</div>
        <h2 style={s.secTitle}>Mes Projets <span style={s.accent}>Réalisés</span></h2>

        {/* 3 cartes aperçu */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? 10 : 20,
          marginBottom: isMobile ? 24 : 40,
        }}>
          {projets.slice(0, 3).map((p) => (
            <div key={p.num} style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              minWidth: 0,
              border: `1px solid ${eff.borderMedium}`,
              background: eff.cardBg,
              cursor: 'pointer',
              transition: 'transform 0.3s, border-color 0.3s',
              maxWidth: '100%',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.borderColor = `rgba(${aRgb},0.35)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = eff.borderMedium
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: isMobile ? 100 : 160, overflow: 'hidden', maxHeight: isMobile ? 200 : 'none' }}>
                <img src={p.img} alt={p.titre}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', transition: 'transform 0.5s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(to top, ${eff.fond}d9 0%, transparent 60%)`,
                }} />
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  fontFamily: 'Space Mono, monospace', fontSize: 9,
                  color: `rgba(${aRgb},0.7)`, letterSpacing: '0.2em',
                  background: isLight ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                  padding: '3px 8px', borderRadius: 4,
                }}>{p.num}</div>
              </div>

              {/* Contenu */}
              <div style={{ padding: isMobile ? '10px 12px 14px' : '16px 18px 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {p.tags.slice(0, isMobile ? 1 : 2).map(t => (
                    <span key={t} style={{
                      background: `rgba(${aRgb},0.08)`,
                      border: `1px solid rgba(${aRgb},0.2)`,
                      color: a, padding: '3px 10px',
                      fontSize: 8, letterSpacing: '0.15em',
                      borderRadius: 4, fontFamily: 'Space Mono, monospace',
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{
                  fontFamily: 'Fraunces, serif', fontWeight: 700,
                  fontSize: isMobile ? 12 : 15, color: eff.texte, marginBottom: isMobile ? 4 : 8, lineHeight: 1.3,
                }}>{p.titre}</div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 300,
                  fontSize: isMobile ? 10 : 12, color: eff.textFaint,
                  lineHeight: 1.65,
                  display: '-webkit-box', WebkitLineClamp: isMobile ? 1 : 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — Voir tous les projets */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '16px 18px' : '24px 32px',
          background: `rgba(${aRgb},0.04)`,
          border: `1px solid rgba(${aRgb},0.15)`,
          borderRadius: 16,
          gap: 16,
        }}>
          <div>
            <div style={{
              fontFamily: 'Fraunces, serif', fontWeight: 700,
              fontSize: isMobile ? 15 : 18, color: eff.texte, marginBottom: 6,
            }}>
              Et {projets.length - 3} autres projets...
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontSize: isMobile ? 12 : 13,
              color: eff.textFaint, lineHeight: 1.6,
            }}>
              GSB, ZikmuCI, Terasse — des réalisations variées qui témoignent de ma polyvalence.
            </div>
          </div>

          <a href="/projets" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: isMobile ? 'center' : undefined, gap: 10,
            background: a, color: '#050505',
            padding: isMobile ? '11px 20px' : '12px 28px', borderRadius: 10,
            fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 9 : 10,
            letterSpacing: '0.18em', fontWeight: 700,
            textDecoration: 'none', whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'opacity 0.2s, transform 0.2s',
            boxShadow: `0 0 24px rgba(${aRgb},0.25)`,
            width: isMobile ? '100%' : 'auto'
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateX(4px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateX(0)' }}
          >
            DÉCOUVRIR TOUS MES PROJETS →
          </a>
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
        <div style={servicesGridStyle}>
          {services.map((sv, idx) => {
            const isPopular = !!sv.badge
            const cardStyle = { display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems:'stretch', background: eff.cardBg, border:`1px solid ${eff.borderStrong}`, WebkitBackdropFilter:'blur(16px)', backdropFilter:'blur(16px)', borderRadius:16, overflow:'hidden', maxWidth: '100%', transition:'border-color 300ms, transform 300ms', padding: isMobile ? '12px' : 0, minWidth: 0 }
            if (isPopular) { cardStyle.border = `1px solid rgba(${aRgb},0.25)`; cardStyle.background = `rgba(${aRgb},0.04)` }
            const leftStyle = { width: isMobile ? '100%' : 260, flexShrink:0, background:`rgba(${aRgb},0.05)`, borderRight: isMobile ? 'none' : `1px solid ${eff.borderMedium}`, borderBottom: isMobile ? `1px solid ${eff.borderMedium}` : 'none', padding: isMobile ? '18px 20px' : '28px 32px', display:'flex', flexDirection:'column', justifyContent:'center', minWidth: 0 }
            const rightStyle = { flex:1, padding: isMobile ? '16px 18px' : '28px 36px', display:'flex', flexWrap:'wrap', alignContent:'center', gap:'10px 24px' }
            const badgeStyle = { background:a, color:'#050505', fontFamily:'Space Mono, monospace', fontSize:8, fontWeight:700, letterSpacing:'0.1em', padding:'4px 10px', borderRadius:4, display:'inline-block', marginBottom:16 }
            const priceStyle = { fontFamily:'Fraunces, serif', fontWeight:800, fontSize:isMobile ? 20 : 28, color:a, marginBottom:6 }
            const titleStyle = { fontFamily:'Fraunces, serif', fontWeight:600, fontSize:isMobile ? 14 : 16, color: eff.texte, marginBottom:8 }
            const delayStyle = { fontFamily:'Space Mono, monospace', fontSize:9, color:`rgba(${aRgb},0.45)`, display:'flex', alignItems:'center', gap:6 }
            return (
              <div key={sv.titre} className="pf-service-card pf-card" style={cardStyle}>
                {sv.badge && <div style={{ position:'absolute', top:16, right:16 }}>{/* visual badge preserved for accessibility */}</div>}
                <div style={leftStyle}>
                  {sv.badge && <div style={badgeStyle}>{sv.badge}</div>}
                  <div style={priceStyle}>{sv.prix}</div>
                  <div style={titleStyle}>{sv.titre}</div>
                  <div style={delayStyle}><span style={{ color:a }}>●</span><span>Délai : {sv.delai}</span></div>
                  <a href="mailto:devfred58@gmail.com" style={{ marginTop: isMobile ? 14 : 24, background:`rgba(${aRgb},0.1)`, border:`1px solid rgba(${aRgb},0.3)`, color:a, fontFamily:'Space Mono, monospace', fontSize:isMobile ? 10 : 9, letterSpacing:'0.18em', padding:isMobile ? '12px 16px' : '10px 20px', borderRadius:8, textDecoration:'none', display:'block', textAlign:'center', width: isMobile ? '100%' : 'auto' }}>COMMANDER</a>
                </div>
                <div style={rightStyle}>
                  {sv.features.map((f, i) => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:10, width: isMobile ? '100%' : 'calc(50% - 12px)', marginBottom:8 }}>
                      <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18, flexShrink:0, background:`rgba(${aRgb},0.1)`, border:`1px solid rgba(${aRgb},0.25)`, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:isMobile ? 9 : 10, color:a }}>✓</div>
                      <div style={{ fontFamily:'Inter, sans-serif', fontWeight:300, fontSize:isMobile ? 11 : 12, color: eff.textMuted }}>{f}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* METHODOLOGY */}
      <section id="pf-methodology" style={sectionStyle}>
        <div style={s.secNum}>05 // MÉTHODE</div>
        <h2 style={s.secTitle}>Ma <span style={s.accent}>Méthode</span> de Travail</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? 12 : 2,
          position: 'relative',
        }}>
          {[
            { n:'01', titre:'Analyse & Audit', desc:'Compréhension des besoins, définition des objectifs et cartographie complète du projet.', icon:'◈' },
            { n:'02', titre:'Conception & UI', desc:'Design des maquettes, prototypage interactif et création de l\'identité visuelle.', icon:'◎' },
            { n:'03', titre:'Développement', desc:'Codage propre et optimisé avec architecture scalable et maintenable.', icon:'⬡' },
            { n:'04', titre:'Tests & Validation', desc:'Tests multi-navigateurs, validation performance, accessibilité et SEO.', icon:'◇' },
            { n:'05', titre:'Déploiement', desc:'Mise en ligne sécurisée, formation et documentation complète.', icon:'◉' },
          ].map((e, i) => {
            const isLast = i === 4
            return (
              <div
                key={e.n}
                style={{
                  position: 'relative',
                  padding: isMobile ? '20px 18px' : '36px 32px',
                  background: i % 2 === 0
                    ? `rgba(${aRgb},0.04)`
                    : eff.cardBg,
                  border: `1px solid rgba(${aRgb},${i % 2 === 0 ? '0.15' : '0.07'})`,
                  borderRadius: 20,
                  margin: isMobile ? 6 : 8,
                  transition: 'transform 0.3s, border-color 0.3s, background 0.3s',
                  gridColumn: isLast ? (isMobile ? '1 / -1' : '2 / 3') : 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.borderColor = `rgba(${aRgb},0.5)`
                  e.currentTarget.style.background = `rgba(${aRgb},0.08)`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = `rgba(${aRgb},${i % 2 === 0 ? '0.15' : '0.07'})`
                  e.currentTarget.style.background = i % 2 === 0
                    ? `rgba(${aRgb},0.04)`
                    : eff.cardBg
                }}
              >
                {/* Ligne de connexion top */}
                {i > 0 && !isMobile && (
                  <div style={{
                    position: 'absolute',
                    top: -8,
                    left: '50%',
                    width: 1,
                    height: 8,
                    background: `linear-gradient(180deg, transparent, rgba(${aRgb},0.3))`,
                  }} />
                )}

                {/* Header numéro + icône */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: 11,
                    color: `rgba(${aRgb},0.4)`,
                    letterSpacing: '0.3em',
                  }}>{e.n}</div>
                  <div style={{
                    width: isMobile ? 36 : 44,
                    height: isMobile ? 36 : 44,
                    borderRadius: '50%',
                    background: `rgba(${aRgb},0.08)`,
                    border: `1px solid rgba(${aRgb},0.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? 18 : 20,
                    color: a,
                  }}>{e.icon}</div>
                </div>

                {/* Ligne accent */}
                <div style={{
                  width: 32, height: 2,
                  background: `linear-gradient(90deg, ${a}, transparent)`,
                  borderRadius: 2,
                }} />

                {/* Titre */}
                <div style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 700,
                  fontSize: isMobile ? 14 : 16,
                  color: eff.texte,
                  lineHeight: 1.3,
                }}>{e.titre}</div>

                {/* Description */}
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 300,
                  fontSize: isMobile ? 11 : 12,
                  color: eff.textMuted,
                  lineHeight: 1.7,
                }}>{e.desc}</div>

                {/* Indicateur de progression */}
                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  {[...Array(5)].map((_, dot) => (
                      <div key={dot} style={{
                      width: dot <= i ? (isMobile ? 14 : 20) : 6,
                      height: 3,
                      borderRadius: 2,
                      background: dot <= i
                        ? a
                        : `rgba(${aRgb},0.15)`,
                      transition: 'width 0.3s',
                    }} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CONTACT */}
      <section id="pf-contact" style={sectionStyle}>
        <div style={s.secNum}>06 // CONTACT</div>
        <h2 style={s.secTitle}>Travaillons <span style={s.accent}>Ensemble</span></h2>

        {accesDirecte && (
          <AxisBouton
            isMobile={isMobile}
            a={a}
            aRgb={aRgb}
            navigate={navigate}
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
            Vous avez un projet web, une idée à concrétiser ou vous cherchez un développeur fullstack passionné par l'IA ? Je suis disponible pour des missions freelance, des collaborations et des opportunités à temps plein.
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
        background: 'rgba(0,0,0,0.4)',
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
            FRÉJUS KOUADIO · DEV FULLSTACK & IA
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


