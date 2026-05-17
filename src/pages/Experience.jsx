import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserStore from '@/store/utiliserStore'
import utiliserTheme from '@/store/utiliserTheme'
import { utiliserAxis } from '@/hooks/utiliserDevJAI'
import AvatarParticulaire from '@/composants/ui/AvatarParticulaire'

// Import du hook AXIS renommé sans changer le nom du fichier
import Portfolio from '@/composants/Portfolio'
import PanneauParametres from '@/composants/ui/PanneauParametres'
import { Volume2, Layout, RotateCcw, Send, MapPin, Briefcase, Zap } from 'lucide-react'
import cartesPortfolio from '@/donnees/cartesPortfolio'

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
  const { theme } = utiliserTheme()
  const a = theme.accent
  const aRgb = theme.accentRgb

  const [modeVocal, setModeVocal] = useState(true)
  const [modeChat, setModeChat] = useState(false)
  const [modePortfolio, setModePortfolio] = useState(false)
  const [modeParler, setModeParler] = useState(
    visiteur.microActif === true
  )
  const [ecoute, setEcoute] = useState(false) // vraie = micro actif
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [drawerSys, setDrawerSys] = useState(false)
  const [drawerMod, setDrawerMod] = useState(false)
  const [dernierMessage, setDernierMessage] = useState('')
  const [bulleVisible, setBulleVisible] = useState(false)
  const [photoFrejusVisible, setPhotoFrejusVisible] = useState(false)
  const [inputCmd, setInputCmd] = useState('')
  const [heure, setHeure] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [sectionActive, setSectionActive] = useState(null)
  const [cartesActives, setCartesActives] = useState([])
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const modeParlerRef  = useRef(false)

  useEffect(() => {
    modeParlerRef.current = modeParler
  }, [modeParler])

  useEffect(() => {
    if (visiteur.microActif) {
      modeParlerRef.current = true
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const portfolioRef = useRef(null)
  const derniereQuestionRef = useRef('')
  const sectionEnAttenteRef = useRef(null)
  const [aiState, setAiState] = useState('idle')

  const { envoyerMessage, estEnChargement, messageCourant } = utiliserAxis()
  const envoyerMessageRef = useRef(envoyerMessage)
  useEffect(() => {
    envoyerMessageRef.current = envoyerMessage
  }, [envoyerMessage])

  function detecterCartes(texteReponse, texteUtilisateur = '') {
    const rep = texteReponse.toLowerCase()
    const usr = texteUtilisateur.toLowerCase()

    const scores = {
      services:   0,
      projets:    0,
      competences:0,
      contact:    0,
      parcours:   0,
    }

    // ── Question utilisateur — poids x4 (intention principale) ──
    const intentionsUsr = {
      services:    ['service', 'tarif', 'prix', 'offre', 'devis', 'combien', 'coût', 'vitrine', 'ecommerce'],
      projets:     ['projet', 'réalisation', 'travaux', 'portfolio', 'mes projets'],
      competences: ['compétence', 'stack', 'technologie', 'skill', 'maîtrise', 'sais faire'],
      contact:     ['contact', 'joindre', 'whatsapp', 'email', 'appeler', 'disponible'],
      parcours:    ['parcours', 'expérience', 'formation', 'études', 'cursus',
                     'diplôme', 'à propos', 'about', 'qui est', 'qui es',
                     'présente', 'présentation', 'bio', 'profil', 'frejus'],
    }
    Object.entries(intentionsUsr).forEach(([cat, mots]) => {
      mots.forEach(m => { if (usr.includes(m)) scores[cat] += 4 })
    })

    // Ouverture portfolio — détectée ici mais exécutée ailleurs
    // On ne fait RIEN ici — trySpeak s'en charge
    // Retourner [] pour ne pas afficher de carte
    const demandePortfolio = [
      'voir le portfolio', 'ouvre le portfolio', 'montre le portfolio',
      'affiche le portfolio', 'navigue vers', 'va sur le portfolio',
      'ouvre moi le portfolio', 'montre moi le portfolio',
      '> voir le portfolio',
      'portfolio',
    ].some(m => usr.includes(m))
    if (demandePortfolio) return []

    // ── Réponse IA — poids x1 avec exclusions croisées ──
    const nomsProjet = ['eliko', 'santeai', 'devjai', 'uiya', 'bibliothèque']
    const reponseParleDeProjet = nomsProjet.some(n => rep.includes(n))

    const motsIA = {
      services:    ['fcfa', 'vitrine', 'e-commerce', 'sur mesure', 'devis', 'tarif', 'livraison', 'forfait'],
      projets:     [...nomsProjet, 'projet', 'réalisation', 'développé'],
      competences: ['compétence', 'framework', 'maîtrise'],
      contact:     ['email', 'whatsapp', 'joindre', 'contacter', 'disponible', 'freelance'],
      parcours:    ['parcours', 'formation', 'expérience', 'université', 'diplôme'],
    }

    // React/Node/Python ne comptent PAS pour compétences si la réponse 
    // parle de projets ou de services
    if (!reponseParleDeProjet && !rep.includes('fcfa')) {
      if (rep.includes('react') || rep.includes('python') || rep.includes('node')) {
        scores.competences += 1
      }
    }

    Object.entries(motsIA).forEach(([cat, mots]) => {
      mots.forEach(m => { if (rep.includes(m)) scores[cat]++ })
    })

    // "développement de site" dans services context → ne pas scorer projets
    if (rep.includes('fcfa') || rep.includes('vitrine') || rep.includes('e-commerce')) {
      scores.projets = 0
      scores.services += 3
    }

    console.log('[detecterCartes] scores:', scores, '| usr:', usr.slice(0,40))

    const meilleure = Object.entries(scores)
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1])[0]

    if (!meilleure) return []
    return [cartesPortfolio[meilleure[0]]]
  }

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

      // ── Détection ouverture portfolio ──
      const reponseIA = messageCourant.toLowerCase()
      const questionUsr = derniereQuestionRef.current.toLowerCase()

      const motsClePortfolio = [
        'portfolio', 'voir le portfolio', 'ouvre le portfolio',
        'je vous emmène', 'je t\'emmène', 'voici le portfolio',
        'affiche le portfolio', 'montre le portfolio'
      ]

      const demandePortfolio = motsClePortfolio.some(m =>
        questionUsr.includes(m) || reponseIA.includes(m)
      )

      if (demandePortfolio && !modePortfolio) {
        // Détecter la section cible si mentionnée
        const sectionMap = {
          'projet': 'projects',
          'compétence': 'skills',
          'contact': 'contact',
          'parcours': 'about',
          'à propos': 'about',
          'service': 'services',
        }
        let sectionCible = null
        Object.entries(sectionMap).forEach(([mot, section]) => {
          if (questionUsr.includes(mot)) sectionCible = section
        })

        sectionEnAttenteRef.current = sectionCible
        setModePortfolio(true)
      }

      const detectionPhoto = (texte, question) => {
        const t = texte.toLowerCase()
        const q = question.toLowerCase()
        return (
          q.includes('photo') ||
          q.includes('image') ||
          q.includes('voir fréjus') ||
          q.includes('voir frejus') ||
          q.includes('ressemble') ||
          q.includes('tête') ||
          q.includes('visage') ||
          t.includes('voici fréjus') ||
          t.includes('voici une photo') ||
          t.includes('je vous présente fréjus') ||
          t.includes('je te présente fréjus') ||
          t.includes('permettez-moi de vous présenter') ||
          t.includes('laissez-moi vous présenter')
        )
      }
      if (detectionPhoto(messageCourant, derniereQuestionRef.current)) {
        setPhotoFrejusVisible(true)
        setTimeout(() => setPhotoFrejusVisible(false), 9000)
      }
      // Détecter la commande de retour
      const msgLower = messageCourant.toLowerCase()
      const retourMots = [
        'reviens à mon espace', 'je reviens à mon espace',
        'retourne à mon espace', 'ferme le portfolio'
      ]
      if (retourMots.some(m => msgLower.includes(m))) {
        setModePortfolio(false)
      }
      setBulleVisible(true)
      // Afficher la photo de Fréjus dès le premier message
      if (!derniereQuestionRef.current) {
        setPhotoFrejusVisible(true)
        setTimeout(() => setPhotoFrejusVisible(false), 9000)
      }
      const cartes = detecterCartes(messageCourant, derniereQuestionRef.current)
      setCartesActives(cartes)
      console.log('[cartes] cartesActives définies:', cartes.map(c => c.id))
    }, 0)

    return () => window.clearTimeout(init)
  }, [messageCourant, dernierMessage, modePortfolio])

  useEffect(() => {
    if (!dernierMessage) return
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    let actif = true
    const { definirAxisParle } = utiliserStore.getState()

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
        // Correction prononciation : Fréjus → Fréjusse (force le S)
        .replace(/Fréjus/gi, 'Fréjusse')
        .replace(/Frejus/gi, 'Fréjusse')
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
        setTimeout(() => { if (actif) definirAxisParle(false) }, 0)
        return
      }

      const voix = window.speechSynthesis.getVoices()
      
      const priorite = [
        // Desktop — voix masculines françaises
        v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('thomas'),
        v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('nicolas'),
        v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('paul'),
        // Mobile Android — Google français
        v => v.lang === 'fr-FR' && v.name.includes('Google'),
        v => v.lang === 'fr-FR' && !v.name.toLowerCase().includes('amelie') 
             && !v.name.toLowerCase().includes('marie')
             && !v.name.toLowerCase().includes('alice')
             && !v.name.toLowerCase().includes('stephanie'),
        // Fallback fr générique
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

      // Détection iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

      // Keep-alive uniquement sur desktop — cause des coupures sur mobile
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
          definirAxisParle(false)
          setCartesActives([])
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
          idx++
          // Délai légèrement plus long sur mobile
          setTimeout(parlerSegment, isIOS ? 200 : 120)
        }

        seg.onerror = (e) => {
          if (!actif) return
          console.warn('[speech] erreur segment:', e.error)
          idx++
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
      // Ne PAS cancel ici — laisser la parole finir
    }
  }, [dernierMessage, modeVocal])

  useEffect(() => {
    if (aiState === 'speaking') {
      try { recognitionRef.current?.abort() } catch (e) { console.warn('[rec] abort error:', e) }
      setTimeout(() => setEcoute(false), 0)
      return
    }

    if (aiState === 'idle' && (modeParlerRef.current || modeParler)) {
      const timer = setTimeout(() => {
        if (!modeParlerRef.current && !modeParler) return
        // Ne pas redémarrer si le micro est déjà actif
        if (ecoute) return
        try { recognitionRef.current?.abort() } catch (e) { console.warn('[rec] abort error:', e) }

        const RecVocale = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!RecVocale) return

        const rec = new RecVocale()
        rec.lang           = 'fr-FR'
        rec.continuous     = false
        rec.interimResults = false

        rec.onstart = () => setEcoute(true)

        rec.onresult = (event) => {
          const texte = event.results[0][0].transcript.trim()
          if (texte) {
            derniereQuestionRef.current = texte
            setAiState('thinking')
            envoyerMessageRef.current(texte)
          }
        }

        rec.onerror = (e) => {
          console.warn('[rec] erreur:', e.error)
          setEcoute(false)
        }

        rec.onend = () => setEcoute(false)

        recognitionRef.current = rec
        try { rec.start() } catch (e) { console.warn('[rec] start error:', e) }
      }, 900)

      return () => clearTimeout(timer)
    }
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
    derniereQuestionRef.current = inputCmd.trim()
    setAiState('thinking')
    envoyerMessage(inputCmd.trim())
    setInputCmd('')
  }, [inputCmd, envoyerMessage, setInputCmd])

  const envoyerCommande = (cmd) => {
    derniereQuestionRef.current = cmd
    setAiState('thinking')
    envoyerMessageRef.current(cmd)
  }

  const naviguerPortfolio = useCallback((section) => {
    if (!portfolioRef.current) return
    portfolioRef.current.naviguerVers(section)
    setSectionActive(section)
    setTimeout(() => setSectionActive(null), 3000)
  }, [])

  useEffect(() => {
    if (!modePortfolio) return

    if (!modeParlerRef.current) {
      setModeParler(true)
      modeParlerRef.current = true
    }

    let tentatives = 0
    const interval = setInterval(() => {
      tentatives++
      if (portfolioRef.current) {
        clearInterval(interval)
        const section = sectionEnAttenteRef.current
        sectionEnAttenteRef.current = null
        console.log('[portfolio] section en attente:', section)
        // Ne naviguer vers hero QUE si aucune section demandée
        if (section && section !== 'hero') {
          portfolioRef.current.naviguerVers(section)
          setSectionActive(section)
          setTimeout(() => setSectionActive(null), 3000)
        }
        // Si section === null ou 'hero', ne rien faire — rester en haut
      } else if (tentatives > 40) {
        clearInterval(interval)
        sectionEnAttenteRef.current = null
        console.warn('[portfolio] portfolioRef jamais disponible')
      }
    }, 50)

    return () => clearInterval(interval)
  }, [modePortfolio])

  const toggleParler = useCallback(() => {
    if (!modeParler) {
      setModeParler(true)
      modeParlerRef.current = true

      const RecVocale = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!RecVocale) return

      const rec = new RecVocale()
      rec.lang           = 'fr-FR'
      rec.continuous     = false
      rec.interimResults = false

      rec.onstart = () => setEcoute(true)

      rec.onresult = (event) => {
        const texte = event.results[0][0].transcript.trim()
        if (texte) {
          derniereQuestionRef.current = texte
          setAiState('thinking')
          envoyerMessageRef.current(texte)
        }
      }

      rec.onerror = (e) => {
        console.warn('[rec] erreur:', e.error)
        setEcoute(false)
      }

      rec.onend = () => setEcoute(false)

      recognitionRef.current = rec
      try { rec.start() } catch (e) { console.warn('[rec] start error:', e) }
    } else {
      setModeParler(false)
      modeParlerRef.current = false
      try { recognitionRef.current?.abort() } catch (e) { console.warn('[rec] abort error:', e) }
      recognitionRef.current = null
      setEcoute(false)
    }
  }, [modeParler])

  const avatarTransform = cartesActives.length > 0
    ? (isMobile ? 'translateX(-50%) translateY(30%)' : 'translateX(-50%) translateY(-65%)')
    : (modeChat && bulleVisible ? 'translateX(-50%) translateY(-60%)' : 'translateX(-50%) translateY(-50%)')

  if (isMobile) {
    return (
      <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', overflowX: 'hidden', backgroundColor: '#050505', display: 'flex', flexDirection: 'column' }}>
        <style>{`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0px); }
          }
          @keyframes slideFromRight {
            from { opacity: 0; transform: translateX(184px) translateY(-50%); }
            to   { opacity: 1; transform: translateX(0px) translateY(-50%); }
          }
          @keyframes scanAnim {
            from { top: 0%; }
            to   { top: 100%; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.35; }
          }
        `}</style>

        <div style={{ height: 56, background: 'rgba(0,0,0,0.85)', borderBottom: `1px solid rgba(${aRgb},0.12)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>&lt;/DevJ&gt;</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 16, color: a }}>{heure}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: a, letterSpacing: '0.18em' }}>● EN LIGNE</div>
            <button onClick={() => naviguer('/')} style={{ width: 28, height: 28, border: '1px solid rgba(255,100,100,0.2)', background: 'rgba(255,100,100,0.05)', color: 'rgba(255,100,100,0.8)', borderRadius: 8, display: 'grid', placeItems: 'center', padding: 0 }}>
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: avatarTransform, transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 20, width: '100%' }}>
          <AvatarStable width={200} height={200} etat={aiState} />
          <div style={{ textAlign: 'center', fontFamily: 'Space Mono, monospace', color: 'rgba(255,255,255,0.9)', fontSize: 9, lineHeight: 1.4, maxWidth: '88vw' }}>
            <div>// FRÉJUS KOUADIO</div>
            <div style={{ color: aiState === 'idle' ? `rgba(${aRgb},0.4)` : a }}>
              {aiState === 'idle' ? '// EN ATTENTE' : aiState === 'thinking' ? '// TRAITEMENT...' : '// EN TRAIN DE PARLER'}
            </div>
          </div>
          {modeChat && bulleVisible && !modePortfolio && (
            <div style={{ width: 'calc(100vw - 64px)', maxWidth: 340, background: 'rgba(3,3,3,0.92)', border: `1px solid rgba(${aRgb},0.1)`, borderRadius: 14, padding: 16, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', color: '#fff' }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: a, letterSpacing: '0.25em', marginBottom: 8 }}>AXIS // TRANSMISSION</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{dernierMessage}</div>
            </div>
          )}
        </div>

        <button onClick={() => setDrawerSys(true)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 42, background: 'rgba(0,0,0,0.7)', border: `1px solid rgba(${aRgb},0.25)`, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 14, zIndex: 21 }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: '#fff', transform: 'rotate(-90deg)', display: 'inline-block' }}>SYS</span>
        </button>
        <button onClick={() => setDrawerMod(true)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 42, background: 'rgba(0,0,0,0.7)', border: `1px solid rgba(${aRgb},0.25)`, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 14, zIndex: 21 }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: '#fff', transform: 'rotate(-90deg)', display: 'inline-block' }}>MOD</span>
        </button>

        {(drawerSys || drawerMod) && (
          <div onClick={() => { setDrawerSys(false); setDrawerMod(false) }} style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.35)' }} />
        )}

        <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 220, zIndex: 35, background: 'rgba(0,0,0,0.95)', borderRight: `1px solid rgba(${aRgb},0.2)`, backdropFilter: 'blur(20px)', transform: drawerSys ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.35s ease', padding: '18px 14px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: a, letterSpacing: '0.2em' }}>// SYSTÈME</div>
            <button onClick={() => setDrawerSys(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ border: `1px solid rgba(${aRgb},0.14)`, background: `rgba(${aRgb},0.05)`, padding: '12px', marginBottom: 12, borderRadius: 14 }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.22em', color: `rgba(${aRgb},0.55)`, marginBottom: 6 }}>VISITEUR</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: a }}>{visiteur.prenom || '—'}</div>
          </div>
          <div style={{ border: `1px solid rgba(${aRgb},0.14)`, background: `rgba(${aRgb},0.05)`, padding: '12px', marginBottom: 12, borderRadius: 14 }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.22em', color: `rgba(${aRgb},0.55)`, marginBottom: 6 }}>PROFIL</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: a }}>{({ recruiter:'RECRUTEUR', client:'CLIENT', collaborateur:'COLLABORATEUR', curieux:'CURIEUX' }[visiteur.profession] || visiteur.profession?.toUpperCase() || '—')}</div>
          </div>
          <div style={{ border: `1px solid rgba(${aRgb},0.14)`, background: `rgba(${aRgb},0.05)`, padding: '12px', marginBottom: 20, borderRadius: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: 9999, background: a, animation: 'pulse 1.4s infinite' }} />
            <div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: `rgba(${aRgb},0.55)`, marginBottom: 4 }}>STATUT</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: a }}>● CONNECTÉ</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>NAVIGATION RAPIDE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['> voir le portfolio', '> mes projets', '> me contacter', '> mon parcours'].map((cmd) => (
              <button key={cmd} onClick={() => { envoyerCommande(cmd); setDrawerSys(false) }} style={{ textAlign: 'left', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: `rgba(${aRgb},0.75)`, padding: '10px 12px', fontFamily: 'Space Mono, monospace', fontSize: 9, borderRadius: 12, cursor: 'pointer' }}>
                {cmd.replace('>', '›')}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid rgba(${aRgb},0.08)` }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em', marginBottom: 10 }}>AUDIO</div>
            <button onClick={() => setModeVocal(prev => !prev)} style={{ width: '100%', background: modeVocal ? `rgba(${aRgb},0.15)` : 'rgba(255,255,255,0.04)', border: `1px solid ${modeVocal ? a : `rgba(${aRgb},0.25)`}`, color: modeVocal ? '#fff' : `rgba(${aRgb},0.9)`, padding: '10px 0', borderRadius: 12, fontFamily: 'Space Mono, monospace', fontSize: 10, cursor: 'pointer' }}>
              {modeVocal ? 'VOCAL ON' : 'VOCAL OFF'}
            </button>
          </div>
        </div>

        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 220, zIndex: 35, background: 'rgba(0,0,0,0.95)', borderLeft: `1px solid rgba(${aRgb},0.2)`, backdropFilter: 'blur(20px)', transform: drawerMod ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.35s ease', padding: '18px 14px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: a, letterSpacing: '0.2em' }}>// MODES</div>
            <button onClick={() => setDrawerMod(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>✕</button>
          </div>
          <button onClick={() => setModeVocal(prev => !prev)} style={{ width: '100%', border: `1px solid ${modeVocal ? a : 'rgba(255,255,255,0.12)'}`, background: modeVocal ? `rgba(${aRgb},0.15)` : 'rgba(255,255,255,0.04)', color: modeVocal ? '#fff' : `rgba(${aRgb},0.9)`, padding: '12px', borderRadius: 14, fontFamily: 'Space Mono, monospace', fontSize: 10, marginBottom: 12, cursor: 'pointer' }}>VOCAL</button>
          <button onClick={() => setModeChat(prev => !prev)} style={{ width: '100%', border: `1px solid ${modeChat ? a : 'rgba(255,255,255,0.12)'}`, background: modeChat ? `rgba(${aRgb},0.15)` : 'rgba(255,255,255,0.04)', color: modeChat ? '#fff' : `rgba(${aRgb},0.9)`, padding: '12px', borderRadius: 14, fontFamily: 'Space Mono, monospace', fontSize: 10, marginBottom: 12, cursor: 'pointer' }}>CHAT</button>
          <button onClick={toggleParler} style={{ width: '100%', border: `1px solid ${modeParler ? a : 'rgba(255,255,255,0.12)'}`, background: modeParler ? `rgba(${aRgb},0.15)` : 'rgba(255,255,255,0.04)', color: modeParler ? '#fff' : `rgba(${aRgb},0.9)`, padding: '12px', borderRadius: 14, fontFamily: 'Space Mono, monospace', fontSize: 10, cursor: 'pointer' }}>PARLER</button>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid rgba(${aRgb},0.08)` }}>
            <button onClick={() => { setModePortfolio(true); setDrawerMod(false) }} style={{ width: '100%', background: `rgba(${aRgb},0.1)`, border: `1px solid rgba(${aRgb},0.3)`, color: a, padding: '12px', borderRadius: 14, fontFamily: 'Space Mono, monospace', fontSize: 10, textTransform: 'uppercase', cursor: 'pointer' }}>PORTFOLIO</button>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid rgba(${aRgb},0.08)` }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em', marginBottom: 10 }}>SYS_STATUS</div>
            {[['MODÈLE','GROQ'],['SESSION','ACTIVE'],['VOIX','FR-FR']].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                <span>{k}</span><span style={{ color: a }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid rgba(${aRgb},0.08)` }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em', marginBottom: 10 }}>PARAMÈTRES</div>
            <PanneauParametres />
          </div>
        </div>

        {modePortfolio && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, overflow: 'hidden' }}>
            <Portfolio ref={portfolioRef} onClose={() => setModePortfolio(false)} />
            <div style={{
              position: 'fixed',
              bottom: 16,
              right: 12,
              zIndex: 52,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}>
              <div
                onClick={() => setModePortfolio(false)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  width: 72,
                  height: 72,
                  background: 'rgba(5,5,5,0.55)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid rgba(${aRgb},0.2)`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(${aRgb},0.08)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: -2,
                  borderRadius: '50%',
                  border: `1px solid rgba(${aRgb},${aiState !== 'idle' ? '0.6' : '0.15'})`,
                  animation: aiState !== 'idle' ? 'pulse 1.4s infinite' : 'none',
                  pointerEvents: 'none',
                }} />
                <AvatarStable width={68} height={68} etat={aiState} />
              </div>
              <div style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 7,
                color: aiState === 'idle' ? `rgba(${aRgb},0.35)` : a,
                letterSpacing: '0.12em',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(12px)',
                padding: '3px 8px',
                borderRadius: 20,
                border: `1px solid rgba(${aRgb},0.1)`,
              }}>
                {aiState === 'idle' ? '●' : aiState === 'thinking' ? '◌' : '◉'}
              </div>
            </div>
          </div>
        )}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, background: 'rgba(0,0,0,0.85)', borderTop: `1px solid rgba(${aRgb},0.12)`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, zIndex: 25 }}>
          {!modeParler ? (
            <>
              <input
                ref={inputRef}
                value={inputCmd}
                onChange={(e) => setInputCmd(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); soumettre() } }}
                placeholder="Entrez votre commande..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(${aRgb},0.15)`, borderRadius: 14, outline: 'none', padding: '12px 14px', fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#fff', caretColor: a }}
              />
              <button onClick={soumettre} style={{ padding: '12px 14px', border: 'none', borderRadius: 14, background: `rgba(${aRgb},0.1)`, color: a, fontFamily: 'Space Mono, monospace', fontSize: 12, cursor: 'pointer' }}>
                <Send size={14} color={a} />
              </button>
            </>
          ) : (
            <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: 10, color: a, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {ecoute ? '● ÉCOUTE EN COURS' : '// MICRO PRÊT'}
              {ecoute && <span style={{ width: 8, height: 8, borderRadius: '50%', background: a, animation: 'pulse 1.4s infinite', display: 'inline-block' }} />}
            </div>
          )}
        </div>

        {cartesActives.length > 0 && (
          <div style={{ position: 'absolute', top: 130, left: '50%', transform: 'translateX(-50%)', width: 'calc(100vw - 32px)', maxWidth: 320, zIndex: 40, opacity: 0, animation: 'fadeInDown 0.4s ease forwards', cursor: 'pointer' }} onClick={() => {
            setModePortfolio(true)
            setTimeout(() => {
              if (portfolioRef.current) {
                const sectionMap = {
                  projets: 'projects',
                  competences: 'skills',
                  contact: 'contact',
                  parcours: 'about',
                }
                const cible = sectionMap[cartesActives[0].id] || 'hero'
                portfolioRef.current.naviguerVers(cible)
              }
            }, 400)
            setCartesActives([])
          }}>
            <div style={{ border: `1px solid ${a}`, background: 'rgba(3,12,8,0.97)', boxShadow: `0 0 40px rgba(${aRgb},0.3), 0 0 80px rgba(${aRgb},0.1)`, backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.2s', borderRadius: 16 }}>
              {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h],i) => (
                <div key={i} style={{ position:'absolute', [v]:0, [h]:0, width:14, height:14, [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]:`2px solid ${a}`, [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]:`2px solid ${a}`, zIndex:3 }} />
              ))}
              <div style={{ padding: '8px 16px', borderBottom: `1px solid rgba(${aRgb},0.25)`, background: `rgba(${aRgb},0.07)`, fontFamily: 'Space Mono, monospace', fontSize: 8, color: a, letterSpacing: '0.25em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{cartesActives[0].label}</span>
                <span style={{ fontSize: 10, color: `rgba(${aRgb},0.5)` }}>→</span>
              </div>
              <div style={{ width: '100%', height: 200, position: 'relative', overflow: 'hidden', background: '#000' }}>
                <img src={cartesActives[0].image} alt={cartesActives[0].titre} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <div style={{ position:'absolute', left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,rgba(${aRgb},0.7),transparent)`, animation:'scanAnim 2.5s linear infinite', zIndex:2 }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 80%,rgba(3,12,8,0.5) 100%)', zIndex:1 }} />
                <div style={{ position:'absolute', inset:0, zIndex:1, backgroundImage:`linear-gradient(rgba(${aRgb},0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(${aRgb},0.03) 1px,transparent 1px)`, backgroundSize:'40px 40px' }} />
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid rgba(${aRgb},0.15)` }}>
                <div style={{ fontFamily:'Space Mono, monospace', fontSize:9, color:a, letterSpacing:'0.1em', fontWeight:'bold' }}>{cartesActives[0].titre.toUpperCase()}</div>
                <div style={{ display:'flex', gap:16 }}>
                  {cartesActives[0].stats.map((s, si) => (
                    <div key={si} style={{ fontFamily:'Space Mono, monospace', fontSize:8, color: si===0 ? `rgba(${aRgb},0.9)` : `rgba(${aRgb},0.5)`, letterSpacing:'0.1em' }}>{si===0 ? '▶ ' : ''}{s}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {photoFrejusVisible && (
          <div style={{ position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)', zIndex: 45, width: 200, opacity: 0, animation: 'fadeInDown 0.6s ease forwards' }}>
            <div style={{ position: 'relative', background: 'rgba(4,6,5,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: `1px solid ${a}`, borderRadius: '14px', overflow: 'hidden', boxShadow: `0 0 40px rgba(${aRgb},0.25), 0 0 80px rgba(${aRgb},0.1), inset 0 1px 0 rgba(${aRgb},0.15)` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${a},transparent)`, zIndex: 3 }} />
              {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h],i) => (
                <div key={i} style={{ position:'absolute', [v]:6, [h]:6, width:12, height:12, [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]:`2px solid ${a}`, [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]:`2px solid ${a}`, zIndex:4 }} />
              ))}
              <div style={{ padding: '8px 14px', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: `rgba(${aRgb},0.06)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: a, letterSpacing: '0.22em', textTransform: 'uppercase' }}>FRÉJUS KOUADIO</span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: a, boxShadow: `0 0 6px ${a}`, animation: 'pulse 1.5s infinite' }} />
              </div>
              <div style={{ width: '100%', height: 280, position: 'relative', overflow: 'hidden', background: '#000' }}>
                <img src="/captures/frejus3.jpg" alt="Fréjus Kouadio" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block', filter: 'contrast(1.05) brightness(1.02)' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.6),transparent)`, animation: 'scanAnim 3s linear infinite', zIndex: 2 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 55%,rgba(4,6,5,0.85) 100%)', zIndex: 1 }} />
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: `linear-gradient(rgba(${aRgb},0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(${aRgb},0.03) 1px,transparent 1px)`, backgroundSize: '30px 30px' }} />
                <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, color: '#ffffff', letterSpacing: '0.08em', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>Fréjus Kouadio</div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: a, letterSpacing: '0.18em', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>DEV FULLSTACK · IA</div>
                </div>
              </div>
              <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', borderTop: `1px solid rgba(${aRgb},0.1)` }}>
                {[
                  { Icon: MapPin, label: 'Yamoussoukro' },
                  { Icon: Briefcase, label: 'Freelance' },
                  { Icon: Zap, label: 'IA · React' }
                ].map(({ Icon, label }, i) => (
                  <div key={i} style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: i === 0 ? a : `rgba(${aRgb},0.55)`, letterSpacing: '0.08em', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <Icon size={11} color={i === 0 ? a : `rgba(${aRgb},0.55)`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#050505', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes slideFromLeft {
          from { opacity: 0; transform: translateX(-24px) translateY(-50%); }
          to   { opacity: 1; transform: translateX(0px)  translateY(-50%); }
        }
        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(184px) translateY(-50%); }
          to   { opacity: 1; transform: translateX(160px) translateY(-50%); }
        }
        @keyframes scanAnim {
          from { top: 0%; }
          to   { top: 100%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(${aRgb},0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(${aRgb},0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      <div style={{ position:'absolute', inset:0, zIndex:0, background:'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)', pointerEvents:'none' }} />

      <div style={{ position: 'absolute', left: 0, right: 0, height: 1, zIndex: 1, top: 0, background: `linear-gradient(90deg, transparent, rgba(${aRgb},0.12), transparent)`, animation: 'scanAnim 6s linear infinite' }} />

      <svg width="28" height="28" style={{position:'absolute',top:0,left:0,zIndex:10}} viewBox="0 0 28 28">
        <path d="M0 28 L0 0 L28 0" fill="none" stroke={`rgba(${aRgb},0.4)`} strokeWidth="1"/>
      </svg>
      <svg width="28" height="28" style={{position:'absolute',top:0,right:0,zIndex:10}} viewBox="0 0 28 28">
        <path d="M0 0 L28 0 L28 28" fill="none" stroke={`rgba(${aRgb},0.4)`} strokeWidth="1"/>
      </svg>
      <svg width="28" height="28" style={{position:'absolute',bottom:0,left:0,zIndex:10}} viewBox="0 0 28 28">
        <path d="M0 0 L0 28 L28 28" fill="none" stroke={`rgba(${aRgb},0.4)`} strokeWidth="1"/>
      </svg>
      <svg width="28" height="28" style={{position:'absolute',bottom:0,right:0,zIndex:10}} viewBox="0 0 28 28">
        <path d="M28 0 L28 28 L0 28" fill="none" stroke={`rgba(${aRgb},0.4)`} strokeWidth="1"/>
      </svg>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, background: 'rgba(0,0,0,0.75)', borderBottom: `1px solid rgba(${aRgb},0.12)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Mono, monospace', color: 'rgba(255,255,255,0.25)' }}>
            <span>&lt;</span>
            <span style={{ color: a }}>/DevJ</span>
            <span>&gt;</span>
            <div style={{ width: 1, height: 20, background: '#2d2d2d' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px', border: `1px solid rgba(${aRgb},0.3)`, color: a, textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.25em' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 9999, background: a, animation: 'pulse 1.4s infinite' }} />
              <span style={{ borderRadius: '20px', padding: '3px 8px' }}>EN LIGNE</span>
            </div>
            <div style={{ marginLeft: 8, fontFamily: 'Space Mono, monospace', fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>{dateStr}</div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setModeVocal((prev) => !prev)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid', borderColor: modeVocal ? a : `rgba(${aRgb},0.25)`, background: modeVocal ? `rgba(${aRgb},0.15)` : 'transparent', color: modeVocal ? '#ffffff' : a, padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: '6px', transition: 'all .2s' }}>
              <Volume2 size={12} />
              <span>AUDIO</span>
            </button>
            {/* Mode PARLER */}
            <div
              className={`mode-item ${modeParler ? 'actif' : ''}`}
              onClick={toggleParler}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid', borderColor: modeParler ? a : `rgba(${aRgb},0.25)`, background: modeParler ? `rgba(${aRgb},0.15)` : 'transparent', color: modeParler ? '#ffffff' : a, padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: '6px', transition: 'all .2s' }}
            >
              <span className="mode-label">
                {ecoute ? '⬤ ÉCOUTE' : 'PARLER'}
              </span>
              <span className={`mode-toggle ${modeParler ? 'on' : 'off'}`}>
                {modeParler ? 'ON' : 'OFF'}
              </span>
            </div>
            <button onClick={() => setModeChat((prev) => !prev)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid', borderColor: modeChat ? a : `rgba(${aRgb},0.25)`, background: modeChat ? `rgba(${aRgb},0.15)` : 'transparent', color: modeChat ? '#ffffff' : 'rgba(255,255,255,0.3)', padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: '6px', transition: 'all .2s' }}>
              <span>TEXTE</span>
            </button>
            <div style={{ width: 1, height: 20, background: '#2d2d2d' }} />
            <button onClick={() => setModePortfolio(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid rgba(${aRgb},0.25)`, background: `rgba(${aRgb},0.05)`, color: a, padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: '6px', transition: 'all .2s' }}>
              <Layout size={12} />
              <span>PORTFOLIO</span>
            </button>
            <button onClick={() => naviguer('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(255,100,100,0.08)', background: 'rgba(255,100,100,0.05)', color: 'rgba(255,100,100,0.35)', padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: '6px', transition: 'all .2s' }}>
              <RotateCcw size={12} />
              <span>RESET</span>
            </button>
          </div>
        </div>

        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'Space Mono, monospace', fontSize: 19, color: a }}>{heure}</div>
      </div>

<div style={{ position:'absolute', left:200, top:'50%', transform:'translateY(-50%)', zIndex:8, display:'flex', alignItems:'center', gap:8, pointerEvents:'none' }}>
          <div style={{width:3,height:3,borderRadius:'50%', background:`rgba(${aRgb},0.4)`}}/>
          <div style={{width:40,height:1, background:`linear-gradient(90deg,rgba(${aRgb},0.25),transparent)`, opacity:0.7}}/>
          <div style={{fontSize:7,color:`rgba(${aRgb},0.4)`, letterSpacing:'0.15em'}}>NEURAL_LINK</div>
        </div>
        <div style={{ position:'absolute', right:200, top:'50%', transform:'translateY(-50%)', zIndex:8, display:'flex', alignItems:'center', gap:8, flexDirection:'row-reverse', pointerEvents:'none' }}>
          <div style={{width:3,height:3,borderRadius:'50%', background:`rgba(${aRgb},0.4)`}}/>
          <div style={{width:40,height:1, background:`linear-gradient(270deg,rgba(${aRgb},0.25),transparent)`, opacity:0.7}}/>
          <div style={{fontSize:7,color:`rgba(${aRgb},0.4)`, letterSpacing:'0.15em'}}>SYNC_OK</div>
        </div>
        <div style={{ position: 'absolute', left: '50%', top: 90, bottom: 90, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <AvatarStable etat={aiState} />

        <div style={{ marginTop: 16, fontFamily: 'Space Mono, monospace', fontSize: 9, color: `rgba(${aRgb},0.5)`, letterSpacing: '0.22em', textAlign: 'center' }}>
          <div>// FRÉJUS KOUADIO</div>
          <div>DEV FULLSTACK · IA</div>
        </div>

        <div style={{ marginTop: 10, fontFamily: 'Space Mono, monospace', fontSize: 9, color: aiState === 'idle' ? `rgba(${aRgb},0.4)` : a, textAlign: 'center' }}>
          <span>
            {aiState === 'idle' ? '// EN ATTENTE' : 
             aiState === 'thinking' ? '// TRAITEMENT...' : 
             '// EN TRAIN DE PARLER'}
          </span>
        </div>
      </div>

      {bulleVisible && (modeChat || !modeVocal) && (
        <div style={{ position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)', width: 380, zIndex: 25, opacity: bulleVisible ? 1 : 0, transition: 'opacity 0.4s' }}>
          <div style={{ position: 'relative', background: 'rgba(3,3,3,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '14px', border: `1px solid rgba(${aRgb},0.1)`, padding: '16px 20px', fontFamily: 'Syne, sans-serif', color: '#fff' }}>
            <div style={{ position:'absolute',top:0,left:20,right:20,height:1, background:`linear-gradient(90deg,transparent,rgba(${aRgb},0.22),transparent)` }} />
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: a, letterSpacing: '0.25em', marginBottom: 8 }}>AXIS // TRANSMISSION</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{dernierMessage}</div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: 16, top: 90, zIndex: 10, width: 150, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, letterSpacing: '0.3em', textTransform: 'uppercase', paddingBottom: 8, borderBottom: `1px solid rgba(${aRgb},0.08)`, marginBottom: 10 }}>// SYSTÈME</div>
        <div style={{ border: `1px solid rgba(${aRgb},0.14)`, background: `rgba(${aRgb},0.05)`, padding: '10px 12px', marginBottom: '6px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:1, background:`linear-gradient(90deg,transparent,rgba(${aRgb},0.18),transparent)` }} />
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.25em', color: `rgba(${aRgb},0.55)`, marginBottom: 6 }}>VISITEUR</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: a }}>{visiteur.prenom || '—'}</div>
        </div>
        <div style={{ border: `1px solid rgba(${aRgb},0.14)`, background: `rgba(${aRgb},0.05)`, padding: '10px 12px', marginBottom: '6px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:1, background:`linear-gradient(90deg,transparent,rgba(${aRgb},0.18),transparent)` }} />
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.25em', color: `rgba(${aRgb},0.55)`, marginBottom: 6 }}>PROFIL</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: a }}>{(() => {
            const map = {
              recruiter: 'RECRUTEUR',
              client: 'CLIENT',
              collaborateur: 'COLLABORATEUR',
              curieux: 'CURIEUX'
            }
            return map[visiteur.profession] || visiteur.profession?.toUpperCase() || '—'
          })()}</div>
        </div>
        <div style={{ border: `1px solid rgba(${aRgb},0.14)`, background: `rgba(${aRgb},0.05)`, padding: '10px 12px', marginBottom: '6px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:1, background:`linear-gradient(90deg,transparent,rgba(${aRgb},0.18),transparent)` }} />
          <div style={{ width: 8, height: 8, borderRadius: 9999, background: a, animation: 'pulse 1.4s infinite', position:'relative', zIndex:1 }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.25em', color: `rgba(${aRgb},0.55)`, marginBottom: 4 }}>STATUT</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: a }}>● CONNECTÉ</div>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 6 }}>NAVIGATION RAPIDE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['> voir le portfolio', '> mes projets', '> me contacter', '> mon parcours'].map((cmd) => (
              <div key={cmd} onClick={() => envoyerCommande(cmd)} style={{ display: 'flex', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '5px 0', fontFamily: 'Space Mono, monospace', fontSize: 8, color: `rgba(${aRgb},0.55)`, cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = a} onMouseLeave={(e) => e.currentTarget.style.color = `rgba(${aRgb},0.55)`}>
                {cmd.replace('>', '›')}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', right: 16, top: 90, zIndex: 10, width: 150, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, letterSpacing: '0.3em', textTransform: 'uppercase', paddingBottom: 8, borderBottom: `1px solid rgba(${aRgb},0.08)`, marginBottom: 10 }}>// MODES</div>
        <button onClick={() => setModeVocal((prev) => !prev)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: modeVocal ? `rgba(${aRgb},0.4)` : 'rgba(255,255,255,0.08)', background: modeVocal ? `rgba(${aRgb},0.07)` : 'rgba(255,255,255,0.015)', color: modeVocal ? a : 'rgba(255,255,255,0.35)', padding: '6px 8px', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', borderRadius: '8px' }}>
          <span>VOCAL</span>
          <span style={{ width: 20, height: 10, border: `1px solid ${a}`, position: 'relative' }}>
            <span style={{ position: 'absolute', top: 1, left: modeVocal ? 10 : 2, width: 6, height: 6, background: modeVocal ? a : `rgba(${aRgb},0.3)`, transition: 'left 0.2s' }} />
          </span>
        </button>
        <button onClick={() => setModeChat((prev) => !prev)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: modeChat ? `rgba(${aRgb},0.4)` : 'rgba(255,255,255,0.08)', background: modeChat ? `rgba(${aRgb},0.07)` : 'rgba(255,255,255,0.015)', color: modeChat ? a : 'rgba(255,255,255,0.35)', padding: '6px 8px', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', borderRadius: '8px' }}>
          <span>CHAT</span>
          <span style={{ width: 20, height: 10, border: `1px solid ${a}`, position: 'relative' }}>
            <span style={{ position: 'absolute', top: 1, left: modeChat ? 10 : 2, width: 6, height: 6, background: modeChat ? a : `rgba(${aRgb},0.3)`, transition: 'left 0.2s' }} />
          </span>
        </button>
        <button onClick={() => setModePortfolio(true)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: modePortfolio ? `rgba(${aRgb},0.4)` : 'rgba(255,255,255,0.08)', background: modePortfolio ? `rgba(${aRgb},0.07)` : 'rgba(255,255,255,0.015)', color: `rgba(${aRgb},0.35)`, padding: '6px 8px', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', borderRadius: '8px' }}>
          <span>PORTFOLIO</span>
          <span style={{ width: 20, height: 10, border: `1px solid ${a}`, position: 'relative' }}>
            <span style={{ position: 'absolute', top: 1, left: 2, width: 6, height: 6, background: `rgba(${aRgb},0.3)` }} />
          </span>
        </button>
        <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 8, background: `rgba(${aRgb},0.02)`, border: `1px solid rgba(${aRgb},0.07)` }}>
          <div style={{fontSize:7,color:`rgba(${aRgb},0.3)`, letterSpacing:'0.25em',marginBottom:8}}>SYS_STATUS</div>
          {[['MODÈLE','GROQ'],['SESSION','ACTIVE'],['VOIX','FR-FR']].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between', fontSize:7,marginBottom:4}}>
              <span style={{color:'rgba(255,255,255,0.3)'}}>{k}</span>
              <span style={{color:`rgba(${aRgb},0.85)`}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {modePortfolio && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 50,
          overflow: 'hidden'
        }}>
          <Portfolio ref={portfolioRef} onClose={() => setModePortfolio(false)} />

          <div style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 52,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}>
            {/* Bouton glassmorphique pour masquer/afficher l'avatar */}
            <div
              onClick={() => setModePortfolio(false)}
              title="Fermer le portfolio"
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '50%',
                overflow: 'hidden',
                width: 120,
                height: 120,
                background: 'rgba(5,5,5,0.45)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: 'none',
                boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'box-shadow 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.5)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4)`
              }}
            >
              {/* Anneau animé selon l'état */}
              <div style={{
                position: 'absolute',
                inset: -2,
                borderRadius: '50%',
                border: `1px solid rgba(${aRgb},${aiState !== 'idle' ? '0.5' : '0.15'})`,
                animation: aiState !== 'idle' ? 'pulse 1.4s infinite' : 'none',
                pointerEvents: 'none',
              }} />
              <AvatarStable etat={aiState} width={110} height={110} />
            </div>

            {/* Statut sous l'avatar */}
            <div style={{
              marginTop: 8,
              fontFamily: 'Space Mono, monospace',
              fontSize: 8,
              color: aiState === 'idle' ? `rgba(${aRgb},0.35)` : a,
              letterSpacing: '0.15em',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
              padding: '4px 10px',
              borderRadius: 20,
              border: `1px solid rgba(${aRgb},0.1)`,
            }}>
              {aiState === 'idle' ? '● EN ATTENTE' : 
               aiState === 'thinking' ? '◌ TRAITEMENT' : 
               '◉ EN PAROLE'}
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', width: 480, zIndex: 20 }}>
        <div style={{
          fontFamily: 'Space Mono, monospace', fontSize: 8,
          color: `rgba(${aRgb},0.38)`, letterSpacing: '0.2em',
          marginBottom: 4, textAlign: 'center'
        }}>
          ENTRÉE_DIRECTE // {estEnChargement ? 'TRAITEMENT...' : 'EN_ATTENTE...'}
        </div>

        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.25em', color: `rgba(${aRgb},0.22)`, marginBottom: 6 }}>ENTRÉE DE COMMANDE</div>
        <div style={{
          display: modeParler ? 'none' : 'flex', alignItems: 'center',
          border: `1px solid rgba(${aRgb},0.15)`,
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '12px',
          backdropFilter: 'blur(16px)'
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
              color: '#fff', caretColor: a
            }}
          />
          <button onClick={soumettre} style={{
            padding: '10px 16px',
            border: 'none',
            borderLeft: `1px solid rgba(${aRgb},0.2)`,
            background: `rgba(${aRgb},0.06)`,
            color: a, cursor: 'pointer',
            borderRadius: '0 12px 12px 0'
          }}>
            <Send size={13} color={a} />
          </button>
        </div>
        {modeParler && (
          <div style={{
            textAlign: 'center',
            color: `rgba(${aRgb},0.7)`,
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

      {cartesActives.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translateX(160px) translateY(-50%)',
          zIndex: 40,
          width: 260,
          opacity: 0,
          animation: 'slideFromRight 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
          cursor: 'pointer',
        }}
        onClick={() => {
          setModePortfolio(true)
          setTimeout(() => {
            if (portfolioRef.current) {
              const sectionMap = {
                projets:     'projects',
                competences: 'skills',
                contact:     'contact',
                parcours:    'about',
              }
              const cible = sectionMap[cartesActives[0].id] || 'hero'
              portfolioRef.current.naviguerVers(cible)
            }
          }, 400)
          setCartesActives([])
        }}
        >
          <div style={{
            border: `1px solid ${a}`,
            background: 'rgba(3,12,8,0.97)',
            boxShadow: `0 0 40px rgba(${aRgb},0.3), 0 0 80px rgba(${aRgb},0.1)`,
            backdropFilter: 'blur(16px)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow=`0 0 60px rgba(${aRgb},0.5), 0 0 100px rgba(${aRgb},0.2)`}
          onMouseLeave={e => e.currentTarget.style.boxShadow=`0 0 40px rgba(${aRgb},0.3), 0 0 80px rgba(${aRgb},0.1)`}
          >
            {/* Coins HUD */}
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h],i) => (
              <div key={i} style={{
                position:'absolute', [v]:0, [h]:0, width:14, height:14,
                [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]:`2px solid ${a}`,
                [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]:`2px solid ${a}`,
                zIndex:3,
              }} />
            ))}

            {/* Header */}
            <div style={{
              padding: '8px 16px',
              borderBottom: `1px solid rgba(${aRgb},0.25)`,
              background: `rgba(${aRgb},0.07)`,
              fontFamily: 'Space Mono, monospace',
              fontSize: 8, color: a,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{cartesActives[0].label}</span>
              <span style={{ fontSize: 10, color: `rgba(${aRgb},0.5)` }}>→</span>
            </div>

            {/* Image pleine largeur */}
            <div style={{
              width: '100%', height: 200,
              position: 'relative', overflow: 'hidden',
              background: '#000',
            }}>
              <img
                src={cartesActives[0].image}
                alt={cartesActives[0].titre}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  opacity: 1,
                  display: 'block',
                }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              {/* Scan line animée */}
              <div style={{
                position:'absolute', left:0, right:0, height:2,
                background:`linear-gradient(90deg,transparent,rgba(${aRgb},0.7),transparent)`,
                animation:'scanAnim 2.5s linear infinite',
                zIndex:2,
              }} />
              {/* Vignette légère en bas */}
              <div style={{
                position:'absolute', inset:0,
                background:'linear-gradient(180deg,transparent 80%,rgba(3,12,8,0.5) 100%)',
                zIndex:1,
              }} />
              {/* Overlay grille très légère */}
              <div style={{
                position:'absolute', inset:0, zIndex:1,
                backgroundImage:`linear-gradient(rgba(${aRgb},0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(${aRgb},0.03) 1px,transparent 1px)`,
                backgroundSize:'40px 40px',
              }} />
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: `1px solid rgba(${aRgb},0.15)`,
            }}>
              <div style={{
                fontFamily:'Space Mono, monospace',
                fontSize:9, color:a,
                letterSpacing:'0.1em', fontWeight:'bold',
              }}>
                {cartesActives[0].titre.toUpperCase()}
              </div>
              <div style={{ display:'flex', gap:16 }}>
                {cartesActives[0].stats.map((s, si) => (
                  <div key={si} style={{
                    fontFamily:'Space Mono, monospace', fontSize:8,
                    color: si===0 ? `rgba(${aRgb},0.9)` : `rgba(${aRgb},0.5)`,
                    letterSpacing:'0.1em',
                  }}>
                    {si===0 ? '▶ ' : ''}{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {photoFrejusVisible && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translateX(160px) translateY(-50%)',
            zIndex: 45,
            width: 220,
            animation: 'slideFromRight 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
            opacity: 0,
          }}
        >
          <div style={{
            position: 'relative',
            background: 'rgba(4,6,5,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${theme.accent}`,
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: `0 0 40px rgba(${theme.accentRgb},0.25), 
                  0 0 80px rgba(${theme.accentRgb},0.1),
                  inset 0 1px 0 rgba(${theme.accentRgb},0.15)`,
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg,transparent,${theme.accent},transparent)`,
              zIndex: 3,
            }} />
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h],i) => (
              <div key={i} style={{
                position:'absolute', [v]:6, [h]:6, width:12, height:12,
                [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]:`2px solid ${theme.accent}`,
                [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]:`2px solid ${theme.accent}`,
                zIndex:4,
              }} />
            ))}
            <div style={{
              padding: '8px 14px',
              borderBottom: `1px solid rgba(${theme.accentRgb},0.15)`,
              background: `rgba(${theme.accentRgb},0.06)`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 8, color: theme.accent,
                letterSpacing: '0.22em', textTransform: 'uppercase',
              }}>FRÉJUS KOUADIO</span>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: theme.accent,
                boxShadow: `0 0 6px ${theme.accent}`,
                animation: 'pulse 1.5s infinite',
              }} />
            </div>
            <div style={{
              width: '100%',
              height: 280,
              position: 'relative',
              overflow: 'hidden',
              background: '#000',
            }}>
              <img
                src="/captures/frejus3.jpg"
                alt="Fréjus Kouadio"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  display: 'block',
                  filter: 'contrast(1.05) brightness(1.02)',
                }}
              />
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg,transparent,rgba(${theme.accentRgb},0.6),transparent)`,
                animation: 'scanAnim 3s linear infinite',
                zIndex: 2,
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg,transparent 55%,rgba(4,6,5,0.85) 100%)',
                zIndex: 1,
              }} />
              <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                backgroundImage: `linear-gradient(rgba(${theme.accentRgb},0.03) 1px,transparent 1px),
                  linear-gradient(90deg,rgba(${theme.accentRgb},0.03) 1px,transparent 1px)`,
                backgroundSize: '30px 30px',
              }} />
              <div style={{
                position: 'absolute', bottom: 12, left: 12, right: 12,
                zIndex: 3,
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <div style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 11, fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.08em',
                  textShadow: '0 1px 8px rgba(0,0,0,0.8)',
                }}>Fréjus Kouadio</div>
                <div style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 8, color: theme.accent,
                  letterSpacing: '0.18em',
                  textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                }}>DEV FULLSTACK · IA</div>
              </div>
            </div>
            <div style={{
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: `1px solid rgba(${theme.accentRgb},0.1)`,
            }}>
              {[
                { Icon: MapPin, label: 'Yamoussoukro' },
                { Icon: Briefcase, label: 'Freelance' },
                { Icon: Zap, label: 'IA · React' },
              ].map(({ Icon, label }, i) => (
                <div key={i} style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 7,
                  color: i === 0 ? theme.accent : `rgba(${theme.accentRgb},0.55)`,
                  letterSpacing: '0.08em',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3,
                }}>
                  <Icon size={12} color={i === 0 ? theme.accent : `rgba(${theme.accentRgb},0.55)`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: -50,
            width: 50,
            height: 1,
            background: `linear-gradient(270deg,rgba(${theme.accentRgb},0.4),transparent)`,
            transform: 'translateY(-50%)',
          }} />
        </div>
      )}
      <div style={{ position: 'fixed', bottom: isMobile ? 80 : 16, right: isMobile ? 8 : 16, zIndex: 30 }}>
        <PanneauParametres />
      </div>
    </div>
  )
}
