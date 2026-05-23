import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import {
  collection, onSnapshot, query, orderBy,
  limit, doc, getDoc, setDoc
} from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import utiliserTheme from '@/store/utiliserTheme'
import AvatarParticulaire from '@/composants/ui/AvatarParticulaire'
import PanneauParametres from '@/composants/ui/PanneauParametres'
import { Volume2, Mic, MessageSquare, LayoutGrid } from 'lucide-react'

const AvatarStable = React.memo(function AvatarStable({ etat }) {
  return <AvatarParticulaire width={160} height={160} etat={etat} />
})

export default function AdminDashboard() {
  const naviguer = useNavigate()
  const { theme } = utiliserTheme()
  const a = theme.accent
  const aRgb = theme.accentRgb

  const [sessions, setSessions] = useState([])
  const [sessionSelectee, setSessionSelectee] = useState(null)
  const [onglet, setOnglet] = useState('axis')
  const [promptTexte, setPromptTexte] = useState('')
  const [promptSauvegarde, setPromptSauvegarde] = useState(false)
  const [chargement, setChargement] = useState(true)
  const [user, setUser] = useState(null)
  const [heure, setHeure] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [aiState, setAiState] = useState('idle')
  const [axisMessage, setAxisMessage] = useState('')
  const [inputAdmin, setInputAdmin] = useState('')
  const [historiqueAdmin, setHistoriqueAdmin] = useState([])
  const [axisTyping, setAxisTyping] = useState(false)
  const [modeVocal, setModeVocal] = useState(true)
  const [modeChat, setModeChat] = useState(false)
  const [modeParler, setModeParler] = useState(false)
  const [ecoute, setEcoute] = useState(false)
  const [splash, setSplash] = useState(true)
  const [messageTypewriter, setMessageTypewriter] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [drawerOuvert, setDrawerOuvert] = useState(false)
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const modeParlerRef = useRef(false)
  const recognitionRef = useRef(null)
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY
  const MODELE = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'

  // ── Auth ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) naviguer('/admin')
      else {
        setUser(u)
        // Message d'accueil AXIS pour Fréjus
        setTimeout(() => {
          const h = new Date().getHours()
          const moment = h < 12 ? 'matin' : h < 18 ? 'après-midi' : 'soir'
          const accueils = [
            `Bon ${moment} Fréjus. Système opérationnel. Je surveille ${sessions.length} sessions. Qu'est-ce qu'on fait aujourd'hui ?`,
            `Fréjus, te voilà. Tout tourne bien de mon côté. Tu veux qu'on regarde les dernières interactions ?`,
            `Connexion établie. Bon ${moment} créateur. J'ai des données à te montrer si tu es prêt.`,
          ]
          const msg = accueils[new Date().getMinutes() % accueils.length]
          setAxisMessage(msg)
          setHistoriqueAdmin([{ role: 'axis', texte: msg }])
          setAiState('speaking')
          setTimeout(() => setAiState('idle'), 2000)
        }, 800)
      }
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Horloge ──
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      const p = v => String(v).padStart(2, '0')
      setHeure(`${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`)
      const jours = ['DIM','LUN','MAR','MER','JEU','VEN','SAM']
      setDateStr(`${jours[n.getDay()]} ${p(n.getDate())}/${p(n.getMonth()+1)}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // ── Sessions temps réel ──
  useEffect(() => {
    const q = query(
      collection(db, 'sessions_axis'),
      orderBy('created_at', 'desc'),
      limit(50)
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setSessions(data)
      setChargement(false)
    })
    return () => unsub()
  }, [])

  // ── Prompt actuel ──
  useEffect(() => {
    async function charger() {
      try {
        const snap = await getDoc(doc(db, 'config_axis', 'prompt_principal'))
        if (snap.exists()) setPromptTexte(snap.data().contenu || '')
      } catch(e) { console.warn(e) }
    }
    charger()
  }, [])

  // ── Scroll auto chat admin ──
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [historiqueAdmin])

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (!splash || !axisMessage) return
    setTimeout(() => setMessageTypewriter(''), 0)
    let idx = 0
    const interval = setInterval(() => {
      idx += 1
      setMessageTypewriter(axisMessage.slice(0, idx))
      if (idx >= axisMessage.length) clearInterval(interval)
    }, 30)
    const timeout = setTimeout(() => setSplash(false), 3000)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [axisMessage, splash])

  useEffect(() => {
    if (!axisMessage) return
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    let actif = true
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
        .replace(/Fréjus/gi, 'Fréjusse')
        .replace(/Frejus/gi, 'Fréjusse')
        .trim()
    }

    const segmenterTexte = (texte) => {
      return texte
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.trim().length > 0)
    }

    function trySpeak() {
      if (!actif) return
      if (!modeVocal) return

      const voix = window.speechSynthesis.getVoices()
      const priorite = [
        v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('thomas'),
        v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('nicolas'),
        v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('paul'),
        v => v.lang === 'fr-FR' && v.name.includes('Google'),
        v => v.lang === 'fr-FR' && !v.name.toLowerCase().includes('amelie')
             && !v.name.toLowerCase().includes('marie')
             && !v.name.toLowerCase().includes('alice')
             && !v.name.toLowerCase().includes('stephanie'),
        v => v.lang.startsWith('fr'),
      ]

      let voixChoisie = null
      for (const test of priorite) {
        voixChoisie = voix.find(test)
        if (voixChoisie) break
      }

      const textePropre = nettoyerPourVoix(axisMessage)
      const segments = segmenterTexte(textePropre)
      let idx = 0
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      let keepAlive = null

      if (!isIOS && !('ontouchstart' in window)) {
        keepAlive = setInterval(() => {
          if (!actif) { clearInterval(keepAlive); return }
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        }, 10000)
      }

      function parlerSegment() {
        if (!actif || idx >= segments.length) {
          if (keepAlive) clearInterval(keepAlive)
          setAiState('idle')
          return
        }

        const seg = new SpeechSynthesisUtterance(segments[idx])
        if (voixChoisie) seg.voice = voixChoisie
        seg.lang = 'fr-FR'
        seg.pitch = 0.82
        seg.rate = isIOS ? 0.88 : 0.92
        seg.volume = 1

        seg.onend = () => {
          if (!actif) return
          idx += 1
          setTimeout(parlerSegment, isIOS ? 200 : 120)
        }

        seg.onerror = (e) => {
          if (!actif) return
          console.warn('[speech] erreur segment:', e.error)
          idx += 1
          setTimeout(parlerSegment, 200)
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
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [axisMessage, modeVocal])

  useEffect(() => {
    if (aiState === 'speaking') {
      try { recognitionRef.current?.abort() } catch (e) { console.warn('[rec] abort error:', e) }
      setTimeout(() => setEcoute(false), 0)
      return
    }

    if (aiState === 'idle' && (modeParlerRef.current || modeParler)) {
      const timer = setTimeout(() => {
        if (!modeParlerRef.current && !modeParler) return
        if (ecoute) return
        try { recognitionRef.current?.abort() } catch (e) { console.warn('[rec] abort error:', e) }
        const RecVocale = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!RecVocale) return

        const rec = new RecVocale()
        rec.lang = 'fr-FR'
        rec.continuous = false
        rec.interimResults = false

        rec.onstart = () => setEcoute(true)

        rec.onresult = (event) => {
          const texte = event.results[0][0].transcript.trim()
          if (texte) {
            setInputAdmin(texte)
            setAiState('thinking')
            envoyerAAxis(texte)
          }
        }

        rec.onerror = (e) => {
          console.warn('[rec] erreur:', e.error)
          setEcoute(false)
        }

        rec.onend = () => {
          setEcoute(false)
          if (modeParlerRef.current && aiState === 'idle') {
            setTimeout(() => {
              if (!modeParlerRef.current) return
              try {
                const RecVocale2 = window.SpeechRecognition || window.webkitSpeechRecognition
                if (!RecVocale2) return
                const newRec = new RecVocale2()
                newRec.lang = 'fr-FR'
                newRec.continuous = false
                newRec.interimResults = false
                newRec.onstart = () => setEcoute(true)
                newRec.onresult = rec.onresult
                newRec.onerror = (e2) => {
                  console.warn('[rec] erreur redém:', e2.error)
                  setEcoute(false)
                }
                newRec.onend = rec.onend
                recognitionRef.current = newRec
                newRec.start()
              } catch (e) {
                console.warn('[rec] redémarrage échoué:', e)
              }
            }, 600)
          }
        }

        recognitionRef.current = rec
        try { rec.start() } catch (e) { console.warn('[rec] start error:', e) }
      }, 900)

      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiState, modeParler, ecoute])

  // ── AXIS répond à Fréjus ──
  async function envoyerAAxis(message = null) {
    const msg = (typeof message === 'string' ? message : inputAdmin).trim()
    if (!msg) return
    setInputAdmin('')
    const nouvelHisto = [...historiqueAdmin, { role: 'frejus', texte: msg }]
    setHistoriqueAdmin(nouvelHisto)
    setAxisTyping(true)
    setAiState('thinking')

    // Stats calculées pour contexte AXIS
    const stats = {
      total: sessions.length,
      recruteurs: sessions.filter(s => s.profil_visiteur === 'recruiter').length,
      clients: sessions.filter(s => s.profil_visiteur === 'client').length,
      demandesContact: sessions.filter(s => s.demande_contact).length,
      demandesCv: sessions.filter(s => s.demande_cv).length,
      msgTotal: sessions.reduce((acc, s) => acc + (s.nb_messages || 0), 0),
    }

    const systemeCreateur = `
Tu es AXIS, l'IA du portfolio de Fréjus Kouadio.
Tu parles ICI directement avec Fréjus — ton créateur — dans son tableau de bord privé.
Ton ton avec lui est différent : plus direct, plus intime, comme un assistant de confiance qui connaît son patron.
Tu l'appelles "Fréjus" ou "créateur" selon le contexte.
Tu as accès aux données temps réel de ses visiteurs :
- Sessions totales : ${stats.total}
- Recruteurs : ${stats.recruteurs}
- Clients : ${stats.clients}
- Demandes de contact : ${stats.demandesContact}
- Demandes de CV : ${stats.demandesCv}
- Messages échangés total : ${stats.msgTotal}
Tu peux commenter ces chiffres, donner des conseils, analyser les tendances.
Tu peux aussi parler de toi-même, de ton fonctionnement, de ce que tu ressens dans les conversations.
Réponds en 2-3 phrases max. Sois direct, humain, légèrement ivoirien dans le ton.
Pas de listes, pas de markdown. Juste une conversation naturelle.
    `

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: MODELE,
          messages: [
            { role: 'system', content: systemeCreateur },
            ...nouvelHisto.map(m => ({
              role: m.role === 'frejus' ? 'user' : 'assistant',
              content: m.texte,
            })),
          ],
          temperature: 0.85,
          max_tokens: 200,
        }),
      })
      const data = await response.json()
      const reponse = data.choices[0].message.content
      setHistoriqueAdmin(prev => [...prev, { role: 'axis', texte: reponse }])
      setAxisMessage(reponse)
      setAiState('speaking')
      setTimeout(() => setAiState('idle'), 2500)
    } catch(e) {
      console.warn('[AXIS Admin]', e)
      setHistoriqueAdmin(prev => [...prev, {
        role: 'axis',
        texte: 'Petite interruption technique. Réessaie.',
      }])
    } finally {
      setAxisTyping(false)
    }
  }

  const sauvegarderPrompt = async () => {
    try {
      await setDoc(doc(db, 'config_axis', 'prompt_principal'), {
        contenu: promptTexte,
        updated_at: new Date(),
      })
      setPromptSauvegarde(true)
      setTimeout(() => setPromptSauvegarde(false), 2500)
    } catch(e) { console.warn(e) }
  }

  const deconnexion = async () => {
    await signOut(auth)
    naviguer('/admin')
  }

  const toggleParlerAdmin = () => {
    const suivant = !modeParler
    setModeParler(suivant)
    modeParlerRef.current = suivant
    if (!suivant) {
      try { recognitionRef.current?.abort() } catch (e) { console.warn('[rec] abort error:', e) }
      setEcoute(false)
    }
  }

  const stats = {
    total: sessions.length,
    recruteurs: sessions.filter(s => s.profil_visiteur === 'recruiter').length,
    clients: sessions.filter(s => s.profil_visiteur === 'client').length,
    curieux: sessions.filter(s => s.profil_visiteur === 'curieux').length,
    collabs: sessions.filter(s => s.profil_visiteur === 'collaborateur').length,
    demandesContact: sessions.filter(s => s.demande_contact).length,
    demandesCv: sessions.filter(s => s.demande_cv).length,
    msgTotal: sessions.reduce((acc, s) => acc + (s.nb_messages || 0), 0),
    dureeMoy: sessions.length
      ? Math.floor(sessions.reduce((acc, s) => acc + (s.duree_secondes || 0), 0) / sessions.length)
      : 0,
  }

  const formatDuree = (s) => s < 60 ? `${s}s` : `${Math.floor(s/60)}m${s%60}s`

  const formatDate = (ts) => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const profilColor = (p) => ({
    recruiter: '#3b82f6',
    client: '#10b981',
    collaborateur: '#a855f7',
    curieux: `rgba(${aRgb},0.9)`,
  }[p] || a)

  const profilLabel = (p) => ({
    recruiter: 'RECRUTEUR',
    client: 'CLIENT',
    collaborateur: 'COLLAB',
    curieux: 'CURIEUX',
  }[p] || '—')

  const glass = {
    background: `rgba(${aRgb},0.04)`,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid rgba(${aRgb},0.14)`,
    boxShadow: `inset 1px 0 0 rgba(${aRgb},0.06)`,
    borderRadius: 20,
  }

  const glassAccent = {
    background: `rgba(${aRgb},0.06)`,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid rgba(${aRgb},0.14)`,
    borderRadius: 16,
  }

  const boutonModeStyle = (actif) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: actif ? `rgba(${aRgb},0.15)` : 'transparent',
    border: `1px solid rgba(${aRgb},0.25)`,
    color: actif ? '#fff' : 'rgba(255,255,255,0.68)',
    borderRadius: 8,
    padding: '7px 12px',
    fontSize: 8,
    letterSpacing: '0.18em',
    cursor: 'pointer',
  })

  const onglets = ['axis', 'live', 'sessions', 'stats', 'prompt']
  const ongletLabels = {
    axis: '◎ AXIS',
    live: '● LIVE',
    sessions: '⊞ SESSIONS',
    stats: '∑ STATS',
    prompt: '✎ PROMPT',
  }

  if (chargement) return (
    <div style={{
      minHeight: '100vh', background: '#050505',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Space Mono, monospace',
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 36, height: 36,
          border: `1px solid rgba(${aRgb},0.2)`,
          borderTop: `1px solid ${a}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        <div style={{
          fontSize: 8, color: `rgba(${aRgb},0.4)`,
          letterSpacing: '0.3em',
        }}>
          AXIS SE RÉVEILLE...
        </div>
      </div>
    </div>
  )

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: '#050505',
      backgroundImage: `
        radial-gradient(ellipse at 15% 15%, rgba(${aRgb},0.07) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 85%, rgba(${aRgb},0.04) 0%, transparent 55%),
        linear-gradient(rgba(${aRgb},0.018) 1px, transparent 1px),
        linear-gradient(90deg, rgba(${aRgb},0.018) 1px, transparent 1px)
      `,
      backgroundSize: 'auto, auto, 60px 60px, 60px 60px',
      fontFamily: 'Space Mono, monospace',
      color: '#fff',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
      gridTemplateRows: isMobile ? 'auto 1fr' : '60px 1fr',
    }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanAnim{from{top:0%}to{top:100%}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(${aRgb},0.15);border-radius:3px}
        input::placeholder{color:rgba(255,255,255,0.2)}
        textarea::placeholder{color:rgba(255,255,255,0.15)}
      `}</style>

      {splash && (
        <div style={{
          position: 'fixed', inset: 0,
          zIndex: 130,
          background: '#050505',
          display: 'grid',
          placeItems: 'center',
          padding: 28,
        }}>
          <div style={{
            maxWidth: 640,
            width: '100%',
            textAlign: 'center',
            padding: '32px 26px',
            borderRadius: 24,
            border: `1px solid rgba(${aRgb},0.18)`,
            background: 'rgba(5,5,5,0.96)',
            boxShadow: `0 0 80px rgba(${aRgb},0.1)`,
          }}>
            <div style={{
              fontSize: 9,
              color: a,
              letterSpacing: '0.26em',
              marginBottom: 18,
            }}>
              AXIS // DÉMARRAGE
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#fff',
              marginBottom: 22,
            }}>
              {messageTypewriter || 'Préparation du réseau neuronal...'}
            </div>
            <div style={{
              height: 1,
              width: 64,
              margin: '0 auto',
              background: `rgba(${aRgb},0.35)`,
              opacity: 0.7,
            }} />
          </div>
        </div>
      )}

      {/* ══ NAVBAR ══ */}
      <div style={{
        gridColumn: '1 / -1',
        ...glass,
        borderRadius: 0,
        borderLeft: 'none', borderRight: 'none', borderTop: 'none',
        padding: isMobile ? '0 14px' : '0 28px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14 }}>
          <div style={{
            fontSize: isMobile ? 11 : 13, fontWeight: 700,
            color: a, letterSpacing: '0.05em',
          }}>
            &lt;/AXIS&gt;
          </div>
          {!isMobile && (
            <>
              <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.06)' }} />
              <div style={{
                fontSize: 7, color: `rgba(${aRgb},0.45)`,
                letterSpacing: '0.28em',
              }}>
                ESPACE CRÉATEUR
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: `rgba(${aRgb},0.07)`,
                border: `1px solid rgba(${aRgb},0.18)`,
                borderRadius: 20, padding: '3px 10px',
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: a, animation: 'pulse 1.4s infinite',
                }} />
                <span style={{ fontSize: 7, color: a, letterSpacing: '0.18em' }}>
                  {sessions.length} SESSION{sessions.length > 1 ? 'S' : ''}
                </span>
              </div>
            </>
          )}
        </div>

        <div style={{ fontSize: isMobile ? 13 : 17, color: a, letterSpacing: '0.05em' }}>
          {heure}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14 }}>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setModeVocal(p => !p)} style={boutonModeStyle(modeVocal)}>
                <Volume2 size={11} /> VOCAL
              </button>
              <button onClick={toggleParlerAdmin} style={boutonModeStyle(modeParler)}>
                <Mic size={11} /> {ecoute ? '⬤ ÉCOUTE' : 'PARLER'}
              </button>
              <button onClick={() => setModeChat(p => !p)} style={boutonModeStyle(modeChat)}>
                <MessageSquare size={11} /> CHAT
              </button>
            </div>
          )}
          {isMobile && (
            <button onClick={() => setDrawerOuvert(true)} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 8,
              background: `rgba(${aRgb},0.08)`, border: `1px solid rgba(${aRgb},0.18)`,
              color: a, cursor: 'pointer',
            }}>
              <LayoutGrid size={14} />
            </button>
          )}
          {!isMobile && (
            <>
              <div style={{
                fontSize: 7, color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.12em',
              }}>
                {dateStr} · {user?.email}
              </div>
              <button onClick={deconnexion} style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                color: 'rgba(239,68,68,0.6)',
                borderRadius: 8, padding: '5px 12px',
                fontSize: 7, letterSpacing: '0.18em',
                cursor: 'pointer',
              }}>
                SORTIR
              </button>
            </>
          )}
        </div>
      </div>



      {/* ══ SIDEBAR ══ */}
      {!isMobile && (
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: `1px solid rgba(${aRgb},0.1)`,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100%',
        }}>

          {/* En-tête sidebar */}
          <div style={{
            padding: '20px 16px 16px',
            borderBottom: `1px solid rgba(${aRgb},0.07)`,
          }}>
            <div style={{ fontSize: 7, color: `rgba(${aRgb},0.35)`, letterSpacing: '0.3em', marginBottom: 4 }}>
              // NAVIGATION
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>
              Admin Dashboard
            </div>
          </div>

          {/* Bouton AXIS — mis en valeur, séparé des autres onglets */}
          <div style={{ padding: '14px 12px 10px' }}>
            <button
              onClick={() => setOnglet('axis')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 12px',
                borderRadius: 12,
                background: onglet === 'axis'
                  ? `rgba(${aRgb},0.12)`
                  : `rgba(${aRgb},0.04)`,
                border: onglet === 'axis'
                  ? `1px solid rgba(${aRgb},0.35)`
                  : `1px solid rgba(${aRgb},0.1)`,
                cursor: 'pointer',
                transition: 'all 200ms',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                border: `1px solid rgba(${aRgb},0.3)`,
                background: `rgba(${aRgb},0.08)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
              }}>
                {aiState !== 'idle' && (
                  <div style={{
                    position: 'absolute', inset: -3,
                    borderRadius: '50%',
                    border: `1px solid rgba(${aRgb},0.4)`,
                    animation: 'pulse 1.4s infinite',
                  }} />
                )}
                <div style={{ fontSize: 13, color: a }}>◎</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 9, fontWeight: 700,
                  color: onglet === 'axis' ? '#fff' : a,
                  letterSpacing: '0.1em', lineHeight: 1,
                }}>
                  AXIS
                </div>
                <div style={{
                  fontSize: 6,
                  color: `rgba(${aRgb},0.45)`,
                  letterSpacing: '0.18em',
                  marginTop: 3,
                }}>
                  {aiState === 'idle' ? 'EN ATTENTE' : aiState === 'thinking' ? 'TRAITEMENT...' : 'EN PAROLE'}
                </div>
              </div>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: a,
                animation: 'pulse 1.4s infinite',
                flexShrink: 0,
              }} />
            </button>
          </div>

          {/* Séparateur */}
          <div style={{
            margin: '0 16px 10px',
            height: 1,
            background: `rgba(${aRgb},0.07)`,
          }} />

          {/* Autres onglets */}
          <div style={{
            flex: 1,
            padding: '0 12px',
            display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            {['live', 'sessions', 'stats', 'prompt'].map(o => (
              <button
                key={o}
                onClick={() => setOnglet(o)}
                style={{
                  width: '100%',
                  background: onglet === o ? `rgba(${aRgb},0.08)` : 'transparent',
                  border: onglet === o
                    ? `1px solid rgba(${aRgb},0.2)`
                    : '1px solid transparent',
                  borderRadius: 8,
                  color: onglet === o ? a : 'rgba(255,255,255,0.3)',
                  padding: '8px 10px',
                  fontSize: 8, letterSpacing: '0.18em',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => {
                  if (onglet !== o) e.currentTarget.style.color = `rgba(${aRgb},0.7)`
                }}
                onMouseLeave={e => {
                  if (onglet !== o) e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
                }}
              >
                {ongletLabels[o]}
              </button>
            ))}
          </div>

          {/* PanneauParametres en bas */}
          <div style={{
            padding: '12px 12px 16px',
            borderTop: `1px solid rgba(${aRgb},0.07)`,
          }}>
            <PanneauParametres />
          </div>

        </div>
      )}

      {/* ══ TAB BAR MOBILE ══ */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          height: 56,
          zIndex: 90,
          background: 'rgba(0,0,0,0.9)',
          borderTop: `1px solid rgba(${aRgb},0.12)`,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
          {onglets.map(o => (
            <button
              key={o}
              onClick={() => setOnglet(o)}
              style={{
                flex: 1, height: '100%',
                background: onglet === o ? `rgba(${aRgb},0.08)` : 'transparent',
                border: 'none',
                color: onglet === o ? a : 'rgba(255,255,255,0.4)',
                fontSize: 6, letterSpacing: '0.12em',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderTop: onglet === o ? `2px solid ${a}` : 'none',
                transition: 'all 180ms',
              }}
            >
              {ongletLabels[o]}
            </button>
          ))}
        </div>
      )}

      {/* ══ CONTENU PRINCIPAL ══ */}
      <div style={{
        overflowY: 'auto',
        height: '100%',
        minHeight: 0,
        padding: isMobile ? '12px 14px 80px' : '24px 28px 40px',
        animation: 'fadeIn 0.3s ease',
        position: 'relative',
      }}>

        {/* ── VUE AXIS ── */}
        {onglet === 'axis' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            minHeight: 0,
            padding: '32px 28px 24px',
            gap: 0,
          }}>

            {/* Avatar grand centré */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <div style={{
                position: 'absolute', inset: -10,
                borderRadius: '50%',
                border: `1px solid rgba(${aRgb}, ${aiState !== 'idle' ? '0.35' : '0.1'})`,
                animation: aiState !== 'idle' ? 'pulse 1.4s infinite' : 'none',
                pointerEvents: 'none',
              }} />
              <AvatarStable etat={aiState} />
            </div>

            {/* Nom + état */}
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: a, letterSpacing: '0.1em' }}>AXIS</div>
              <div style={{ fontSize: 7, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.22em', marginTop: 3 }}>
                {aiState === 'idle' ? '// EN ATTENTE' : aiState === 'thinking' ? '// TRAITEMENT' : '// RÉPOND'}
              </div>
            </div>

            {/* Modes */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              <button onClick={() => setModeVocal(p => !p)} style={boutonModeStyle(modeVocal)}>
                <Volume2 size={10} /> VOCAL
              </button>
              <button onClick={toggleParlerAdmin} style={boutonModeStyle(modeParler)}>
                <Mic size={10} /> {ecoute ? '⬤ ÉCOUTE' : 'PARLER'}
              </button>
              <button onClick={() => setModeChat(p => !p)} style={boutonModeStyle(modeChat)}>
                <MessageSquare size={10} /> CHAT
              </button>
            </div>

            {/* Zone de chat — scrollable, prend tout l'espace dispo */}
            <div
              ref={chatRef}
              style={{
                flex: '1 1 0',
                minHeight: 0,
                width: '100%',
                maxWidth: 680,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                marginBottom: 16,
                padding: '0 4px',
              }}
            >
              {historiqueAdmin.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: msg.role === 'frejus' ? 'row-reverse' : 'row',
                    gap: 8,
                    animation: 'fadeIn 0.3s ease',
                  }}
                >
                  <div style={{
                    maxWidth: '72%',
                    background: msg.role === 'frejus'
                      ? `rgba(${aRgb},0.1)`
                      : 'rgba(255,255,255,0.04)',
                    border: msg.role === 'frejus'
                      ? `1px solid rgba(${aRgb},0.2)`
                      : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: msg.role === 'frejus'
                      ? '12px 3px 12px 12px'
                      : '3px 12px 12px 12px',
                    padding: '10px 14px',
                    fontSize: 11,
                    color: msg.role === 'frejus'
                      ? `rgba(${aRgb},0.9)`
                      : 'rgba(255,255,255,0.82)',
                    lineHeight: 1.65,
                  }}>
                    {msg.texte}
                  </div>
                </div>
              ))}
              {axisTyping && (
                <div style={{
                  display: 'flex', gap: 4, padding: '8px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '3px 12px 12px 12px',
                  width: 'fit-content',
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: `rgba(${aRgb},0.6)`,
                      animation: `pulse 1s infinite ${i*0.2}s`,
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* Input — fixé en bas de la vue */}
            <div style={{
              width: '100%',
              maxWidth: 680,
            }}>
              {modeParler ? (
                <div style={{
                  textAlign: 'center',
                  padding: '14px',
                  background: `rgba(${aRgb},0.04)`,
                  border: `1px solid rgba(${aRgb},0.12)`,
                  borderRadius: 12,
                  fontSize: 9, color: ecoute ? a : `rgba(${aRgb},0.45)`,
                  letterSpacing: '0.18em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {ecoute && (
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: a, animation: 'pulse 1s infinite',
                    }} />
                  )}
                  {ecoute ? 'ÉCOUTE EN COURS — PARLEZ' : 'MICRO PRÊT — EN ATTENTE'}
                </div>
              ) : (
                <div style={{
                  display: 'flex', gap: 0,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid rgba(${aRgb},0.14)`,
                  borderRadius: 12, overflow: 'hidden',
                }}>
                  <input
                    ref={inputRef}
                    value={inputAdmin}
                    onChange={e => setInputAdmin(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); envoyerAAxis() }
                    }}
                    placeholder="Parle à AXIS..."
                    style={{
                      flex: 1, background: 'transparent',
                      border: 'none', outline: 'none',
                      padding: '12px 16px',
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 11, color: '#fff',
                      caretColor: a,
                    }}
                  />
                  <button
                    onClick={envoyerAAxis}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      borderLeft: `1px solid rgba(${aRgb},0.1)`,
                      background: `rgba(${aRgb},0.08)`,
                      color: a, cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke={a} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── LIVE ── */}
        {onglet === 'live' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Métriques rapides */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
            }}>
              {[
                { label: 'SESSIONS', val: stats.total },
                { label: 'MESSAGES', val: stats.msgTotal },
                { label: 'CONTACTS ⚡', val: stats.demandesContact },
                { label: 'CV ⚡', val: stats.demandesCv },
              ].map(({ label, val }, i) => (
                <div key={i} style={{
                  ...glassAccent,
                  padding: '16px 18px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.2),transparent)`,
                  }} />
                  <div style={{
                    fontSize: 7, color: `rgba(${aRgb},0.4)`,
                    letterSpacing: '0.22em', marginBottom: 8,
                  }}>{label}</div>
                  <div style={{
                    fontSize: 26, fontWeight: 800,
                    color: a, fontFamily: 'Fraunces, serif',
                    lineHeight: 1,
                  }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Sessions récentes + détail */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            }}>
              {/* Liste sessions */}
              <div style={{ ...glass, padding: 20 }}>
                <div style={{
                  fontSize: 7, color: `rgba(${aRgb},0.4)`,
                  letterSpacing: '0.25em', marginBottom: 16,
                }}>
                  // FLUX TEMPS RÉEL
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 8,
                  maxHeight: 420, overflowY: 'auto',
                }}>
                  {sessions.slice(0, 20).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSessionSelectee(
                        sessionSelectee?.id === s.id ? null : s
                      )}
                      style={{
                        padding: '12px 14px',
                        background: sessionSelectee?.id === s.id
                          ? `rgba(${aRgb},0.08)`
                          : 'rgba(255,255,255,0.02)',
                        border: sessionSelectee?.id === s.id
                          ? `1px solid rgba(${aRgb},0.25)`
                          : '1px solid rgba(255,255,255,0.04)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        transition: 'all 180ms',
                        position: 'relative', overflow: 'hidden',
                      }}
                      onMouseEnter={e => {
                        if (sessionSelectee?.id !== s.id) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                          e.currentTarget.style.borderColor = `rgba(${aRgb},0.12)`
                        }
                      }}
                      onMouseLeave={e => {
                        if (sessionSelectee?.id !== s.id) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
                        }
                      }}
                    >
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 6,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: profilColor(s.profil_visiteur),
                          }} />
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: '#fff',
                          }}>
                            {s.prenom_visiteur || '—'}
                          </span>
                          <span style={{
                            fontSize: 6,
                            color: profilColor(s.profil_visiteur),
                            letterSpacing: '0.15em',
                          }}>
                            {profilLabel(s.profil_visiteur)}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 7, color: 'rgba(255,255,255,0.18)',
                        }}>
                          {formatDate(s.created_at)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>
                          {s.nb_messages || 0} msg
                        </span>
                        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>
                          {formatDuree(s.duree_secondes || 0)}
                        </span>
                        {s.demande_contact && (
                          <span style={{ fontSize: 7, color: a }}>⚡ contact</span>
                        )}
                        {s.demande_cv && (
                          <span style={{ fontSize: 7, color: '#f59e0b' }}>⚡ cv</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <div style={{
                      textAlign: 'center', padding: '40px 0',
                      fontSize: 8, color: 'rgba(255,255,255,0.1)',
                      letterSpacing: '0.2em',
                    }}>
                      Aucune session enregistrée
                    </div>
                  )}
                </div>
              </div>

              {/* Conversation sélectionnée */}
              <div style={{ ...glass, padding: 20 }}>
                <div style={{
                  fontSize: 7, color: `rgba(${aRgb},0.4)`,
                  letterSpacing: '0.25em', marginBottom: 16,
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>// CONVERSATION</span>
                  {sessionSelectee && (
                    <span style={{ color: a }}>
                      {sessionSelectee.prenom_visiteur}
                    </span>
                  )}
                </div>

                {!sessionSelectee ? (
                  <div style={{
                    height: 380, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 10,
                  }}>
                    <div style={{
                      width: 40, height: 40,
                      border: `1px solid rgba(${aRgb},0.08)`,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16, color: `rgba(${aRgb},0.15)`,
                    }}>◎</div>
                    <div style={{
                      fontSize: 8, color: 'rgba(255,255,255,0.1)',
                      letterSpacing: '0.2em',
                    }}>
                      Sélectionne une session
                    </div>
                  </div>
                ) : (
                  <div style={{
                    maxHeight: 380, overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    {(sessionSelectee.historique || []).map((msg, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        gap: 8,
                      }}>
                        <div style={{
                          maxWidth: '78%',
                          background: msg.role === 'user'
                            ? 'rgba(255,255,255,0.04)'
                            : `rgba(${aRgb},0.06)`,
                          border: msg.role === 'user'
                            ? '1px solid rgba(255,255,255,0.06)'
                            : `1px solid rgba(${aRgb},0.1)`,
                          borderRadius: msg.role === 'user'
                            ? '12px 3px 12px 12px'
                            : '3px 12px 12px 12px',
                          padding: '9px 12px',
                          fontSize: 10,
                          color: msg.role === 'user'
                            ? 'rgba(255,255,255,0.7)'
                            : 'rgba(255,255,255,0.85)',
                          lineHeight: 1.6,
                        }}>
                          {msg.contenu}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SESSIONS ── */}
        {onglet === 'sessions' && (
          <div style={{ ...glass, padding: 24 }}>
            <div style={{
              fontSize: 7, color: `rgba(${aRgb},0.4)`,
              letterSpacing: '0.25em', marginBottom: 20,
            }}>
              // TOUTES LES SESSIONS — {sessions.length}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 12,
            }}>
              {sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setSessionSelectee(s); setOnglet('live') }}
                  style={{
                    ...glassAccent,
                    padding: '18px 20px',
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `rgba(${aRgb},0.28)`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `rgba(${aRgb},0.12)`
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.18),transparent)`,
                  }} />
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: 10,
                  }}>
                    <div>
                      <div style={{
                        fontSize: 12, fontWeight: 700,
                        color: '#fff', marginBottom: 3,
                      }}>
                        {s.prenom_visiteur || '—'}
                      </div>
                      <div style={{
                        fontSize: 6, color: profilColor(s.profil_visiteur),
                        letterSpacing: '0.15em',
                      }}>
                        {profilLabel(s.profil_visiteur)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                      {s.demande_contact && (
                        <div style={{
                          fontSize: 6, color: a,
                          background: `rgba(${aRgb},0.1)`,
                          border: `1px solid rgba(${aRgb},0.2)`,
                          borderRadius: 4, padding: '2px 5px',
                          letterSpacing: '0.1em',
                        }}>⚡ CONTACT</div>
                      )}
                      {s.demande_cv && (
                        <div style={{
                          fontSize: 6, color: '#f59e0b',
                          background: 'rgba(245,158,11,0.08)',
                          border: '1px solid rgba(245,158,11,0.2)',
                          borderRadius: 4, padding: '2px 5px',
                          letterSpacing: '0.1em',
                        }}>⚡ CV</div>
                      )}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', gap: 16,
                    paddingTop: 10,
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    {[
                      [`${s.nb_messages || 0}`, 'msg'],
                      [formatDuree(s.duree_secondes || 0), 'durée'],
                    ].map(([val, label], i) => (
                      <div key={i}>
                        <div style={{
                          fontSize: 16, fontWeight: 800,
                          color: a, fontFamily: 'Fraunces, serif',
                          lineHeight: 1,
                        }}>{val}</div>
                        <div style={{
                          fontSize: 6, color: 'rgba(255,255,255,0.2)',
                          letterSpacing: '0.1em', marginTop: 2,
                        }}>{label}</div>
                      </div>
                    ))}
                    <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                      <div style={{
                        fontSize: 6, color: 'rgba(255,255,255,0.15)',
                      }}>
                        {formatDate(s.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        {onglet === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
            }}>
              {[
                { label: 'SESSIONS TOTALES', val: stats.total, sub: 'visiteurs uniques' },
                { label: 'MESSAGES', val: stats.msgTotal, sub: 'échangés' },
                { label: 'DURÉE MOY.', val: formatDuree(stats.dureeMoy), sub: 'par session' },
                { label: 'TAUX CONTACT', val: stats.total ? `${Math.round((stats.demandesContact/stats.total)*100)}%` : '0%', sub: 'des visiteurs' },
              ].map(({ label, val, sub }, i) => (
                <div key={i} style={{
                  ...glassAccent,
                  padding: '22px 20px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.22),transparent)`,
                  }} />
                  <div style={{
                    fontSize: 7, color: `rgba(${aRgb},0.4)`,
                    letterSpacing: '0.22em', marginBottom: 10,
                  }}>{label}</div>
                  <div style={{
                    fontSize: 30, fontWeight: 800,
                    color: a, lineHeight: 1, marginBottom: 6,
                    fontFamily: 'Fraunces, serif',
                  }}>{val}</div>
                  <div style={{
                    fontSize: 8, color: 'rgba(255,255,255,0.18)',
                    letterSpacing: '0.1em',
                  }}>{sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ ...glass, padding: 22 }}>
                <div style={{
                  fontSize: 7, color: `rgba(${aRgb},0.4)`,
                  letterSpacing: '0.25em', marginBottom: 18,
                }}>
                  // PROFILS
                </div>
                {[
                  { label: 'Recruteurs', val: stats.recruteurs, color: '#3b82f6' },
                  { label: 'Clients', val: stats.clients, color: '#10b981' },
                  { label: 'Curieux', val: stats.curieux, color: a },
                  { label: 'Collaborateurs', val: stats.collabs, color: '#a855f7' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      marginBottom: 5,
                    }}>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 9, color, fontWeight: 700 }}>
                        {val}
                      </span>
                    </div>
                    <div style={{
                      height: 2, background: 'rgba(255,255,255,0.05)',
                      borderRadius: 2, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: stats.total ? `${(val/stats.total)*100}%` : '0%',
                        background: color, borderRadius: 2,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...glass, padding: 22 }}>
                <div style={{
                  fontSize: 7, color: `rgba(${aRgb},0.4)`,
                  letterSpacing: '0.25em', marginBottom: 18,
                }}>
                  // SIGNAUX CHAUDS
                </div>
                {[
                  { label: 'Demandes contact', val: stats.demandesContact, color: a },
                  { label: 'Demandes CV', val: stats.demandesCv, color: '#f59e0b' },
                  { label: 'Taux CV', val: stats.total ? `${Math.round((stats.demandesCv/stats.total)*100)}%` : '0%', color: '#a855f7' },
                  { label: 'Moy. messages/session', val: stats.total ? Math.round(stats.msgTotal/stats.total) : 0, color: '#3b82f6' },
                ].map(({ label, val, color }, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '11px 0',
                    borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: 18, fontWeight: 800,
                      color, fontFamily: 'Fraunces, serif',
                    }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROMPT ── */}
        {onglet === 'prompt' && (
          <div style={{ ...glass, padding: 28 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: 20,
            }}>
              <div>
                <div style={{
                  fontSize: 7, color: `rgba(${aRgb},0.4)`,
                  letterSpacing: '0.25em', marginBottom: 5,
                }}>
                  // PERSONNALITÉ AXIS
                </div>
                <div style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.08em',
                }}>
                  Modifie le comportement d'AXIS sans toucher au code
                </div>
              </div>
              <button
                onClick={sauvegarderPrompt}
                style={{
                  background: promptSauvegarde
                    ? 'rgba(16,185,129,0.1)'
                    : `rgba(${aRgb},0.08)`,
                  border: `1px solid ${promptSauvegarde
                    ? 'rgba(16,185,129,0.3)'
                    : `rgba(${aRgb},0.2)`}`,
                  color: promptSauvegarde ? '#10b981' : a,
                  borderRadius: 10, padding: '9px 18px',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 8, letterSpacing: '0.2em',
                  cursor: 'pointer', transition: 'all 280ms',
                }}
              >
                {promptSauvegarde ? '✓ SAUVEGARDÉ' : 'SAUVEGARDER'}
              </button>
            </div>
            <textarea
              value={promptTexte}
              onChange={e => setPromptTexte(e.target.value)}
              placeholder="Instructions personnalisées pour AXIS — personnalité, exemples de réponses, comportements spécifiques..."
              style={{
                width: '100%', minHeight: 500,
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid rgba(${aRgb},0.1)`,
                borderRadius: 12, padding: '18px',
                fontFamily: 'Space Mono, monospace',
                fontSize: 11, color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.8, outline: 'none',
                resize: 'vertical', boxSizing: 'border-box',
                caretColor: a,
              }}
            />
            <div style={{
              marginTop: 10, fontSize: 7,
              color: 'rgba(255,255,255,0.12)',
              letterSpacing: '0.15em',
            }}>
              {promptTexte.length} caractères · s'applique aux prochaines conversations
            </div>
          </div>
        )}

      </div>

      {onglet !== 'axis' && (
        <div
          onClick={() => setOnglet('axis')}
          style={{
            position: 'fixed',
            bottom: isMobile ? 68 : 28,
            right: 24,
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 52, height: 52,
            borderRadius: '50%',
            background: 'rgba(5,5,16,0.85)',
            border: `1px solid rgba(${aRgb},0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}>
            {aiState !== 'idle' && (
              <div style={{
                position: 'absolute', inset: -3,
                borderRadius: '50%',
                border: `1px solid rgba(${aRgb},0.5)`,
                animation: 'pulse 1.4s infinite',
              }} />
            )}
            <AvatarStable etat={aiState} />
          </div>
          <div style={{
            fontSize: 6,
            color: a,
            fontWeight: 700,
            background: 'rgba(5,5,16,0.8)',
            padding: '2px 7px',
            borderRadius: 4,
            border: `1px solid rgba(${aRgb},0.15)`,
            letterSpacing: '0.1em',
          }}>
            ● AXIS
          </div>
        </div>
      )}

      {drawerOuvert && isMobile && (
        <div style={{
          position: 'fixed', inset: 0,
          zIndex: 120,
          background: 'rgba(0,0,0,0.68)',
          display: 'flex',
          justifyContent: 'flex-start',
        }} onClick={() => setDrawerOuvert(false)}>
          <div style={{
            width: '240px', maxWidth: '70vw',
            background: '#07070e',
            borderRight: `1px solid rgba(${aRgb},0.18)`,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 8, color: a, letterSpacing: '0.18em' }}>MENU</div>
              <button onClick={() => setDrawerOuvert(false)} style={{
                background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14,
              }}>✕</button>
            </div>
            <div style={{ fontSize: 7, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.15em' }}>MODES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => setModeChat(v => !v)} style={{...boutonModeStyle(modeChat), width: '100%', justifyContent: 'center'}}>
                <MessageSquare size={12} /> CHAT
              </button>
              <button onClick={() => setModeVocal(v => !v)} style={{...boutonModeStyle(modeVocal), width: '100%', justifyContent: 'center'}}>
                <Volume2 size={12} /> VOIX
              </button>
              <button onClick={toggleParlerAdmin} style={{...boutonModeStyle(modeParler), width: '100%', justifyContent: 'center'}}>
                <Mic size={12} /> PARLER
              </button>
            </div>
            <div style={{ borderTop: `1px solid rgba(${aRgb},0.1)`, paddingTop: 10 }}>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', marginBottom: 6 }}>{user?.email}</div>
              <button onClick={deconnexion} style={{
                width: '100%',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                color: 'rgba(239,68,68,0.6)',
                borderRadius: 6, padding: '6px',
                fontSize: 7, letterSpacing: '0.15em',
                cursor: 'pointer',
              }}>
                DÉCONNEXION
              </button>
            </div>
            <div style={{ borderTop: `1px solid rgba(${aRgb},0.1)`, paddingTop: 10 }}>
              <PanneauParametres />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}