import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Target, Briefcase, Users, Eye, Mic, PenLine } from 'lucide-react'
import AvatarParticulaire from '@/composants/ui/AvatarParticulaire'
import utiliserStore from '@/store/utiliserStore'
import utiliserTheme from '@/store/utiliserTheme'

const variantsStep = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 }
}

export default function Accueil() {
  const [etape, setEtape] = useState(1)
  const [prenom, setPrenom] = useState('')
  const [profil, setProfil] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showThemeModal, setShowThemeModal] = useState(
    () => !localStorage.getItem('devj-theme-chosen')
  )
  const store = utiliserStore()
  const { theme, themes, changerTheme } = utiliserTheme()
  const a = theme.accent
  const aRgb = theme.accentRgb
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (etape === 1) inputRef.current?.focus()
  }, [etape])

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  function submitIdentite(e) {
    e?.preventDefault()
    if (!prenom.trim()) return
    store.definirVisiteur({ prenom })
    setEtape(2)
  }

  function choisirProfil(p) {
    setProfil(p)
    setTimeout(() => setEtape(3), 350)
  }

  function activerMicro() {
    store.definirVisiteur({ prenom, profession: profil, microActif: true })
    setTimeout(() => navigate('/experience'), 700)
  }

  function continuerSansMicro() {
    store.definirVisiteur({ prenom, profession: profil })
    navigate('/experience')
  }

  function fermerModal(themeId) {
    if (themeId) {
      changerTheme(themeId)
    }
    localStorage.setItem('devj-theme-chosen', '1')
    setShowThemeModal(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: theme.fond, backgroundImage: `linear-gradient(rgba(${aRgb},0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(${aRgb},0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }}>

      <style>{`\n        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;1,9..144,400&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');\n        @keyframes scanY { 0%{ top:0% } 100%{ top:100% } }\n        @keyframes scanOpacity { 0%{opacity:.2}50%{opacity:.8}100%{opacity:.2} }\n        @keyframes pulseRing { 0%{ transform: scale(1); opacity: .6 } 100%{ transform: scale(1.3); opacity: 0 } }\n      `}</style>

      {/* HUD corners */}
      <div className="absolute top-4 left-4 w-5 h-5 border-t border-l" style={{ borderColor: a }} />
      <div className="absolute top-4 right-4 w-5 h-5 border-t border-r" style={{ borderColor: a }} />
      <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l" style={{ borderColor: a }} />
      <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r" style={{ borderColor: a }} />

      {/* Scan line (full page) */}
      <div className="absolute left-0 right-0 h-px" style={{ top: 0, animation: 'scanY 4s linear infinite', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, rgba(${aRgb},0.15), transparent)` }} />
      </div>

      {/* Fixed logo top-left */}
      <div className="absolute" style={{ top: 16, left: 16, fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
        <span>&lt;</span>
        <span style={{ color: a, margin: '0 6px' }}>/DevJ</span>
        <span>&gt;</span>
      </div>

      {/* Counter top-right */}
      <div className="absolute" style={{ top: 16, right: 16, fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
        <span style={{ color: a }}>{'0' + etape}</span>
        <span style={{ margin: '0 6px' }}>/ 03</span>
      </div>

      <div className="relative z-10 w-full max-w-3xl px-6" style={{ paddingLeft: isMobile ? 16 : undefined, paddingRight: isMobile ? 16 : undefined }}>
        <div className="flex flex-col items-center text-center">
          <div style={{ marginBottom: isMobile ? '16px' : '32px', display: 'flex', justifyContent: 'center' }}>
            <AvatarParticulaire width={isMobile ? 140 : 220} height={isMobile ? 140 : 220} />
          </div>
          <div className="w-[48px] h-px mb-[20px]" style={{ background: a }} />
          <div className="text-[10px] uppercase tracking-[0.25em] mb-[18px]" style={{ fontFamily: 'Space Mono, monospace', color: a }}>IDENTIFIANT</div>

          <AnimatePresence mode="wait">
            {etape === 1 && (
              <motion.div key="step1" variants={variantsStep} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
                <h1 className="text-white font-extrabold mb-[14px]" style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? 36 : 72, letterSpacing: '-0.03em', lineHeight: 1 }}>Bonjour, je suis AXIS</h1>
                <p className="text-[17px] text-white/60 max-w-lg mb-[44px]" style={{ fontSize: isMobile ? 14 : 17, marginBottom: isMobile ? '24px' : '44px', maxWidth: isMobile ? '100%' : undefined }}>Je vais t'accompagner pour créer une expérience personnalisée. Commence par me dire comment t'appeler.</p>

                <form onSubmit={submitIdentite} className="relative mb-8" style={{ width: isMobile ? '100%' : 440 }}>
                  {/* wrapper corners */}
                  <div className="absolute -top-2 -left-2 w-2 h-2 border" style={{ borderColor: a }} />
                  <div className="absolute -top-2 -right-2 w-2 h-2 border" style={{ borderColor: a }} />
                  <div className="absolute -bottom-2 -left-2 w-2 h-2 border" style={{ borderColor: a }} />
                  <div className="absolute -bottom-2 -right-2 w-2 h-2 border" style={{ borderColor: a }} />

                  <div className="text-left" style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: a, padding: '8px 12px 4px', letterSpacing: '0.2em', borderBottom: `1px solid rgba(${aRgb},0.2)` }}>IDENTITÉ_VISITEUR</div>

                  <input
                    ref={inputRef}
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ton prénom ici..."
                    className="w-full mt-2 px-4 py-4 text-white placeholder:text-white/25 text-[20px]"
                    style={{ background: `rgba(${aRgb},0.04)`, borderLeft: `1px solid rgba(${aRgb},0.25)`, borderRight: `1px solid rgba(${aRgb},0.25)`, borderBottom: `1px solid rgba(${aRgb},0.25)`, borderTop: 'none', fontFamily: 'Syne, sans-serif', outline: 'none', caretColor: a, color: '#fff', fontSize: 20, padding: '18px 16px' }}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitIdentite(e) }}
                  />

                  <div className="h-px mt-3" style={{ background: `linear-gradient(90deg, transparent, ${a}, transparent)`, animation: 'scanOpacity 2s linear infinite' }} />
                </form>

                <button type="button" onClick={submitIdentite} className="flex items-center gap-[10px] transition duration-200 ease-[ease] rounded-none" style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, padding: '14px 40px', color: a, textTransform: 'uppercase', letterSpacing: '0.2em', border: `1px solid rgba(${aRgb},0.5)`, background: `rgba(${aRgb},0.08)` }} onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(${aRgb},0.15)`; e.currentTarget.style.borderColor = a }} onMouseLeave={(e) => { e.currentTarget.style.background = `rgba(${aRgb},0.08)`; e.currentTarget.style.borderColor = `rgba(${aRgb},0.5)` }}>
                  <span>Continuer</span>
                  <ArrowRight size={15} color={a} />
                </button>
              </motion.div>
            )}

            {etape === 2 && (
              <motion.div key="step2" variants={variantsStep} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
                <h1 className="text-white font-extrabold mb-[14px]" style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? 36 : 72, letterSpacing: '-0.03em', lineHeight: 1 }}>Quel est ton rôle ?</h1>
                <p className="text-[17px] text-white/60 max-w-lg mb-[44px]" style={{ fontSize: isMobile ? 14 : 17, marginBottom: isMobile ? '24px' : '44px', maxWidth: isMobile ? '100%' : undefined }}>Choisis une case qui te décrit le mieux.</p>

                <div style={{ width: isMobile ? '100%' : 400 }} className={isMobile ? 'grid grid-cols-1 gap-[10px]' : 'grid grid-cols-2 gap-[12px]'}>
                  {[
                    { key: 'recruteur', icon: Target, title: 'Recruteur', subtitle: "À la recherche d'un talent" },
                    { key: 'client', icon: Briefcase, title: 'Client', subtitle: "J'ai un projet en tête" },
                    { key: 'collab', icon: Users, title: 'Collaborateur', subtitle: 'Travaillons ensemble' },
                    { key: 'curieux', icon: Eye, title: 'Curieux', subtitle: 'Je découvre simplement' }
                  ].map((c) => {
                    const Icon = c.icon
                    const selected = profil === c.key
                    return (
                      <button key={c.key} onClick={() => choisirProfil(c.key)} className="group relative overflow-hidden text-left p-[18px_16px] flex flex-col items-start gap-2 transition-[border-color,background] duration-200 rounded-none border" style={{ borderColor: selected ? a : `rgba(${aRgb},0.18)`, background: selected ? `rgba(${aRgb},0.1)` : `rgba(${aRgb},0.025)` }} onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = `rgba(${aRgb},0.45)` }} onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = `rgba(${aRgb},0.18)` }}>
                        <div className={`absolute top-0 left-0 right-0 h-px origin-left transform transition-transform duration-300 ${selected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} style={{ background: a }} />
                        <div className="flex items-center gap-3">
                          <Icon size={20} style={{ color: selected ? a : 'rgba(255,255,255,0.35)' }} />
                        </div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.18em', color: selected ? a : 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', lineHeight: 1.4 }}>{c.subtitle}</div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {etape === 3 && (
              <motion.div key="step3" variants={variantsStep} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
                <h1 className="text-white font-extrabold mb-[14px]" style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? 36 : 72, letterSpacing: '-0.03em', lineHeight: 1 }}>Active ton micro</h1>
                <p className="text-[17px] text-white/60 max-w-lg mb-[44px]" style={{ fontSize: isMobile ? 14 : 17, marginBottom: isMobile ? '24px' : '44px', maxWidth: isMobile ? '100%' : undefined }}>Tu peux activer le micro pour parler à DevJ, ou continuer sans micro.</p>

                <div className="flex flex-col items-center mb-10">
                  <div className="relative w-[100px] h-[100px] mb-6 flex items-center justify-center">
                    <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', border: `1px solid rgba(${aRgb},0.3)`, animation: 'pulseRing 2s ease-out infinite' }} />
                    <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', border: `1px solid rgba(${aRgb},0.3)`, animation: 'pulseRing 2s ease-out infinite', animationDelay: '0.5s' }} />
                    <div style={{ width: 64, height: 64, border: `1px solid ${a}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mic size={28} color={a} />
                    </div>
                  </div>

                  <button onClick={activerMicro} className="flex items-center gap-[10px] transition duration-200 ease-[ease] rounded-none" style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: a, padding: '14px 40px', textTransform: 'uppercase', letterSpacing: '0.2em', border: `1px solid rgba(${aRgb},0.5)`, background: `rgba(${aRgb},0.08)` }} onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(${aRgb},0.15)`; e.currentTarget.style.borderColor = a }} onMouseLeave={(e) => { e.currentTarget.style.background = `rgba(${aRgb},0.08)`; e.currentTarget.style.borderColor = `rgba(${aRgb},0.5)` }}>
                    <Mic size={14} color={a} />
                    <span>Activer le microphone</span>
                  </button>

                  <button onClick={continuerSansMicro} className="mt-4" style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', textDecoration: 'none' }}>
                    <PenLine size={11} color="rgba(255,255,255,0.3)" style={{ marginRight: 8 }} />
                    Continuer sans micro
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* progression */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3" style={{ bottom: isMobile ? 16 : 32 }}>
            {[1,2,3].map((i) => (
              <div key={i} className="h-px transition-all duration-300" style={{ width: etape === i ? 48 : 16, background: etape === i ? a : '#1f2937' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Bouton d'accès direct au portfolio */}
      <button
        onClick={() => navigate('/portfolio')}
        style={{
          position: 'fixed',
          bottom: isMobile ? 20 : 32,
          right: isMobile ? 16 : 32,
          zIndex: 50,
          background: 'rgba(5,5,5,0.5)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: `1px solid rgba(${aRgb},0.2)`,
          borderRadius: 18,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          color: a,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.border = `1px solid rgba(${aRgb},0.4)`
          e.currentTarget.style.background = 'rgba(5,5,5,0.7)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border = `1px solid rgba(${aRgb},0.2)`
          e.currentTarget.style.background = 'rgba(5,5,5,0.5)'
        }}
      >
        <Briefcase size={14} color={a} />
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Portfolio</span>
      </button>

      {showThemeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 520,
            background: 'rgba(8,8,8,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
            padding: isMobile ? '32px 24px' : '48px 40px',
            backdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            fontFamily: 'Inter, sans-serif',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.35em',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 16,
              }}>
                BIENVENUE SUR DEVJ PORTFOLIO
              </div>
              <h2 style={{
                fontFamily: 'Fraunces, serif',
                fontSize: isMobile ? 28 : 36,
                fontWeight: 800,
                color: '#fff',
                margin: 0,
                lineHeight: 1.1,
              }}>
                Choisis ton thème
              </h2>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: 'rgba(255,255,255,0.5)',
                marginTop: 12,
                lineHeight: 1.6,
              }}>
                Personnalise ton expérience avant d'explorer.
                Tu pourras changer ça plus tard dans les paramètres.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
            }}>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => fermerModal(t.id)}
                  style={{
                    background: `rgba(${t.accentRgb},0.06)`,
                    border: `1px solid rgba(${t.accentRgb},0.25)`,
                    borderRadius: 16,
                    padding: '20px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    alignItems: 'flex-start',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 
                      `rgba(${t.accentRgb},0.14)`
                    e.currentTarget.style.borderColor = t.accent
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 
                      `rgba(${t.accentRgb},0.06)`
                    e.currentTarget.style.borderColor = 
                      `rgba(${t.accentRgb},0.25)`
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: t.accent,
                      boxShadow: `0 0 16px rgba(${t.accentRgb},0.5)`,
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 700,
                        fontSize: 15,
                        color: '#fff',
                      }}>{t.nom || t.label}</div>
                      <div style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: 9,
                        color: t.accent,
                        letterSpacing: '0.15em',
                        marginTop: 2,
                      }}>{t.accent}</div>
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 6,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, 
                      ${t.accent}, 
                      rgba(${t.accentRgb},0.2))`,
                  }} />
                </button>
              ))}
            </div>

            <button
              onClick={() => fermerModal(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                fontFamily: 'Space Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.2em',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '8px',
              }}
            >
              PASSER — GARDER LE THÈME ACTUEL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}