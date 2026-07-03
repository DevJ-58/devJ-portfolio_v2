import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserTheme from '@/store/utiliserTheme'
import PanneauParametres from '@/composants/ui/PanneauParametres'

// Composant AcademicStaircase - défini au niveau module pour éviter les re-rendus
function AcademicStaircase({ isMobile, a, aRgb, eff }) {
  const niveaux = [
    { lvl: 'LVL 01', label: 'BEPC', annee: '2020–2021', titre: "Brevet d'Études du Premier Cycle", desc: "Première étape du parcours scolaire, validée avec de bons résultats généraux.", done: true, hauteur: 70 },
    { lvl: 'LVL 02', label: 'BAC', annee: '2023–2024', titre: 'Baccalauréat, série D', desc: "Obtention du baccalauréat scientifique, ouvrant la voie vers les études supérieures en ingénierie.", done: true, hauteur: 130 },
    { lvl: 'LVL 03', label: 'LICENCE', annee: '2024–en cours', titre: '2ème année sur 3 — Génie Logiciel', desc: "Cursus de licence en génie logiciel (3 ans). Actuellement en 2ème année, avec une spécialisation progressive vers l'intelligence artificielle.", done: false, hauteur: 195 },
  ]

  const [etapeActiveIdx, setEtapeActiveIdx] = useState(niveaux.length - 1)
  const etapeActive = niveaux[etapeActiveIdx]
  
  // Adapter les hauteurs sur mobile
  const heightMultiplier = isMobile ? 0.65 : 1
  
  return (
    <div style={{
      background: eff.cardBg,
      border: `1px solid ${eff.borderStrong}`,
      borderRadius: 20,
      padding: isMobile ? '24px 18px' : '44px 48px',
      position: 'relative',
      overflow: 'hidden',
      WebkitBackdropFilter: 'blur(12px)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Ligne lumineuse en haut */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 40,
        right: 40,
        height: 1,
        background: `linear-gradient(90deg, transparent, rgba(${aRgb},0.3), transparent)`,
        pointerEvents: 'none',
      }} />

      {/* ESCALIER */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: isMobile ? 8 : 16,
        height: isMobile ? 160 : 220,
        padding: '0 4px',
        position: 'relative',
      }}>
        {niveaux.map((niveau, i) => {
          const isActive = i === etapeActiveIdx
          const marheHauteur = niveau.hauteur * heightMultiplier
          
          return (
            <div
              key={niveau.lvl}
              onClick={() => setEtapeActiveIdx(i)}
              style={{
                flex: isActive ? 1.3 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: isMobile ? 8 : 10,
                cursor: 'pointer',
                position: 'relative',
                transition: 'flex 0.3s ease',
              }}
            >
              {/* Label LVL */}
              <div style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 8,
                letterSpacing: '0.15em',
                color: isActive ? a : `rgba(${aRgb},0.35)`,
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
              }}>
                {niveau.lvl}
              </div>

              {/* Marqueur lumineux sur l'étape active */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: -34,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: a,
                  boxShadow: `0 0 16px rgba(${aRgb},0.6)`,
                  zIndex: 5,
                }}>
                  {/* Trait fin reliant au sommet de la marche */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 1,
                    height: 24,
                    background: a,
                    opacity: 0.4,
                  }} />
                </div>
              )}

              {/* La marche */}
              <div
                style={{
                  width: '100%',
                  height: marheHauteur,
                  borderRadius: '10px 10px 0 0',
                  position: 'relative',
                  transition: isActive ? 'all 0.3s ease' : 'background 0.2s ease, border 0.2s ease',
                  ...(isActive
                    ? {
                        background: `linear-gradient(180deg, rgba(${aRgb},0.18), rgba(${aRgb},0.08))`,
                        border: `1.5px solid ${a}`,
                        boxShadow: `0 0 30px rgba(${aRgb},0.15)`,
                      }
                    : niveau.done
                    ? {
                        background: `rgba(${aRgb},0.08)`,
                        border: `1px solid rgba(${aRgb},0.25)`,
                      }
                    : {
                        background: `rgba(${aRgb},0.05)`,
                        border: `1px solid rgba(${aRgb},0.15)`,
                      }),
                }}
              >
                {/* Badge EN COURS */}
                {isActive && !niveau.done && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: 'Space Mono, monospace',
                    fontSize: 7,
                    letterSpacing: '0.1em',
                    color: a,
                    textTransform: 'uppercase',
                    pointerEvents: 'none',
                  }}>
                    <span style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: a,
                      animation: 'pulse 1.4s infinite',
                    }} />
                    EN COURS
                  </div>
                )}

                {/* Coche pour les marches complétées (non active) */}
                {!isActive && niveau.done && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: 'Fraunces, serif',
                    fontSize: isMobile ? 20 : 28,
                    fontWeight: 700,
                    color: a,
                    opacity: 0.6,
                    pointerEvents: 'none',
                  }}>
                    ✓
                  </div>
                )}
              </div>

              {/* Label diplôme */}
              <div style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 9,
                fontWeight: 700,
                color: isActive ? a : eff.texte,
                transition: 'color 0.2s ease',
                textAlign: 'center',
              }}>
                {niveau.label}
              </div>

              {/* Année */}
              <div style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 8,
                color: isActive ? `rgba(${aRgb},0.6)` : eff.textFaint,
                transition: 'color 0.2s ease',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {niveau.annee}
              </div>
            </div>
          )
        })}

        {/* Marche fantôme (étape suivante) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isMobile ? 8 : 10,
            opacity: 0.35,
            cursor: 'default',
          }}
        >
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 8,
            letterSpacing: '0.15em',
            color: eff.textFaint,
            textTransform: 'uppercase',
          }}>
            LVL 0{niveaux.length + 1}
          </div>

          <div
            style={{
              width: '100%',
              height: (niveaux[niveaux.length - 1].hauteur + 35) * heightMultiplier,
              borderRadius: '10px 10px 0 0',
              border: `1px dashed rgba(${aRgb},0.2)`,
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? 16 : 24,
              fontWeight: 700,
              color: eff.textFaint,
            }}
          >
            ?
          </div>

          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 9,
            fontWeight: 700,
            color: eff.textFaint,
            opacity: 0.5,
          }}>
            À venir
          </div>

          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 8,
            color: eff.textFaint,
            opacity: 0.3,
          }}>
            —
          </div>
        </div>
      </div>

      {/* Ligne de sol */}
      <div style={{
        height: 2,
        background: eff.borderStrong,
        marginTop: 0,
        marginBottom: isMobile ? 24 : 28,
      }} />

      {/* Panneau de détail */}
      <div
        key={etapeActiveIdx}
        style={{
          padding: isMobile ? '18px 20px' : '22px 26px',
          background: `rgba(${aRgb},0.02)`,
          border: `1px solid rgba(${aRgb},0.15)`,
          borderLeft: `3px solid ${a}`,
          borderRadius: 12,
          animation: 'fadeInUp 0.3s ease',
        }}
      >
        {!etapeActive.done && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'Space Mono, monospace',
            fontSize: 9,
            color: a,
            background: `rgba(${aRgb},0.08)`,
            border: `1px solid rgba(${aRgb},0.25)`,
            padding: '4px 10px',
            borderRadius: 20,
            letterSpacing: '0.1em',
            marginBottom: 10,
          }}>
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: a,
              animation: 'pulse 1.4s infinite',
            }} />
            EN COURS
          </div>
        )}

        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 9,
          color: a,
          marginBottom: 6,
          letterSpacing: '0.1em',
        }}>
          {etapeActive.annee}
        </div>

        <div style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 700,
          fontSize: isMobile ? 18 : 18,
          color: eff.texte,
          marginBottom: 8,
        }}>
          {etapeActive.titre}
        </div>

        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 300,
          fontSize: 13,
          color: eff.textMuted,
          lineHeight: 1.6,
        }}>
          {etapeActive.desc}
        </div>
      </div>
    </div>
  )
}

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
  const contactGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 8 : 12 }
  const navLinksStyle = { display: isMobile ? 'none' : 'flex', gap: 16, fontSize: 9, color: eff.textFaint, letterSpacing: '0.2em', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }
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
              DÉVELOPPEUR LOGICIEL UI/UX DESIGNER
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
              Passionné par la création d'expériences web exceptionnelles et d'applications robustes. De Yamoussoukro à l'international.
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
              {['REACT','JAVASCRIPT','PHP','LARAVEL','FIGMA'].map(t => (
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
                DEV LOGICIEL · UI/UX DESIGNER
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
              Développeur logiciel UI/UX DESIGNER passionné, spécialisé en <strong style={{ color: eff.textHigh, fontWeight:500 }}>UX , UI</strong> moderne <strong style={{ color: eff.textHigh, fontWeight:500 }}>fluide</strong>. Conception d'applications et d'interfaces performantes, accessibles et esthétiques, avec un souci du détail et de la qualité du code.
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
              Actuellement en 2ème année de Licence Génie Logiciel à l'UIYA, basé à Yamoussoukro, Côte d'Ivoire, avec une spécialisation progressive vers l'intelligence artificielle. Disponible pour des projets locaux et internationaux.
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

        <AcademicStaircase isMobile={isMobile} a={a} aRgb={aRgb} eff={eff} />
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
        <div style={{
          background: eff.cardBg,
          border: `1px solid ${eff.borderStrong}`,
          borderRadius: 24,
          padding: isMobile ? '28px 20px' : '48px 56px',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 40, right: 40, height: 1,
            background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.3),transparent)`,
          }} />

          <div style={s.secNum}>03 // PROJETS</div>
          <h2 style={s.secTitle}>Mes Projets <span style={s.accent}>Réalisés</span></h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(340px, 420px) 1fr',
            gap: isMobile ? 32 : 48,
            alignItems: 'center',
            maxWidth: isMobile ? '100%' : 820,
          }}>

          {/* MOSAÏQUE DE VIGNETTES */}
          <div style={{
            position: 'relative',
            height: isMobile ? 320 : 280,
          }}>
            {projets.slice(0, 3).map((p, i) => {
              const layouts = [
                { top: 0, left: '0%', width: isMobile ? '58%' : 190, height: isMobile ? 150 : 150, rotate: -4 },
                { top: isMobile ? 40 : 20, left: isMobile ? '35%' : 150, width: isMobile ? '58%' : 170, height: isMobile ? 140 : 140, rotate: 3 },
                { top: isMobile ? 160 : 130, left: isMobile ? '0%' : 20, width: isMobile ? '55%' : 180, height: isMobile ? 130 : 135, rotate: 2 },
              ]
              const layout = layouts[i]
              return (
                <div key={p.num} style={{
                  position: 'absolute',
                  top: layout.top,
                  left: layout.left,
                  width: layout.width,
                  height: layout.height,
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: `1px solid ${eff.borderMedium}`,
                  transform: `rotate(${layout.rotate}deg)`,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = `rotate(0deg) scale(1.04)`; e.currentTarget.style.zIndex = 5 }}
                  onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${layout.rotate}deg) scale(1)`; e.currentTarget.style.zIndex = 'auto' }}
                >
                  <img src={p.img} alt={p.titre} style={{
                    width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block',
                  }} onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.style.background = `rgba(${aRgb},0.1)` }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)`,
                  }} />
                  <span style={{
                    position: 'absolute', bottom: 10, left: 10,
                    fontFamily: 'Space Mono, monospace', fontSize: 8,
                    letterSpacing: '0.15em', color: 'rgba(255,255,255,0.85)',
                    background: 'rgba(0,0,0,0.4)', padding: '3px 8px', borderRadius: 4,
                  }}>{p.titre.toUpperCase()}</span>
                </div>
              )
            })}

            {/* Bloc "+N autres" intégré dans la mosaïque */}
            <div style={{
              position: 'absolute',
              top: isMobile ? 160 : 150,
              left: isMobile ? '58%' : 190,
              width: isMobile ? '40%' : 150,
              height: isMobile ? 130 : 110,
              borderRadius: 14,
              background: `rgba(${aRgb},0.08)`,
              border: `1px solid rgba(${aRgb},0.3)`,
              transform: 'rotate(-2deg)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 18 : 22, color: a }}>
                +{projets.length - 3}
              </span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.15em', color: `rgba(${aRgb},0.6)` }}>
                AUTRES
              </span>
            </div>
          </div>

          {/* STAT + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: isMobile ? 40 : 52, color: a, lineHeight: 1 }}>
                {String(projets.length).padStart(2, '0')}
              </span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.2em', color: eff.textFaint, lineHeight: 1.4 }}>
                PROJETS<br/>DÉPLOYÉS
              </span>
            </div>

            <p style={{ fontSize: 13, color: eff.textMuted, lineHeight: 1.7, margin: 0, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
              Du frontend à l'IA, en passant par la culture ivoirienne — une exploration complète de mon travail, présentée dans une expérience 3D immersive.
            </p>

            <a href="/projets" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: isMobile ? 'center' : undefined, gap: 8,
              background: a, color: '#050505',
              padding: isMobile ? '14px 20px' : '14px 26px',
              borderRadius: 10,
              fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 10 : 10,
              letterSpacing: '0.18em', fontWeight: 700,
              textDecoration: 'none', width: isMobile ? '100%' : 'fit-content',
              boxShadow: `0 0 30px rgba(${aRgb},0.3)`,
              transition: 'opacity 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateX(4px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateX(0)' }}
            >
              EXPLORER TOUS LES PROJETS →
            </a>
          </div>
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


