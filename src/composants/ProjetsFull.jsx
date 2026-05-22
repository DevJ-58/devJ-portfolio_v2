import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserTheme from '@/store/utiliserTheme'

const PROJETS = [
  {
    num: '01', titre: 'Eliko Voyage',
    categorie: 'Agence de voyage',
    tags: ['HTML/CSS', 'JavaScript', 'React'],
    desc: "Interface moderne pour agence de voyage permettant la réservation en ligne et la gestion de séjours personnalisés.",
    img: '/asset/eliko.PNG',
    lien: 'https://devj-58.github.io/eliko_voyage/',
    annee: '2024',
    status: 'EN LIGNE',
  },
  {
    num: '02', titre: 'SanteAI',
    categorie: 'Télémédecine & IA',
    tags: ['React', 'Google AI', 'Python'],
    desc: "Plateforme de télémédecine avec IA intégrée, consultations vidéo et gestion de dossiers médicaux.",
    img: '/asset/santeAI.jpg',
    lien: 'https://devpost.com/software/santeai',
    annee: '2024',
    status: 'EN LIGNE',
  },
  {
    num: '03', titre: 'Bibliothèque UIYA',
    categorie: 'Application éducative',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Système complet de gestion de bibliothèque déployé pour l'Université Internationale de Yamoussoukro.",
    img: '/asset/uiya.PNG',
    lien: 'https://bibliotheque.igl-uiya.com/',
    annee: '2024',
    status: 'EN PRODUCTION',
  },
  {
    num: '04', titre: 'GSB — Gestion de Stock',
    categorie: 'Application de gestion',
    tags: ['PHP', 'Laravel', 'MySQL'],
    desc: "Application full-stack de gestion d'inventaire avec alertes automatiques et rapports exportables.",
    img: '/asset/GSB.jpg',
    lien: null,
    annee: '2023',
    status: 'PRIVÉ',
  },
  {
    num: '05', titre: 'ZikmuCI',
    categorie: 'Culture ivoirienne',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    desc: "Plateforme musicale ivoirienne célébrant le Coupé-Décalé, Zouglou et l'Afrobeat.",
    img: '/asset/zikmu.jpg',
    lien: 'https://devj-58.github.io/ZikmuCi/index.html',
    annee: '2023',
    status: 'EN LIGNE',
  },
  {
    num: '06', titre: 'Terasse',
    categorie: 'Sensibilisation environnement',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Site de sensibilisation au changement climatique en Côte d'Ivoire.",
    img: '/asset/terasse.jpg',
    lien: 'https://terasse-ivoire.vercel.app',
    annee: '2023',
    status: 'EN LIGNE',
  },
]

const FILTRES = ['TOUS', 'React', 'JavaScript', 'PHP', 'Python', 'HTML5']

export default function ProjetsFull() {
  const { theme } = utiliserTheme()
  const a = theme.accent
  const aRgb = theme.accentRgb
  const navigate = useNavigate()
  const [filtre, setFiltre] = useState('TOUS')
  const [survol, setSurvol] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const projetsFiltres = filtre === 'TOUS'
    ? PROJETS
    : PROJETS.filter(p => p.tags.some(t => t.includes(filtre)))

  const statusColor = (s) => {
    if (s === 'EN LIGNE') return a
    if (s === 'EN PRODUCTION') return '#f59e0b'
    return 'rgba(255,255,255,0.25)'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      color: '#F5F5F0',
      fontFamily: 'Inter, sans-serif',
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;1,9..144,400&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .filtres-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,5,5,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: isMobile ? '14px 20px' : '16px 60px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* CORRECTION 3 — Navigation directe sans rechargement pour ne pas retriggerer AXIS */}
        <button
          onClick={() => navigate('/experience', { state: { skipGreeting: true } })}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Space Mono, monospace',
            fontSize: 9, letterSpacing: '0.2em',
            cursor: 'pointer', transition: 'color 0.2s',
            padding: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = a}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          ← RETOUR
        </button>
        <div style={{
          fontFamily: 'Fraunces, serif', fontWeight: 800,
          fontSize: 14, color: '#F5F5F0', letterSpacing: '0.06em',
        }}>
          &lt;<span style={{ color: a }}>/DevJ</span>&gt;
        </div>
        <div style={{
          fontFamily: 'Space Mono, monospace', fontSize: 9,
          color: `rgba(${aRgb},0.5)`, letterSpacing: '0.2em',
        }}>
          {projetsFiltres.length} PROJETS
        </div>
      </nav>

      {/* HEADER */}
      <div style={{
        padding: isMobile ? '40px 20px 28px' : '80px 60px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontFamily: 'Fraunces, serif',
          fontSize: isMobile ? 80 : 200,
          display: isMobile ? 'none' : 'block',
          fontWeight: 800, color: 'rgba(255,255,255,0.012)',
          letterSpacing: '-0.05em', whiteSpace: 'nowrap',
          pointerEvents: 'none', userSelect: 'none',
        }}>WORK</div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
            color: `rgba(${aRgb},0.5)`, letterSpacing: isMobile ? '0.2em' : '0.35em',
            marginBottom: isMobile ? 10 : 16,
          }}>// PORTFOLIO COMPLET</div>

          <h1 style={{
            fontFamily: 'Fraunces, serif', fontWeight: 800,
            fontSize: isMobile ? 36 : 72,
            lineHeight: 1, margin: isMobile ? '0 0 14px' : '0 0 20px',
            letterSpacing: '-0.03em',
          }}>
            Tous mes<br />
            <span style={{ color: a }}>Projets</span>
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 300,
            fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.4)',
            maxWidth: isMobile ? '100%' : 500, lineHeight: 1.8, margin: 0,
          }}>
            6 projets réalisés entre 2023 et 2024 — du frontend au fullstack, de la culture ivoirienne à la télémédecine.
          </p>
        </div>
      </div>

      {/* FILTRES */}
      <div style={{
        padding: isMobile ? '0 20px 28px' : '0 60px 48px',
      }}>
        <div className="filtres-scroll" style={{ display: 'flex', gap: 10, overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? 6 : 0, WebkitOverflowScrolling: isMobile ? 'touch' : 'auto', msOverflowStyle: isMobile ? 'none' : undefined, scrollbarWidth: isMobile ? 'none' : undefined, flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
          {FILTRES.map(f => (
            <button key={f} onClick={() => setFiltre(f)} style={{
              padding: isMobile ? '6px 14px' : '8px 20px',
              background: filtre === f ? a : 'rgba(255,255,255,0.04)',
              border: filtre === f
                ? `1px solid ${a}`
                : '1px solid rgba(255,255,255,0.08)',
              color: filtre === f ? '#050505' : 'rgba(255,255,255,0.5)',
              fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
              letterSpacing: '0.15em', borderRadius: isMobile ? 20 : 6,
              cursor: 'pointer',
              fontWeight: filtre === f ? 700 : 400,
              transition: 'all 0.2s',
              flexShrink: isMobile ? 0 : undefined,
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* GRILLE PROJETS — layout alterné magazine */}
      <div style={{ padding: isMobile ? '0 20px 60px' : '0 60px 100px' }}>
        {projetsFiltres.map((p, idx) => {
          const isSurvol = survol === p.num
          const isGrand = idx === 0 || (idx % 5 === 0)

          return (
            <div
              key={p.num}
              style={{
                marginBottom: isMobile ? 14 : 24,
                animation: `fadeInUp 0.5s ease ${idx * 0.07}s both`,
              }}
            >
              <div
                onMouseEnter={() => setSurvol(p.num)}
                onMouseLeave={() => setSurvol(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : (isGrand ? (idx % 2 === 0 ? '55% 45%' : '45% 55%') : '1fr 1fr'),
                    minHeight: isMobile ? 'auto' : (isGrand ? 420 : 260),
                    borderRadius: isMobile ? 14 : 20,
                  overflow: 'hidden',
                  border: isSurvol
                    ? `1px solid rgba(${aRgb},0.4)`
                    : '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
                    transform: (!isMobile && isSurvol) ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: (!isMobile && isSurvol)
                      ? `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(${aRgb},0.1)`
                      : 'none',
                  cursor: 'default',
                }}
              >
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                    order: isMobile ? 1 : ((!isMobile && idx % 2 !== 0) ? 2 : 1),
                    minHeight: isMobile ? 190 : 'auto',
                    maxHeight: isMobile ? 210 : 'none',
                }}>
                  <img src={p.img} alt={p.titre}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', objectPosition: 'top',
                      display: 'block',
                      transition: 'transform 0.6s ease',
                      transform: isSurvol ? 'scale(1.04)' : 'scale(1)',
                    }}
                    onError={e => {
                      e.currentTarget.parentElement.style.background = `rgba(${aRgb},0.05)`
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: isMobile
                      ? 'linear-gradient(to top, rgba(5,5,5,0.75) 0%, transparent 55%)'
                      : (idx % 2 === 0
                        ? 'linear-gradient(to right, transparent 50%, rgba(5,5,5,0.7) 100%)'
                        : 'linear-gradient(to left, transparent 50%, rgba(5,5,5,0.7) 100%)'),
                    opacity: isMobile ? 1 : (isSurvol ? 0.6 : 1),
                    transition: 'opacity 0.3s',
                  }} />

                  <div style={{
                    position: 'absolute', top: 16, left: 16,
                    fontFamily: 'Space Mono, monospace', fontSize: 10,
                    color: a, letterSpacing: '0.2em',
                    background: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 10px', borderRadius: 4,
                  }}>{p.num}</div>

                  <div style={{
                    position: 'absolute', bottom: 16, left: 16,
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 10px', borderRadius: 20,
                  }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: statusColor(p.status),
                      animation: p.status !== 'PRIVÉ' ? 'pulse 1.5s infinite' : 'none',
                    }} />
                    <span style={{
                      fontFamily: 'Space Mono, monospace', fontSize: 8,
                      color: statusColor(p.status), letterSpacing: '0.15em',
                    }}>{p.status}</span>
                  </div>
                </div>

                <div style={{
                  padding: isMobile ? '16px 18px 20px' : isGrand ? '48px 52px' : '32px 40px',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', gap: isMobile ? 10 : (isGrand ? 20 : 14),
                  order: isMobile ? 2 : ((!isMobile && idx % 2 !== 0) ? 1 : 2),
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: isGrand ? 52 : 40, right: isGrand ? 52 : 40,
                    height: 1,
                    background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.15),transparent)`,
                  }} />

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 8,
                      color: `rgba(${aRgb},0.55)`, letterSpacing: isMobile ? '0.15em' : '0.2em',
                      textTransform: 'uppercase',
                    }}>{p.categorie}</div>
                    <div style={{
                      fontFamily: 'Space Mono, monospace', fontSize: 8,
                      color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em',
                    }}>{p.annee}</div>
                  </div>

                  <h2 style={{
                    fontFamily: 'Fraunces, serif', fontWeight: 800,
                    fontSize: isMobile ? 18 : (isGrand ? 36 : 24),
                    color: '#F5F5F0', margin: 0, lineHeight: 1.1,
                    letterSpacing: isMobile ? '-0.01em' : '-0.02em',
                  }}>{p.titre}</h2>

                  <div style={{
                    width: isMobile ? (isSurvol ? 40 : 24) : (isSurvol ? 60 : 32), height: 2,
                    background: `linear-gradient(90deg, ${a}, transparent)`,
                    borderRadius: 2,
                    transition: 'width 0.3s',
                  }} />

                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontWeight: 300,
                    fontSize: isMobile ? 12 : 13, color: 'rgba(245,245,240,0.5)',
                    lineHeight: isMobile ? 1.65 : 1.75, margin: 0,
                    display: isMobile ? '-webkit-box' : undefined,
                    WebkitLineClamp: isMobile ? 3 : undefined,
                    WebkitBoxOrient: isMobile ? 'vertical' : undefined,
                    overflow: isMobile ? 'hidden' : undefined,
                  }}>{p.desc}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 6 : 8 }}>
                    {p.tags.map(t => (
                      <span key={t} style={{
                        background: `rgba(${aRgb},0.07)`,
                        border: `1px solid rgba(${aRgb},0.18)`,
                        color: `rgba(${aRgb},0.8)`,
                        padding: isMobile ? '3px 10px' : '4px 12px', fontSize: isMobile ? 8 : 8,
                        letterSpacing: '0.15em', borderRadius: 4,
                        fontFamily: 'Space Mono, monospace',
                      }}>{t}</span>
                    ))}
                  </div>

                  {p.lien ? (
                    <a href={p.lien} target="_blank" rel="noopener" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: isMobile ? `rgba(${aRgb},0.1)` : (isSurvol ? a : `rgba(${aRgb},0.1)`),
                      border: `1px solid rgba(${aRgb},0.3)`,
                      color: isMobile ? a : (isSurvol ? '#050505' : a),
                      fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
                      letterSpacing: '0.15em', padding: isMobile ? '9px 16px' : '10px 20px',
                      borderRadius: 8, textDecoration: 'none',
                      width: isMobile ? '100%' : 'fit-content',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      transition: 'background 0.25s, color 0.25s',
                      fontWeight: isMobile ? 400 : (isSurvol ? 700 : 400),
                    }}>
                      VOIR LE PROJET →
                    </a>
                  ) : (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.2)',
                      fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
                      letterSpacing: '0.15em', padding: isMobile ? '9px 16px' : '10px 20px',
                      borderRadius: 8, width: isMobile ? '100%' : 'fit-content', justifyContent: isMobile ? 'center' : 'flex-start',
                    }}>
                      PROJET PRIVÉ
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* FOOTER MINIMAL */}
      <div style={{
        borderTop: `1px solid rgba(${aRgb},0.08)`,
        padding: isMobile ? '24px 20px' : '40px 60px',
        display: 'flex', justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? 12 : 16,
      }}>
        <div style={{
          fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
          color: `rgba(${aRgb},0.35)`, letterSpacing: '0.2em',
        }}>
          {new Date().getFullYear()} · FRÉJUS KOUADIO
        </div>
        {/* CORRECTION 3 — Idem footer : navigation directe vers /experience */}
        <button
          onClick={() => navigate('/portfolio', { state: { skipGreeting: true } })}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: `rgba(${aRgb},0.08)`,
            border: `1px solid rgba(${aRgb},0.2)`,
            color: a, padding: isMobile ? '12px 20px' : '10px 24px',
            fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
            letterSpacing: '0.18em', borderRadius: 8,
            cursor: 'pointer', transition: 'background 0.2s',
            width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start',
          }}
          onMouseEnter={e => e.currentTarget.style.background = `rgba(${aRgb},0.15)`}
          onMouseLeave={e => e.currentTarget.style.background = `rgba(${aRgb},0.08)`}
        >
          ← RETOUR AU PORTFOLIO
        </button>
      </div>
    </div>
  )
}
