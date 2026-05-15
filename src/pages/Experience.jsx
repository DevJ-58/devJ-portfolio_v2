import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserStore from '@/store/utiliserStore'
import { useDevJAI } from '@/hooks/utiliserDevJAI'
import AvatarParticulaire from '@/composants/ui/AvatarParticulaire'
import Portfolio from '@/composants/Portfolio'
import { Volume2, Layout, RotateCcw, Send } from 'lucide-react'

const AvatarStable = React.memo(function AvatarStable({ etat }) {
  return (
    <AvatarParticulaire
      width={280}
      height={280}
      etat={etat}
    />
  )
})

export default function Experience() {
  const { visiteur } = utiliserStore()
  const naviguer = useNavigate()

  const [modeVocal, setModeVocal] = useState(true)
  const [modeChat, setModeChat] = useState(false)
  const [modePortfolio, setModePortfolio] = useState(false)
  const [modeParler, setModeParler] = useState(false)
  const [ecoute, setEcoute] = useState(false) // true = micro actif
  const [dernierMessage, setDernierMessage] = useState('')
  const [bulleVisible, setBulleVisible] = useState(false)
  const [inputCmd, setInputCmd] = useState('')
  const [heure, setHeure] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [sectionActive, setSectionActive] = useState(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const portfolioRef = useRef(null)
  const [aiState, setAiState] = useState('idle')

  const { envoyerMessage, estEnChargement, messageCourant } = useDevJAI()

  useEffect(() => {
    if (!visiteur.prenom) naviguer('/')
  }, []) // eslint-disable-line

  useEffect(() => {
    function tick() {
      const n = new Date()
      const p = (v) => String(v).padStart(2, '0')
      setHeure(`${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`)
      const jours = ['DIM','LUN','MAR','MER','JEU','VEN','SAM']
      setDateStr(`${jours[n.getDay()]} ${p(n.getDate())}/${p(n.getMonth() + 1)}/${n.getFullYear()}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!messageCourant || messageCourant === dernierMessage) return

    const init = window.setTimeout(() => {
      setDernierMessage(messageCourant)
      setBulleVisible(true)
    }, 0)

    return () => window.clearTimeout(init)
  }, [messageCourant, dernierMessage])

  useEffect(() => {
    if (!dernierMessage) return
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    let actif = true
    const { definirDevJAIParle } = utiliserStore.getState()

    window.speechSynthesis.cancel()

    const nettoyerPourVoix = (texte) => {
      return texte
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/[-*•]\s/g, '')
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ', ')
        .replace(/\s{2,}/g, ' ')
        .trim()
    }

    // Découper le texte en segments naturels pour éviter les coupures
    const segmenterTexte = (texte) => {
      return texte
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.trim().length > 0)
    }

    const u = new SpeechSynthesisUtterance('') // placeholder, non utilisé directement
    void u

    function trySpeak() {
      if (!actif) return
      if (!modeVocal) {
        setTimeout(() => { if (actif) definirDevJAIParle(false) }, 0)
        return
      }

      const voix = window.speechSynthesis.getVoices()

      const priorite = [
        v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('thomas'),
        v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('nicolas'),
        v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('microsoft') && v.name.toLowerCase().includes('paul'),
        v => v.lang.startsWith('fr') && !v.name.toLowerCase().includes('amelie') && !v.name.toLowerCase().includes('marie'),
        v => v.lang.startsWith('fr'),
      ]

      let voixChoisie = null
      for (const test of priorite) {
        voixChoisie = voix.find(test)
        if (voixChoisie) break
      }

      const textePropre = nettoyerPourVoix(dernierMessage)
      const segments = segmenterTexte(textePropre)
      let idx = 0

      // Fix Chrome : keep-alive pour éviter les coupures longues
      const keepAlive = setInterval(() => {
        if (!actif) { clearInterval(keepAlive); return }
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }, 10000)

      function parlerSegment() {
        if (!actif || idx >= segments.length) {
          clearInterval(keepAlive)
          setAiState('idle')
          definirDevJAIParle(false)
          return
        }

        const seg = new SpeechSynthesisUtterance(segments[idx])
        if (voixChoisie) seg.voice = voixChoisie
        seg.lang = 'fr-FR'
        seg.pitch = 0.82
        seg.rate = 0.92
        seg.volume = 1

        seg.onend = () => {
          if (!actif) return
          idx++
          setTimeout(parlerSegment, 120)
        }

        seg.onerror = () => {
          if (!actif) return
          idx++
          setTimeout(parlerSegment, 120)
        }

        window.speechSynthesis.speak(seg)
      }

      setAiState('speaking')
      parlerSegment()
    }

    if (window.speechSynthesis.getVoices().length > 0) {
      trySpeak()
    } else {
      window.speechSynthesis.onvoiceschanged = trySpeak
    }

    return () => {
      actif = false
      // Ne PAS cancel ici — laisser la parole finir
    }
  }, [dernierMessage, modeVocal])

  useEffect(() => {
    if (aiState === 'speaking' && recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
      setEcoute(false)
    }
    if (aiState === 'idle' && modeParler && recognitionRef.current) {
      setTimeout(() => {
        try { recognitionRef.current?.start() } catch { /* ignore */ }
      }, 600)
    }
    // PAS de return cleanup ici — ne jamais détruire recognitionRef dans ce useEffect
  }, [aiState, modeParler])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, []) // [] = seulement au démontage du composant

  const soumettre = useCallback(() => {
    if (!inputCmd.trim()) return
    setAiState('thinking')
    envoyerMessage(inputCmd.trim())
    setInputCmd('')
  }, [inputCmd, envoyerMessage, setInputCmd])

  const envoyerCommande = (cmd) => {
    setAiState('thinking')
    envoyerMessage(cmd)
  }

  const naviguerPortfolio = useCallback((section) => {
    if (!portfolioRef.current) return
    portfolioRef.current.naviguerVers(section)
    setSectionActive(section)
    setTimeout(() => setSectionActive(null), 3000)
  }, [])

  useEffect(() => {
    if (!modePortfolio) return
    naviguerPortfolio('hero')
  }, [modePortfolio, naviguerPortfolio])

  const toggleParler = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Votre navigateur ne supporte pas la reconnaissance vocale.')
      return
    }

    if (modeParler) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      setModeParler(false)
      setEcoute(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'fr-FR'
    rec.continuous = false
    rec.interimResults = false

    rec.onstart = () => setEcoute(true)

    rec.onresult = (event) => {
      const texte = event.results[0][0].transcript.trim()
      if (texte) {
        setAiState('thinking')
        envoyerMessage(texte)
      }
    }

    rec.onend = () => {
      setEcoute(false)
      if (recognitionRef.current) {
        setTimeout(() => {
          try { recognitionRef.current?.start() } catch {
            /* ignore */
          }
        }, 800)
      }
    }

    rec.onerror = (e) => {
      if (e.error !== 'no-speech') {
        setEcoute(false)
      }
    }

    recognitionRef.current = rec
    rec.start()
    setModeParler(true)
  }, [modeParler, envoyerMessage])

  return (
    <div style={{ backgroundColor: '#050505', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>

      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div style={{ position: 'absolute', left: 0, right: 0, height: 1, zIndex: 1, top: 0, background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.12), transparent)', animation: 'scanAnim 6s linear infinite' }} />

      <div style={{ position: 'absolute', top: 10, left: 10, width: 18, height: 18, borderTop: '1px solid #10b981', borderLeft: '1px solid #10b981', zIndex: 5 }} />
      <div style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderTop: '1px solid #10b981', borderRight: '1px solid #10b981', zIndex: 5 }} />
      <div style={{ position: 'absolute', bottom: 10, left: 10, width: 18, height: 18, borderBottom: '1px solid #10b981', borderLeft: '1px solid #10b981', zIndex: 5 }} />
      <div style={{ position: 'absolute', bottom: 10, right: 10, width: 18, height: 18, borderBottom: '1px solid #10b981', borderRight: '1px solid #10b981', zIndex: 5 }} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, background: 'rgba(0,0,0,0.75)', borderBottom: '1px solid rgba(16,185,129,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Mono, monospace', color: 'rgba(255,255,255,0.25)' }}>
            <span>&lt;</span>
            <span style={{ color: '#10b981' }}>/DevJ</span>
            <span>&gt;</span>
            <div style={{ width: 1, height: 20, background: '#2d2d2d' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.25em' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 9999, background: '#10b981', animation: 'pulse 1.4s infinite' }} />
              <span>EN LIGNE</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setModeVocal((prev) => !prev)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid', borderColor: modeVocal ? '#10b981' : 'rgba(16,185,129,0.25)', background: modeVocal ? 'rgba(16,185,129,0.15)' : 'transparent', color: modeVocal ? '#ffffff' : '#10b981', padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: 0, transition: 'all .2s' }}>
              <Volume2 size={12} />
              <span>AUDIO</span>
            </button>
            {/* Mode PARLER */}
            <div
              className={`mode-item ${modeParler ? 'actif' : ''}`}
              onClick={toggleParler}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid', borderColor: modeParler ? '#10b981' : 'rgba(16,185,129,0.25)', background: modeParler ? 'rgba(16,185,129,0.15)' : 'transparent', color: modeParler ? '#ffffff' : '#10b981', padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: 0, transition: 'all .2s' }}
            >
              <span className="mode-label">
                {ecoute ? '⬤ ÉCOUTE' : 'PARLER'}
              </span>
              <span className={`mode-toggle ${modeParler ? 'on' : 'off'}`}>
                {modeParler ? 'ON' : 'OFF'}
              </span>
            </div>
            <button onClick={() => setModeChat((prev) => !prev)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid', borderColor: modeChat ? '#10b981' : 'rgba(16,185,129,0.25)', background: modeChat ? 'rgba(16,185,129,0.15)' : 'transparent', color: modeChat ? '#ffffff' : '#10b981', padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: 0, transition: 'all .2s' }}>
              <span>TEXTE</span>
            </button>
            <div style={{ width: 1, height: 20, background: '#2d2d2d' }} />
            <button onClick={() => setModePortfolio(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)', color: '#10b981', padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: 0, transition: 'all .2s' }}>
              <Layout size={12} />
              <span>PORTFOLIO</span>
            </button>
            <button onClick={() => naviguer('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: 0, transition: 'all .2s' }}>
              <RotateCcw size={12} />
              <span>RESET</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '0 20px 8px' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, color: '#10b981', letterSpacing: '0.1em' }}>{heure}</div>
          <div style={{ width: 1, height: 18, background: '#2d2d2d' }} />
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{dateStr}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: '50%', top: 90, bottom: 90, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <AvatarStable etat={aiState} />

        <div style={{ marginTop: 16, fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(16,185,129,0.5)', letterSpacing: '0.22em', textAlign: 'center' }}>
          <div>// FRÉJUS KOUADIO</div>
          <div>DEV FULLSTACK · IA</div>
        </div>

        <div style={{ marginTop: 10, fontFamily: 'Space Mono, monospace', fontSize: 9, color: aiState === 'idle' ? 'rgba(16,185,129,0.4)' : '#10b981', textAlign: 'center' }}>
          <span>
            {aiState === 'idle' ? '// EN ATTENTE' : 
             aiState === 'thinking' ? '// TRAITEMENT...' : 
             '// EN TRAIN DE PARLER'}
          </span>
        </div>
      </div>

      {bulleVisible && (modeChat || !modeVocal) && (
        <div style={{ position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)', width: 380, zIndex: 25, opacity: bulleVisible ? 1 : 0, transition: 'opacity 0.4s' }}>
          <div style={{ borderLeft: '2px solid #10b981', background: 'rgba(16,185,129,0.04)', padding: '14px 18px', fontFamily: 'Syne, sans-serif', color: '#fff' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#10b981', letterSpacing: '0.2em', marginBottom: 8 }}>devJAI //</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{dernierMessage}</div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: 16, top: 90, zIndex: 10, width: 150, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ border: '1px solid rgba(16,185,129,0.12)', background: 'rgba(16,185,129,0.02)', padding: 10 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: 'rgba(16,185,129,0.5)', letterSpacing: '0.2em', marginBottom: 6 }}>VISITEUR</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#10b981' }}>{visiteur.prenom || '—'}</div>
        </div>
        <div style={{ border: '1px solid rgba(16,185,129,0.12)', background: 'rgba(16,185,129,0.02)', padding: 10 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: 'rgba(16,185,129,0.5)', letterSpacing: '0.2em', marginBottom: 6 }}>PROFIL</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#10b981' }}>{(() => {
            const map = {
              recruiter: 'RECRUTEUR',
              client: 'CLIENT',
              collaborateur: 'COLLABORATEUR',
              curieux: 'CURIEUX'
            }
            return map[visiteur.profession] || visiteur.profession?.toUpperCase() || '—'
          })()}</div>
        </div>
        <div style={{ border: '1px solid rgba(16,185,129,0.12)', background: 'rgba(16,185,129,0.02)', padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#10b981', animation: 'pulse 1.4s infinite' }} />
          <div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: 'rgba(16,185,129,0.5)', letterSpacing: '0.2em' }}>STATUT</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#10b981' }}>● CONNECTÉ</div>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 6 }}>COMMANDES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['> voir le portfolio', '> mes projets', '> me contacter', '> mon parcours'].map((cmd) => (
              <div key={cmd} onClick={() => envoyerCommande(cmd)} style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(16,185,129,0.45)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(16,185,129,0.45)'}>
                {cmd}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', right: 16, top: 90, zIndex: 10, width: 150, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: 'rgba(255,255,255,0.2)', marginBottom: 4 }}>MODES ACTIFS</div>
        <button onClick={() => setModeVocal((prev) => !prev)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: modeVocal ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.12)', background: modeVocal ? 'rgba(16,185,129,0.08)' : 'transparent', color: modeVocal ? '#10b981' : 'rgba(16,185,129,0.35)', padding: '6px 8px', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', borderRadius: 0 }}>
          <span>VOCAL</span>
          <span style={{ width: 20, height: 10, border: '1px solid #10b981', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 1, left: modeVocal ? 10 : 2, width: 6, height: 6, background: modeVocal ? '#10b981' : 'rgba(16,185,129,0.3)', transition: 'left 0.2s' }} />
          </span>
        </button>
        <button onClick={() => setModeChat((prev) => !prev)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: modeChat ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.12)', background: modeChat ? 'rgba(16,185,129,0.08)' : 'transparent', color: modeChat ? '#10b981' : 'rgba(16,185,129,0.35)', padding: '6px 8px', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', borderRadius: 0 }}>
          <span>CHAT</span>
          <span style={{ width: 20, height: 10, border: '1px solid #10b981', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 1, left: modeChat ? 10 : 2, width: 6, height: 6, background: modeChat ? '#10b981' : 'rgba(16,185,129,0.3)', transition: 'left 0.2s' }} />
          </span>
        </button>
        <button onClick={() => setModePortfolio(true)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'rgba(16,185,129,0.12)', background: 'transparent', color: 'rgba(16,185,129,0.35)', padding: '6px 8px', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', borderRadius: 0 }}>
          <span>PORTFOLIO</span>
          <span style={{ width: 20, height: 10, border: '1px solid #10b981', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 1, left: 2, width: 6, height: 6, background: 'rgba(16,185,129,0.3)' }} />
          </span>
        </button>
      </div>

      {modePortfolio && (
        <div style={{ position:'absolute', inset:0, zIndex:50 }}>
          <Portfolio ref={portfolioRef} onClose={() => setModePortfolio(false)} />

          {/* Avatar flottant */}
          <div style={{
            position:'fixed', bottom:30, right:24, zIndex:52,
            display:'flex', flexDirection:'column', alignItems:'center', gap:8,
            pointerEvents:'none'
          }}>
            {bulleVisible && dernierMessage && (
              <div style={{
                maxWidth:260, background:'rgba(0,0,0,0.92)',
                border:'1px solid rgba(16,185,129,0.4)',
                borderLeft:'3px solid #10b981',
                padding:'10px 14px'
              }}>
                <div style={{ fontSize:8, color:'#10b981', letterSpacing:'0.2em', marginBottom:6 }}>devJAI //</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.85)', lineHeight:1.6, fontFamily:'Space Mono, monospace' }}>
                  {dernierMessage.slice(0,120)}{dernierMessage.length > 120 ? '...' : ''}
                </div>
                {sectionActive && (
                  <div style={{ marginTop:8, fontSize:8, color:'#10b981', letterSpacing:'0.15em', borderTop:'1px solid rgba(16,185,129,0.2)', paddingTop:6 }}>
                    ↓ NAVIGATION → {sectionActive.toUpperCase()}
                  </div>
                )}
              </div>
            )}
            <div style={{ background:'rgba(0,0,0,0.8)', border:'1px solid rgba(16,185,129,0.3)', padding:8 }}>
              <AvatarStable etat={aiState} />
              <div style={{ fontFamily:'Space Mono, monospace', fontSize:8, color: aiState==='idle' ? 'rgba(16,185,129,0.4)' : '#10b981', textAlign:'center', marginTop:4 }}>
                {aiState==='idle' ? '// EN ATTENTE' : aiState==='thinking' ? '// TRAITEMENT...' : '// EN TRAIN DE PARLER'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', width: 480, zIndex: 20 }}>
        <div style={{
          fontFamily: 'Space Mono, monospace', fontSize: 8,
          color: 'rgba(16,185,129,0.35)', letterSpacing: '0.2em',
          marginBottom: 4, textAlign: 'center'
        }}>
          ENTRÉE_DIRECTE // {estEnChargement ? 'TRAITEMENT...' : 'EN_ATTENTE...'}
        </div>

        <div style={{
          display: modeParler ? 'none' : 'flex', alignItems: 'center',
          border: '1px solid rgba(16,185,129,0.25)',
          background: 'rgba(0,0,0,0.7)'
        }}>
          <input
            ref={inputRef}
            value={inputCmd}
            onChange={(e) => setInputCmd(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); soumettre() } }}
            placeholder="Entrez votre commande..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', padding: '10px 14px',
              fontFamily: 'Space Mono, monospace', fontSize: 11,
              color: '#fff', caretColor: '#10b981'
            }}
          />
          <button onClick={soumettre} style={{
            padding: '10px 16px',
            border: 'none',
            borderLeft: '1px solid rgba(16,185,129,0.2)',
            background: 'rgba(16,185,129,0.06)',
            color: '#10b981', cursor: 'pointer'
          }}>
            <Send size={13} color="#10b981" />
          </button>
        </div>
        {modeParler && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(16,185,129,0.7)',
            fontSize: '11px',
            letterSpacing: '2px',
            padding: '12px'
          }}>
            {ecoute
              ? '// ÉCOUTE EN COURS — PARLEZ MAINTENANT'
              : '// EN ATTENTE — MICROPHONE PRÊT'
            }
          </div>
        )}
      </div>
    </div>
  )
}
