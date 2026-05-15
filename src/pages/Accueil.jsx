import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Target, Briefcase, Users, Eye, Mic, PenLine } from 'lucide-react'
import AvatarParticulaire from '@/composants/ui/AvatarParticulaire'
import utiliserStore from '@/store/utiliserStore'

const variantsStep = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 }
}

export default function Accueil() {
  const [etape, setEtape] = useState(1)
  const [prenom, setPrenom] = useState('')
  const [profil, setProfil] = useState(null)
  const store = utiliserStore()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (etape === 1) inputRef.current?.focus()
  }, [etape])

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
    store.definirVisiteur({ prenom, profession: profil })
    setTimeout(() => navigate('/experience'), 700)
  }

  function continuerSansMicro() {
    store.definirVisiteur({ prenom, profession: profil })
    navigate('/experience')
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#050505', backgroundImage: 'linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>

      <style>{`\n        @keyframes scanY { 0%{ top:0% } 100%{ top:100% } }\n        @keyframes scanOpacity { 0%{opacity:.2}50%{opacity:.8}100%{opacity:.2} }\n        @keyframes pulseRing { 0%{ transform: scale(1); opacity: .6 } 100%{ transform: scale(1.3); opacity: 0 } }\n      `}</style>

      {/* HUD corners */}
      <div className="absolute top-4 left-4 w-5 h-5 border-t border-l" style={{ borderColor: '#10b981' }} />
      <div className="absolute top-4 right-4 w-5 h-5 border-t border-r" style={{ borderColor: '#10b981' }} />
      <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l" style={{ borderColor: '#10b981' }} />
      <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r" style={{ borderColor: '#10b981' }} />

      {/* Scan line (full page) */}
      <div className="absolute left-0 right-0 h-px" style={{ top: 0, animation: 'scanY 4s linear infinite', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)' }} />
      </div>

      {/* Fixed logo top-left */}
      <div className="absolute" style={{ top: 28, left: 40, fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
        <span>&lt;</span>
        <span style={{ color: '#10b981', margin: '0 6px' }}>/DevJ</span>
        <span>&gt;</span>
      </div>

      {/* Counter top-right */}
      <div className="absolute" style={{ top: 28, right: 40, fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
        <span style={{ color: '#10b981' }}>{'0' + etape}</span>
        <span style={{ margin: '0 6px' }}>/ 03</span>
      </div>

      <div className="relative z-10 w-full max-w-3xl px-6">
        <div className="flex flex-col items-center text-center">
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
            <AvatarParticulaire width={220} height={220} />
          </div>
          <div className="w-[48px] h-px bg-[#10b981] mb-[20px]" />
          <div className="text-[10px] uppercase tracking-[0.25em] mb-[18px]" style={{ fontFamily: 'Space Mono, monospace', color: '#10b981' }}>IDENTIFIANT</div>

          <AnimatePresence mode="wait">
            {etape === 1 && (
              <motion.div key="step1" variants={variantsStep} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
                <h1 className="text-white font-extrabold mb-[14px]" style={{ fontFamily: 'Syne, sans-serif', fontSize: 72, letterSpacing: '-0.03em', lineHeight: 1 }}>Bonjour, je suis DevJ</h1>
                <p className="text-[17px] text-white/60 max-w-lg mb-[44px]">Je vais t'accompagner pour créer une expérience personnalisée. Commence par me dire comment t'appeler.</p>

                <form onSubmit={submitIdentite} className="relative mb-8" style={{ width: 440 }}>
                  {/* wrapper corners */}
                  <div className="absolute -top-2 -left-2 w-2 h-2 border" style={{ borderColor: '#10b981' }} />
                  <div className="absolute -top-2 -right-2 w-2 h-2 border" style={{ borderColor: '#10b981' }} />
                  <div className="absolute -bottom-2 -left-2 w-2 h-2 border" style={{ borderColor: '#10b981' }} />
                  <div className="absolute -bottom-2 -right-2 w-2 h-2 border" style={{ borderColor: '#10b981' }} />

                  <div className="text-left" style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#10b981', padding: '8px 12px 4px', letterSpacing: '0.2em', borderBottom: '1px solid rgba(16,185,129,0.2)' }}>IDENTITÉ_VISITEUR</div>

                  <input
                    ref={inputRef}
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ton prénom ici..."
                    className="w-full mt-2 px-4 py-4 text-white placeholder:text-white/25 text-[20px]"
                    style={{ background: 'rgba(16,185,129,0.04)', borderLeft: '1px solid rgba(16,185,129,0.25)', borderRight: '1px solid rgba(16,185,129,0.25)', borderBottom: '1px solid rgba(16,185,129,0.25)', borderTop: 'none', fontFamily: 'Syne, sans-serif', outline: 'none', caretColor: '#10b981', color: '#fff', fontSize: 20, padding: '18px 16px' }}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitIdentite(e) }}
                  />

                  <div className="h-px mt-3" style={{ background: 'linear-gradient(90deg, transparent, #10b981, transparent)', animation: 'scanOpacity 2s linear infinite' }} />
                </form>

                <button type="button" onClick={submitIdentite} className="flex items-center gap-[10px] border border-[rgba(16,185,129,0.5)] bg-[rgba(16,185,129,0.08)] hover:bg-[rgba(16,185,129,0.15)] hover:border-[#10b981] transition duration-200 ease-[ease] rounded-none" style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, padding: '14px 40px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  <span>Continuer</span>
                  <ArrowRight size={15} color="#10b981" />
                </button>
              </motion.div>
            )}

            {etape === 2 && (
              <motion.div key="step2" variants={variantsStep} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
                <h1 className="text-white font-extrabold mb-[14px]" style={{ fontFamily: 'Syne, sans-serif', fontSize: 72, letterSpacing: '-0.03em', lineHeight: 1 }}>Quel est ton rôle ?</h1>
                <p className="text-[17px] text-white/60 max-w-lg mb-[44px]">Choisis une case qui te décrit le mieux.</p>

                <div style={{ width: 400 }} className="grid grid-cols-2 gap-[12px]">
                  {[
                    { key: 'recruteur', icon: Target, title: 'Recruteur', subtitle: "À la recherche d'un talent" },
                    { key: 'client', icon: Briefcase, title: 'Client', subtitle: "J'ai un projet en tête" },
                    { key: 'collab', icon: Users, title: 'Collaborateur', subtitle: 'Travaillons ensemble' },
                    { key: 'curieux', icon: Eye, title: 'Curieux', subtitle: 'Je découvre simplement' }
                  ].map((c) => {
                    const Icon = c.icon
                    const selected = profil === c.key
                    return (
                      <button key={c.key} onClick={() => choisirProfil(c.key)} className={`group relative overflow-hidden text-left p-[18px_16px] flex flex-col items-start gap-2 transition-[border-color,background] duration-200 rounded-none border hover:border-[rgba(16,185,129,0.45)]`} style={{ borderColor: selected ? '#10b981' : 'rgba(16,185,129,0.18)', background: selected ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.025)' }}>
                        <div className={`absolute top-0 left-0 right-0 h-px origin-left transform transition-transform duration-300 ${selected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} style={{ background: '#10b981' }} />
                        <div className="flex items-center gap-3">
                          <Icon size={20} className={selected ? 'text-[#10b981]' : 'text-[rgba(255,255,255,0.35)] group-hover:text-[#10b981]'} />
                        </div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.18em', color: selected ? '#10b981' : 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', lineHeight: 1.4 }}>{c.subtitle}</div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {etape === 3 && (
              <motion.div key="step3" variants={variantsStep} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
                <h1 className="text-white font-extrabold mb-[14px]" style={{ fontFamily: 'Syne, sans-serif', fontSize: 72, letterSpacing: '-0.03em', lineHeight: 1 }}>Active ton micro</h1>
                <p className="text-[17px] text-white/60 max-w-lg mb-[44px]">Tu peux activer le micro pour parler à DevJ, ou continuer sans micro.</p>

                <div className="flex flex-col items-center mb-10">
                  <div className="relative w-[100px] h-[100px] mb-6 flex items-center justify-center">
                    <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.3)', animation: 'pulseRing 2s ease-out infinite' }} />
                    <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.3)', animation: 'pulseRing 2s ease-out infinite', animationDelay: '0.5s' }} />
                    <div style={{ width: 64, height: 64, border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mic size={28} color="#10b981" />
                    </div>
                  </div>

                  <button onClick={activerMicro} className="flex items-center gap-[10px] border border-[rgba(16,185,129,0.5)] bg-[rgba(16,185,129,0.08)] hover:bg-[rgba(16,185,129,0.15)] hover:border-[#10b981] transition duration-200 ease-[ease] rounded-none" style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#10b981', padding: '14px 40px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    <Mic size={14} color="#10b981" />
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
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 flex items-center gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-px transition-all duration-300" style={{ width: etape === i ? 48 : 16, background: etape === i ? '#10b981' : '#1f2937' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}