import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, onAuthStateChanged, getIdToken } from 'firebase/auth'
import {
  doc, getDoc
} from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import {
  listerProjets, creerProjet, modifierProjet, supprimerProjet,
  listerCompetences, creerCompetence, modifierCompetence, supprimerCompetence,
} from '@/services/portfolioAdmin'
import utiliserTheme from '@/store/utiliserTheme'
import AvatarParticulaire from '@/composants/ui/AvatarParticulaire'
import PanneauParametres from '@/composants/ui/PanneauParametres'
import { Volume2, Mic, MessageSquare, LayoutGrid, Radio, BarChart3, SlidersHorizontal, FolderKanban, Star, Settings2 } from 'lucide-react'

const PROJETS_DEFAUT_A_IMPORTER = [
  { titre: 'Eliko Voyage', categorie: 'Agence de voyage', type: 'frontend', tags: ['HTML/CSS', 'JavaScript', 'React'], desc: "Interface moderne pour agence de voyage permettant la réservation en ligne et la gestion de séjours personnalisés.", img: '/asset/eliko.PNG', lien: 'https://devj-58.github.io/eliko_voyage/', annee: '2024', status: 'EN LIGNE', ordre: 0 },
  { titre: 'SanteAI', categorie: 'Télémédecine & IA', type: 'ia', tags: ['React', 'Google AI', 'Python'], desc: "Plateforme de télémédecine avec IA intégrée, consultations vidéo et gestion de dossiers médicaux.", img: '/asset/santeAI.jpg', lien: 'https://devpost.com/software/santeai', annee: '2024', status: 'EN LIGNE', ordre: 1 },
  { titre: 'Bibliothèque UIYA', categorie: 'Application éducative', type: 'fullstack', tags: ['HTML', 'CSS', 'JavaScript'], desc: "Système complet de gestion de bibliothèque déployé pour l'Université Internationale de Yamoussoukro.", img: '/asset/uiya.PNG', lien: 'https://bibliotheque.igl-uiya.com/', annee: '2024', status: 'EN PRODUCTION', ordre: 2 },
  { titre: 'GSB — Gestion de Stock', categorie: 'Application de gestion', type: 'fullstack', tags: ['PHP', 'Laravel', 'MySQL'], desc: "Application full-stack de gestion d'inventaire avec alertes automatiques et rapports exportables.", img: '/asset/GSB.jpg', lien: null, annee: '2023', status: 'PRIVÉ', ordre: 3 },
  { titre: 'ZikmuCI', categorie: 'Culture ivoirienne', type: 'impact', tags: ['HTML5', 'CSS3', 'JavaScript'], desc: "Plateforme musicale ivoirienne célébrant le Coupé-Décalé, Zouglou et l'Afrobeat.", img: '/asset/zikmu.jpg', lien: 'https://devj-58.github.io/ZikmuCi/index.html', annee: '2023', status: 'EN LIGNE', ordre: 4 },
  { titre: 'Terasse', categorie: 'Sensibilisation environnement', type: 'impact', tags: ['HTML', 'CSS', 'JavaScript'], desc: "Site de sensibilisation au changement climatique en Côte d'Ivoire.", img: '/asset/terasse.jpg', lien: 'https://terasse-ivoire.vercel.app', annee: '2023', status: 'EN LIGNE', ordre: 5 },
]

const COMPETENCES_DEFAUT_A_IMPORTER = [
  { cat: 'Frontend', ordre: 0, items: [{ nom: 'HTML5', pct: 95 }, { nom: 'CSS3', pct: 90 }, { nom: 'JavaScript', pct: 85 }, { nom: 'React', pct: 80 }, { nom: 'TypeScript', pct: 75 }, { nom: 'Bootstrap', pct: 90 }, { nom: 'GSAP', pct: 75 }] },
  { cat: 'Backend', ordre: 1, items: [{ nom: 'PHP', pct: 85 }, { nom: 'Laravel', pct: 80 }] },
  { cat: 'IA & ML', ordre: 2, items: [{ nom: 'Python', pct: 70 }, { nom: 'TensorFlow', pct: 65 }, { nom: 'NLP', pct: 60 }] },
  { cat: 'Outils', ordre: 3, items: [{ nom: 'Git & GitHub', pct: 90 }, { nom: 'Figma', pct: 85 }, { nom: 'Canva', pct: 88 }, { nom: 'Docker', pct: 60 }] },
]

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
  // Mode collecte de prompt — AXIS attend des instructions
  const [modeCollectePrompt, setModeCollectePrompt] = useState(false)
  const [promptsHistorique, setPromptsHistorique] = useState([])
  useEffect(() => { /* promptsHistorique kept for prompt history UI */ }, [promptsHistorique])
  const [, setPromptEnCours] = useState('')
  const promptEnCoursRef = useRef('')
  const [promptSysteme, setPromptSysteme] = useState('')
  const [promptSystemeSauvegarde, setPromptSystemeSauvegarde] = useState(false)
  const [ongletPrompt, setOngletPrompt] = useState('additionnel')
  const [axisTyping, setAxisTyping] = useState(false)
  const [modeVocal, setModeVocal] = useState(true)
  const [modeChat, setModeChat] = useState(false)
  const [modeParler, setModeParler] = useState(false)
  const [ecoute, setEcoute] = useState(false)
  const [splash, setSplash] = useState(true)
  const [messageTypewriter, setMessageTypewriter] = useState('')
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768 && window.innerWidth < 1100)
  const [drawerOuvert, setDrawerOuvert] = useState(false)
  const [projetsListe, setProjetsListe] = useState([])
  const [competencesListe, setCompetencesListe] = useState([])
  const [chargementPortfolio, setChargementPortfolio] = useState(false)
  const [projetEnEdition, setProjetEnEdition] = useState(null)
  const [competenceEnEdition, setCompetenceEnEdition] = useState(null)
  const [portfolioSauvegarde, setPortfolioSauvegarde] = useState(false)
  const [importEnCours, setImportEnCours] = useState(false)
  const [importReussi, setImportReussi] = useState(false)
  const [parametresOuverts, setParametresOuverts] = useState(false)
  const [labelTemporaire, setLabelTemporaire] = useState(null)
  const [competenceDeplieMobile, setCompetenceDeplieMobile] = useState(null)
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

  // ── Sessions (polling REST) ──
  useEffect(() => {
    async function chargerSessions() {
      try {
        // Récupérer le token auth de l'utilisateur connecté
        const currentUser = auth.currentUser
        if (!currentUser) {
          setChargement(false)
          return
        }
        const token = await getIdToken(currentUser)

        const FIREBASE_PROJECT = import.meta.env.VITE_FIREBASE_PROJECT_ID
        const BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`

        const res = await fetch(
          `${BASE}/sessions_axis?pageSize=50`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }
        )
        const json = await res.json()
        if (!json.documents) { setChargement(false); return }

        const data = json.documents.map(d => {
          const f = d.fields || {}
          const parts = d.name.split('/')
          const id = parts[parts.length - 1]

          const historique = (f.historique?.arrayValue?.values || []).map(v => ({
            role:    v.mapValue?.fields?.role?.stringValue || '',
            contenu: v.mapValue?.fields?.contenu?.stringValue || '',
          }))

          return {
            id,
            prenom_visiteur:  f.prenom_visiteur?.stringValue || '—',
            profil_visiteur:  f.profil_visiteur?.stringValue || '—',
            nb_messages:      parseInt(f.nb_messages?.integerValue || 0),
            duree_secondes:   parseInt(f.duree_secondes?.integerValue || 0),
            demande_contact:  f.demande_contact?.booleanValue || false,
            demande_cv:       f.demande_cv?.booleanValue || false,
            historique,
            created_at: f.created_at?.stringValue
              ? { toDate: () => new Date(f.created_at.stringValue) }
              : null,
          }
        })

        // Trier par date décroissante
        data.sort((a, b) => {
          const da = a.created_at?.toDate() || new Date(0)
          const db2 = b.created_at?.toDate() || new Date(0)
          return db2 - da
        })

        setSessions(data)
        setChargement(false)
      } catch(e) {
        console.warn('[Dashboard REST] Erreur:', e)
        setChargement(false)
      }
    }

    chargerSessions()
    const interval = setInterval(chargerSessions, 15000)
    return () => clearInterval(interval)
  }, [])

  // ── Prompt actuel ──
  useEffect(() => {
    async function charger() {
      try {
        const snap = await getDoc(doc(db, 'config_axis', 'prompt_principal'))
        if (snap.exists()) setPromptTexte(snap.data().contenu || '')

        // Charger le prompt système principal (indépendant)
        try {
          const snapSysteme = await getDoc(doc(db, 'config_axis', 'prompt_systeme'))
          if (snapSysteme.exists()) setPromptSysteme(snapSysteme.data().contenu || '')
          else setPromptSysteme('')
        } catch(e) { console.warn('[prompt_systeme]', e) }

        // Charger aussi l'historique des versions (indépendant)
        try {
          const FIREBASE_PROJECT = import.meta.env.VITE_FIREBASE_PROJECT_ID
          const currentUser = auth.currentUser
          if (currentUser) {
            const token = await getIdToken(currentUser)
            const res = await fetch(
              `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/historique_prompts?pageSize=20`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            )
            const json = await res.json()
            if (json.documents) {
              const hist = json.documents.map(d => {
                const f = d.fields || {}
                const parts = d.name.split('/')
                return {
                  id: parts[parts.length - 1],
                  contenu: f.contenu?.stringValue || '',
                  titre: f.titre?.stringValue || 'Sans titre',
                  created_at: f.created_at?.stringValue || '',
                }
              }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              setPromptsHistorique(hist)
            }
          }
        } catch(e) { console.warn('[Historique prompts]', e) }
      } catch(e) { console.warn(e) }
    }
    charger()
  }, [])

  async function sauvegarderPromptSysteme() {
    if (!promptSysteme || !promptSysteme.trim()) {
      console.warn('[PROMPT SYSTÈME] Rien à sauvegarder — contenu vide')
      return
    }
    try {
      const FIREBASE_PROJECT = import.meta.env.VITE_FIREBASE_PROJECT_ID
      const currentUser = auth.currentUser
      const token = currentUser ? await getIdToken(currentUser) : null

      // Utiliser PATCH REST pour contourner le blocage WebChannel
      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/config_axis/prompt_systeme?updateMask.fieldPaths=contenu&updateMask.fieldPaths=updated_at`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            fields: {
              contenu:    { stringValue: promptSysteme },
              updated_at: { stringValue: new Date().toISOString() },
            }
          })
        }
      )

      if (!res.ok) {
        const err = await res.json()
        console.error('[PROMPT SYSTÈME] Erreur REST:', err)
        return
      }

      setPromptSystemeSauvegarde(true)
      setTimeout(() => setPromptSystemeSauvegarde(false), 2500)
    } catch(e) {
      console.error('[prompt_systeme save REST]', e)
    }
  }

  // ── Scroll auto chat admin ──
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [historiqueAdmin])

  useEffect(() => {
    const handler = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1100)
    }
    handler()
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

  // ── Chargement portfolio (projets / competences) quand on sélectionne l'onglet
  useEffect(() => {
    if (onglet !== 'projets' && onglet !== 'competences') return
    let actif = true
    async function charger() {
      setChargementPortfolio(true)
      if (onglet === 'projets') {
        const data = await listerProjets()
        if (actif) setProjetsListe(data)
      } else {
        const data = await listerCompetences()
        if (actif) setCompetencesListe(data)
      }
      if (actif) setChargementPortfolio(false)
    }
    charger()
    return () => { actif = false }
  }, [onglet])

  // Handlers CRUD portfolio
  async function sauvegarderProjet(donnees) {
    const estNouveau = !donnees.id
    const resultat = estNouveau
      ? await creerProjet(donnees)
      : await modifierProjet(donnees.id, donnees)
    if (resultat) {
      const liste = await listerProjets()
      setProjetsListe(liste)
      setProjetEnEdition(null)
      setPortfolioSauvegarde(true)
      setTimeout(() => setPortfolioSauvegarde(false), 2000)
    }
  }

  async function retirerProjet(id) {
    const ok = await supprimerProjet(id)
    if (ok) setProjetsListe(prev => prev.filter(p => p.id !== id))
  }

  async function sauvegarderCompetence(donnees) {
    const estNouveau = !donnees.id
    const resultat = estNouveau
      ? await creerCompetence(donnees)
      : await modifierCompetence(donnees.id, donnees)
    if (resultat) {
      const liste = await listerCompetences()
      setCompetencesListe(liste)
      setCompetenceEnEdition(null)
      setPortfolioSauvegarde(true)
      setTimeout(() => setPortfolioSauvegarde(false), 2000)
    }
  }

  async function retirerCompetence(id) {
    const ok = await supprimerCompetence(id)
    if (ok) setCompetencesListe(prev => prev.filter(c => c.id !== id))
  }

  async function importerDonneesParDefaut() {
    if (importEnCours) return
    setImportEnCours(true)
    try {
      const projetsExistants = await listerProjets()
      const titresExistants = new Set(projetsExistants.map(p => (p.titre || '').toLowerCase().trim()))
      for (const p of PROJETS_DEFAUT_A_IMPORTER) {
        if (!titresExistants.has(p.titre.toLowerCase().trim())) {
          await creerProjet(p)
        }
      }

      const competencesExistantes = await listerCompetences()
      const catsExistantes = new Set(competencesExistantes.map(c => (c.cat || '').toLowerCase().trim()))
      for (const c of COMPETENCES_DEFAUT_A_IMPORTER) {
        if (!catsExistantes.has(c.cat.toLowerCase().trim())) {
          await creerCompetence(c)
        }
      }

      const nouveauxProjets = await listerProjets()
      const nouvellesCompetences = await listerCompetences()
      setProjetsListe(nouveauxProjets)
      setCompetencesListe(nouvellesCompetences)
      setImportReussi(true)
      setTimeout(() => setImportReussi(false), 3000)
    } catch (e) {
      console.warn('[importerDonneesParDefaut]', e)
    } finally {
      setImportEnCours(false)
    }
  }

  // Helpers hoisted pour AXIS
  async function sauvegarderPrompt(contenuOverride = null, titreOverride = null) {
    const contenu = contenuOverride || promptTexte
    const titre = titreOverride || `Prompt ${new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}`
    if (!contenu || !contenu.trim()) {
      console.warn('[PROMPT] Rien à sauvegarder — contenu vide')
      return
    }
    try {
      const FIREBASE_PROJECT = import.meta.env.VITE_FIREBASE_PROJECT_ID
      const currentUser = auth.currentUser
      const token = currentUser ? await getIdToken(currentUser) : null

      const token2 = auth.currentUser ? await getIdToken(auth.currentUser) : null
      await fetch(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/config_axis/prompt_principal?updateMask.fieldPaths=contenu&updateMask.fieldPaths=updated_at`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token2 ? { 'Authorization': `Bearer ${token2}` } : {}),
          },
          body: JSON.stringify({
            fields: {
              contenu:    { stringValue: contenu },
              updated_at: { stringValue: new Date().toISOString() },
            }
          })
        }
      )

      await fetch(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/historique_prompts?key=${import.meta.env.VITE_FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Authorization': token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: { contenu: { stringValue: contenu }, titre: { stringValue: titre }, created_at: { stringValue: new Date().toISOString() } } })
        }
      )

      setPromptsHistorique(prev => [{ id: Date.now().toString(), contenu, titre, created_at: new Date().toISOString() }, ...prev])
      setPromptTexte(contenu)
      setPromptSauvegarde(true)
      setTimeout(() => setPromptSauvegarde(false), 2500)
    } catch(e) { console.warn('[Sauvegarde prompt]', e) }
  }

  function formatDuree(s) { return s < 60 ? `${s}s` : `${Math.floor(s/60)}m${s%60}s` }

  function profilLabel(p) { return ({ recruiter: 'RECRUTEUR', client: 'CLIENT', collaborateur: 'COLLAB', curieux: 'CURIEUX' }[p] || '—') }

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

    // Construire le détail des sessions pour AXIS
    const detailSessions = sessions.slice(0, 10).map(s => {
      const dernierMsg = s.historique?.slice(-1)[0]?.contenu || 'aucun message'
      return `- ${s.prenom_visiteur} (${profilLabel(s.profil_visiteur)}) · ${s.nb_messages || 0} msg · ${formatDuree(s.duree_secondes || 0)} · ${s.demande_contact ? '⚡contact' : ''} ${s.demande_cv ? '⚡cv' : ''} · dernier msg: "${dernierMsg.slice(0, 80)}"`
    }).join('\n')

    const systemeCreateur = `
Tu es AXIS, l'IA du portfolio de Fréjus Kouadio.
Tu parles directement avec Fréjus — ton créateur — dans son tableau de bord privé.
Tu as accès à toutes les données réelles de ses visiteurs.

═══ STATISTIQUES GLOBALES ═══
- Sessions totales : ${stats.total}
- Messages échangés : ${stats.msgTotal}
- Recruteurs : ${stats.recruteurs}
- Clients : ${stats.clients}
- Curieux : ${stats.curieux}
- Collaborateurs : ${stats.collabs || 0}
- Demandes de contact : ${stats.demandesContact}
- Demandes de CV : ${stats.demandesCv}
- Durée moyenne : ${formatDuree(stats.dureeMoy)}

═══ DERNIÈRES SESSIONS (détail) ═══
${detailSessions || 'Aucune session encore.'}

═══ TON COMPORTEMENT ═══
- Tu connais les prénoms, profils et derniers messages des visiteurs
- Si Fréjus te demande "qui a vu le portfolio", donne les vrais prénoms et profils
- Si il demande "qui a demandé un contact", dis-lui exactement qui
- Si il demande "qu'est-ce qu'ils ont dit", cite les extraits réels
- Tu peux analyser les tendances, identifier les visiteurs les plus intéressants
- Tu parles à Fréjus comme un assistant de confiance — direct, humain, légèrement ivoirien
- Jamais de listes à puces, jamais de markdown. Conversation naturelle.
- 2 à 4 phrases maximum par réponse.
- Tu ne dis JAMAIS que les données sont anonymes — tu as accès à tout.
`

    // Détecter activation mode collecte prompt
    const motsModePrompt = [
      'mode prompt', 'on passe en mode prompt', 'je veux écrire un prompt',
      'prépare-toi pour des instructions', 'je vais te donner des instructions',
      'mode instruction', 'on passe aux instructions', 'reçois mes instructions',
    ]
    const motsSauvegarde = [
      'sauvegarde', 'enregistre', 'c\'est bon sauvegarde', 'tu peux sauvegarder',
      'sauvegarde ça', 'enregistre ça', 'c\'est tout sauvegarde',
      'termine et sauvegarde', 'valide et sauvegarde',
    ]

    if (motsModePrompt.some(m => msg.toLowerCase().includes(m))) {
      setModeCollectePrompt(true)
      setPromptEnCours('')
      promptEnCoursRef.current = ''
      const reponseMode = "C'est bon Fréjus, je suis en mode collecte d'instructions. Dis-moi tout ce que tu veux qu'AXIS sache ou fasse. Quand tu as terminé, dis-moi de sauvegarder."
      setHistoriqueAdmin(prev => [...prev, { role: 'axis', texte: reponseMode }])
      setAxisMessage(reponseMode)
      setAiState('speaking')
      setTimeout(() => setAiState('idle'), 2500)
      setAxisTyping(false)
      return
    }

    if (modeCollectePrompt && motsSauvegarde.some(m => msg.toLowerCase().includes(m))) {
      setModeCollectePrompt(false)
      const contenuFinal = promptEnCoursRef.current
      promptEnCoursRef.current = ''
      setPromptEnCours('')
      await sauvegarderPrompt(contenuFinal, `Prompt via AXIS — ${new Date().toLocaleDateString('fr-FR')}`)
      const reponseOk = `Parfait Fréjus, j'ai sauvegardé tes instructions. Elles s'appliquent dès maintenant aux prochaines conversations.`
      setHistoriqueAdmin(prev => [...prev, { role: 'axis', texte: reponseOk }])
      setAxisMessage(reponseOk)
      setAiState('speaking')
      setTimeout(() => setAiState('idle'), 2000)
      setAxisTyping(false)
      return
    }

    if (modeCollectePrompt) {
      // Accumuler les instructions sans appeler Groq
      const nouveau = promptEnCoursRef.current ? `${promptEnCoursRef.current}\n${msg}` : msg
      promptEnCoursRef.current = nouveau
      setPromptEnCours(nouveau)
      const reponseCollecte = "Reçu. Continue, je note tout. Dis-moi quand tu as fini."
      setHistoriqueAdmin(prev => [...prev, { role: 'axis', texte: reponseCollecte }])
      setAxisMessage(reponseCollecte)
      setAxisTyping(false)
      return
    }

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

  const statLabelSize = 'clamp(7px, 0.9vw, 9px)'
  const statValueSize = 'clamp(18px, 2.2vw, 30px)'
  const axisBubbleSize = 'clamp(11px, 1.1vw, 13px)'

  const boutonModeStyle = (actif) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: actif ? `rgba(${aRgb},0.15)` : 'transparent',
    border: `1px solid rgba(${aRgb},0.25)`,
    color: actif ? '#fff' : 'rgba(255,255,255,0.68)',
    borderRadius: 8,
    padding: isMobile ? '10px 12px' : '7px 12px',
    fontSize: 8,
    letterSpacing: '0.18em',
    cursor: 'pointer',
  })
  const onglets = ['axis', 'live', 'sessions', 'stats', 'prompt', 'projets', 'competences']
  const ongletLabels = {
    axis: '◎ AXIS',
    live: '● LIVE',
    sessions: '⊞ SESSIONS',
    stats: '∑ STATS',
    prompt: '✎ PROMPT',
    projets: '◆ PROJETS',
    competences: '★ COMPÉTENCES',
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
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? '220px 1fr' : '280px 1fr',
      gridTemplateRows: isMobile ? 'auto 1fr' : '60px 1fr',
    }}>
      <span style={{display: 'none'}}>{promptsHistorique.length}</span>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanAnim{from{top:0%}to{top:100%}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes scanLine{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
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
          position: 'relative',
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
            {/* Micro-ligne de statut avec curseur clignotant */}
            <div style={{ 
              fontSize: 6, 
              color: `rgba(${aRgb},0.35)`, 
              letterSpacing: '0.25em',
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}>
              SYSTÈME EN LIGNE
              <span style={{ animation: 'blink 1s infinite' }}>_</span>
            </div>
          </div>

          {/* Accès AXIS — sans fond, juste borderBottom hairline */}
          <div style={{ 
            padding: '12px 16px 12px',
            borderBottom: `1px solid rgba(${aRgb},0.08)`,
          }}>
            <button
              onClick={() => setOnglet('axis')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 0',
                borderRadius: 0,
                background: 'transparent',
                border: 'none',
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
                  color: '#fff',
                  letterSpacing: '0.1em', lineHeight: 1,
                }}>
                  AXIS
                </div>
                <div style={{
                  fontSize: 6,
                  color: `rgba(${aRgb},0.35)`,
                  letterSpacing: '0.18em',
                  marginTop: 3,
                }}>
                  {aiState === 'idle' ? 'EN ATTENTE' : aiState === 'thinking' ? 'TRAITEMENT...' : 'EN PAROLE'}
                </div>
              </div>
            </button>
          </div>

          {/* Liste des autres onglets — lignes indexées */}
          <div style={{
            flex: 1,
            padding: '8px 0',
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
          }}>
            {['live', 'sessions', 'stats', 'prompt', 'projets', 'competences'].map((o, idx) => {
              const icons = {
                live: Radio,
                sessions: LayoutGrid,
                stats: BarChart3,
                prompt: SlidersHorizontal,
                projets: FolderKanban,
                competences: Star,
              }
              const IconComponent = icons[o]
              const isActive = onglet === o
              
              return (
                <button
                  key={o}
                  onClick={() => setOnglet(o)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: isActive ? a : 'rgba(255,255,255,0.3)',
                    padding: '10px 16px',
                    fontSize: 8, 
                    letterSpacing: '0.18em',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 180ms',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 10,
                    position: 'relative',
                    borderBottom: idx < 5 ? `1px solid rgba(${aRgb},0.05)` : 'none',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.color = `rgba(${aRgb},0.6)`
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
                  }}
                >
                  {/* Barre verticale active à gauche */}
                  <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: 2,
                    background: isActive ? a : 'transparent',
                    transition: 'all 250ms ease',
                  }} />
                  
                  {/* Numéro indexé */}
                  <div style={{
                    fontSize: 7,
                    opacity: isActive ? 0.6 : 0.2,
                    transition: 'opacity 180ms',
                    fontWeight: 700,
                    minWidth: 16,
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  
                  {/* Icône Lucide */}
                  <IconComponent size={14} style={{ flexShrink: 0 }} />
                  
                  {/* Label */}
                  <div style={{
                    flex: 1,
                    transition: 'color 180ms',
                  }}>
                    {o.charAt(0).toUpperCase() + o.slice(1).toUpperCase()}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Ligne de scan décorative */}
          <div style={{
            position: 'absolute',
            left: 0, right: 0, top: 0, bottom: 0,
            pointerEvents: 'none',
            zIndex: 1,
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              left: 0, right: 0,
              height: 1,
              background: `rgba(${aRgb},0.15)`,
              animation: 'scanLine 6s linear infinite',
              opacity: 0.4,
            }} />
          </div>

          {/* Bouton paramètres en bas */}
          <div style={{
            padding: '12px 16px',
            borderTop: `1px solid rgba(${aRgb},0.07)`,
          }}>
            <button
              onClick={() => setParametresOuverts(!parametresOuverts)}
              style={{
                width: '100%',
                background: parametresOuverts ? `rgba(${aRgb},0.12)` : 'transparent',
                border: parametresOuverts ? `1px solid rgba(${aRgb},0.15)` : `1px solid rgba(${aRgb},0.08)`,
                borderRadius: 8,
                color: parametresOuverts ? a : 'rgba(255,255,255,0.4)',
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 180ms',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={e => {
                if (!parametresOuverts) e.currentTarget.style.color = `rgba(${aRgb},0.7)`
              }}
              onMouseLeave={e => {
                if (!parametresOuverts) e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
              }}
            >
              <Settings2 size={16} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 7, letterSpacing: '0.15em', fontWeight: 600 }}>
                PARAMÈTRES
              </div>
            </button>

            {/* PanneauParametres avec transition */}
            {parametresOuverts && (
              <div style={{
                marginTop: 12,
                animation: 'fadeIn 0.2s ease',
                maxHeight: '300px',
                overflowY: 'auto',
              }}>
                <PanneauParametres />
              </div>
            )}
          </div>

        </div>
      )}

      {/* ══ TAB BAR MOBILE ══ */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 14, left: 14, right: 14,
          height: 'auto',
          zIndex: 90,
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 28,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          padding: '10px 8px 10px',
          gap: 4,
        }}>
          {['live', 'sessions', 'stats', 'prompt', 'projets', 'competences'].map(o => {
            const icons = {
              live: Radio,
              sessions: LayoutGrid,
              stats: BarChart3,
              prompt: SlidersHorizontal,
              projets: FolderKanban,
              competences: Star,
            }
            const IconComponent = icons[o]
            const isActive = onglet === o
            const showLabel = labelTemporaire === o
            
            const handleClick = () => {
              setOnglet(o)
              setLabelTemporaire(o)
              const timer = setTimeout(() => setLabelTemporaire(null), 1200)
              return () => clearTimeout(timer)
            }
            
            return (
              <button
                key={o}
                onClick={handleClick}
                style={{
                  flex: 1,
                  height: 44,
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? a : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 180ms',
                  minWidth: 0,
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.color = `rgba(${aRgb},0.7)`
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                }}
              >
                {/* Libellé temporaire au-dessus de l'icône */}
                {showLabel && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    marginBottom: 8,
                    fontSize: 6,
                    letterSpacing: '0.15em',
                    fontWeight: 600,
                    padding: '4px 8px',
                    background: `rgba(${aRgb},0.15)`,
                    borderRadius: 4,
                    border: `1px solid rgba(${aRgb},0.25)`,
                    color: a,
                    whiteSpace: 'nowrap',
                    animation: 'fadeIn 0.2s ease',
                    pointerEvents: 'none',
                  }}>
                    {o.toUpperCase()}
                  </div>
                )}
                
                {/* Icône */}
                <IconComponent 
                  size={18} 
                  style={{ 
                    flexShrink: 0,
                    transition: 'all 180ms',
                  }} 
                />
                
                {/* Point lumineux sous l'icône active */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: 4,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: a,
                    animation: 'pulse 1.4s infinite',
                  }} />
                )}
              </button>
            )
          })}
          
          {/* Bouton AXIS circulaire surélevé */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            marginLeft: 4,
            marginRight: 2,
          }}>
            <button
              onClick={() => setOnglet('axis')}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: onglet === 'axis'
                  ? `rgba(${aRgb},0.15)`
                  : `rgba(${aRgb},0.08)`,
                border: onglet === 'axis'
                  ? `1px solid rgba(${aRgb},0.25)`
                  : `1px solid rgba(${aRgb},0.12)`,
                color: a,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms',
                flexShrink: 0,
                position: 'relative',
                marginTop: -10,
              }}
            >
              {aiState !== 'idle' && (
                <div style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  border: `1px solid rgba(${aRgb},0.3)`,
                  animation: 'pulse 1.4s infinite',
                  pointerEvents: 'none',
                }} />
              )}
              <div style={{ 
                fontSize: 12, 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                ◎
              </div>
            </button>
          </div>
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
            padding: isMobile ? '20px 14px 16px' : '32px 28px 24px',
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
                    fontSize: axisBubbleSize,
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

        {/* ── PROJETS ── */}
        {onglet === 'projets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: 7, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em' }}>// GESTION PROJETS</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{projetsListe.length} projet{projetsListe.length>1?'s':''}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {portfolioSauvegarde && <div style={{ color: '#10b981', fontSize: 9 }}>✓ SAUVÉ</div>}
                <button
                  onClick={() => setProjetEnEdition({ titre:'', categorie:'', type:'frontend', tags:[], desc:'', img:'', lien:'', annee:'', status:'EN LIGNE', ordre: projetsListe.length })}
                  style={{ background: 'transparent', border: 'none', borderBottom: `1px solid rgba(${aRgb},0.16)`, color: a, borderRadius: 0, padding: '6px 0', cursor: 'pointer', fontSize: 9, letterSpacing: '0.16em', fontFamily: 'Space Mono, monospace' }}
                >+ NOUVEAU PROJET</button>
                <button
                  onClick={importerDonneesParDefaut}
                  disabled={importEnCours}
                  style={{ background: 'transparent', border: 'none', borderBottom: `1px solid rgba(${aRgb},0.1)`, color: importReussi ? '#10b981' : 'rgba(255,255,255,0.35)', padding: '6px 0', cursor: importEnCours ? 'wait' : 'pointer', fontSize: 8, letterSpacing: '0.14em', fontFamily: 'Space Mono, monospace', opacity: importEnCours ? 0.5 : 1 }}
                >
                  {importEnCours ? 'IMPORT EN COURS…' : importReussi ? '✓ IMPORTÉ' : '↓ IMPORTER LES DONNÉES PAR DÉFAUT'}
                </button>
              </div>
            </div>

            {chargementPortfolio ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.22)', borderTop: `1px solid rgba(${aRgb},0.08)`, paddingTop: 24 }}>Chargement…</div>
            ) : (
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -80, top: 20, width: 320, height: 320, borderRadius: '50%', background: `rgba(${aRgb},0.04)`, filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, position: 'relative', zIndex: 1 }}>
                  {projetsListe.map((p) => {
                    const typeColor = p.type === 'frontend' ? '#5DCAA5' : p.type === 'fullstack' ? '#378ADD' : p.type === 'ia' ? '#D4537E' : '#EF9F27'
                    return (
                      <div
                        key={p.id}
                        style={{
                          borderRadius: 16,
                          overflow: 'hidden',
                          border: `1px solid rgba(${aRgb},0.14)`,
                          background: `rgba(${aRgb},0.03)`,
                          position: 'relative',
                          transition: 'all 200ms',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = `rgba(${aRgb},0.35)`
                          e.currentTarget.style.transform = 'translateY(-3px)'
                          const actions = e.currentTarget.querySelector('[data-actions]')
                          if (actions) { actions.style.opacity = '1'; actions.style.pointerEvents = 'auto' }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = `rgba(${aRgb},0.14)`
                          e.currentTarget.style.transform = 'translateY(0)'
                          const actions = e.currentTarget.querySelector('[data-actions]')
                          if (actions) { actions.style.opacity = '0'; actions.style.pointerEvents = 'none' }
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: 150, background: `rgba(${aRgb},0.06)`, overflow: 'hidden' }}>
                          {p.img ? (
                            <img
                              src={p.img}
                              alt={p.titre}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.style.display = 'flex'; e.currentTarget.parentElement.style.alignItems = 'center'; e.currentTarget.parentElement.style.justifyContent = 'center' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: `rgba(${aRgb},0.25)`, letterSpacing: '0.15em' }}>PAS D'IMAGE</div>
                          )}
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)' }} />
                          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '3px 8px' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: typeColor }} />
                            <span style={{ fontSize: 8, color: typeColor, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>{p.type}</span>
                          </div>
                          <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Fraunces, serif', lineHeight: 1.1 }}>{p.titre || '—'}</div>
                            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>{p.categorie || '—'}</div>
                          </div>
                        </div>

                        <div style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: 9, color: `rgba(${aRgb},0.5)`, letterSpacing: '0.04em', marginBottom: 6, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {(p.tags || []).join(' · ') || '—'}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{p.status || '—'} · {p.annee || ''}</span>
                            <div data-actions style={{ display: 'flex', gap: 10, opacity: isMobile ? 1 : 0, pointerEvents: isMobile ? 'auto' : 'none', transition: 'opacity 180ms' }}>
                              <button onClick={() => setProjetEnEdition(p)} style={{ background: 'transparent', border: 'none', padding: 0, color: a, cursor: 'pointer', fontSize: 8, letterSpacing: '0.14em', textDecoration: 'underline', textUnderlineOffset: 3 }}>MODIFIER</button>
                              <button onClick={() => { if (confirm('Supprimer ce projet ?')) retirerProjet(p.id) }} style={{ background: 'transparent', border: 'none', padding: 0, color: 'rgba(255,255,255,0.42)', cursor: 'pointer', fontSize: 8, letterSpacing: '0.14em', textDecoration: 'underline', textUnderlineOffset: 3 }}>SUPPR</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {projetsListe.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px', fontSize: 9, color: 'rgba(255,255,255,0.12)' }}>Aucun projet — ajoute ton premier projet</div>
                  )}
                </div>
              </div>
            )}

            {/* Modal edition projet */}
            {projetEnEdition !== null && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 140, display: 'grid', placeItems: 'center', background: 'rgba(5,5,5,0.97)' }}>
                <div style={{ width: isMobile ? 'min(560px, 94vw)' : 'min(860px,96%)', background: 'rgba(8,8,8,0.98)', borderTop: `1px solid rgba(${aRgb},0.12)`, boxShadow: 'none', padding: isMobile ? 16 : 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
                    <div style={{ fontSize: isMobile ? 14 : 16, fontFamily: 'Fraunces, serif', color: '#fff', letterSpacing: '0.02em' }}>ÉDITER PROJET</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setProjetEnEdition(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.55)', padding: '6px 0', borderRadius: 0, cursor: 'pointer', fontSize: 8, letterSpacing: '0.16em', textDecoration: 'underline', textUnderlineOffset: 3 }}>ANNULER</button>
                      <button onClick={() => sauvegarderProjet(projetEnEdition)} style={{ background: a, border: 'none', color: '#000', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 8, letterSpacing: '0.16em' }}>ENREGISTRER</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: isMobile ? 14 : 18 }}>
                    <div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// TITRE</div>
                        <input value={projetEnEdition.titre || ''} onChange={e => setProjetEnEdition(prev => ({...prev, titre: e.target.value}))} style={{ width: '100%', padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// CATEGORIE</div>
                          <input value={projetEnEdition.categorie || ''} onChange={e => setProjetEnEdition(prev => ({...prev, categorie: e.target.value}))} style={{ width: '100%', padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// TYPE</div>
                          <select value={projetEnEdition.type || 'frontend'} onChange={e => setProjetEnEdition(prev => ({...prev, type: e.target.value}))} style={{ width: '100%', padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }}>
                            <option value="frontend">frontend</option>
                            <option value="fullstack">fullstack</option>
                            <option value="ia">ia</option>
                            <option value="impact">impact</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// TAGS (séparés par des virgules)</div>
                        <input value={(projetEnEdition.tags || []).join(', ')} onChange={e => setProjetEnEdition(prev => ({...prev, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} style={{ width: '100%', padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }} />
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// DESCRIPTION</div>
                        <textarea value={projetEnEdition.desc || ''} onChange={e => setProjetEnEdition(prev => ({...prev, desc: e.target.value}))} style={{ width: '100%', minHeight: 120, padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none', resize: 'vertical' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// IMAGE</div>
                        <input
                          value={projetEnEdition.img || ''}
                          onChange={e => setProjetEnEdition(prev => ({ ...prev, img: e.target.value }))}
                          placeholder="/asset/mon-projet.jpg ou https://..."
                          style={{ width: '100%', padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }}
                        />
                        {projetEnEdition.img && (
                          <div style={{ marginTop: 8 }}>
                            <img
                              src={projetEnEdition.img}
                              alt="aperçu"
                              style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 6, objectFit: 'cover', display: 'block' }}
                              onError={e => { e.currentTarget.style.display = 'none' }}
                              onLoad={e => { e.currentTarget.style.display = 'block' }}
                            />
                          </div>
                        )}
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// LIEN</div>
                        <input value={projetEnEdition.lien || ''} onChange={e => setProjetEnEdition(prev => ({...prev, lien: e.target.value}))} style={{ width: '100%', padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// ANNÉE</div>
                          <input value={projetEnEdition.annee || ''} onChange={e => setProjetEnEdition(prev => ({...prev, annee: e.target.value}))} style={{ width: '100%', padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }} />
                        </div>
                        <div style={{ width: 120 }}>
                          <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// STATUS</div>
                          <select value={projetEnEdition.status || 'EN LIGNE'} onChange={e => setProjetEnEdition(prev => ({...prev, status: e.target.value}))} style={{ width: '100%', padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }}>
                            <option>EN LIGNE</option>
                            <option>EN PRODUCTION</option>
                            <option>PRIVÉ</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// ORDRE</div>
                        <input type="number" value={projetEnEdition.ordre || 0} onChange={e => setProjetEnEdition(prev => ({...prev, ordre: Number(e.target.value)}))} style={{ width: '100%', padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── COMPÉTENCES ── */}
        {onglet === 'competences' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: 7, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em' }}>// GESTION COMPÉTENCES</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{competencesListe.length} catégorie{competencesListe.length>1?'s':''}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {portfolioSauvegarde && <div style={{ color: '#10b981', fontSize: 9 }}>✓ SAUVÉ</div>}
                <button onClick={() => setCompetenceEnEdition({ cat:'', items:[], ordre: competencesListe.length })} style={{ background: 'transparent', border: 'none', borderBottom: `1px solid rgba(${aRgb},0.16)`, color: a, borderRadius: 0, padding: '6px 0', cursor: 'pointer', fontSize: 9, letterSpacing: '0.16em', fontFamily: 'Space Mono, monospace' }}>+ NOUVELLE CATÉGORIE</button>
                <button
                  onClick={importerDonneesParDefaut}
                  disabled={importEnCours}
                  style={{ background: 'transparent', border: 'none', borderBottom: `1px solid rgba(${aRgb},0.1)`, color: importReussi ? '#10b981' : 'rgba(255,255,255,0.35)', padding: '6px 0', cursor: importEnCours ? 'wait' : 'pointer', fontSize: 8, letterSpacing: '0.14em', fontFamily: 'Space Mono, monospace', opacity: importEnCours ? 0.5 : 1 }}
                >
                  {importEnCours ? 'IMPORT EN COURS…' : importReussi ? '✓ IMPORTÉ' : '↓ IMPORTER LES DONNÉES PAR DÉFAUT'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {competencesListe.map((c, idx) => {
                const isActiveMobile = competenceDeplieMobile === c.id
                return (
                  <div key={c.id} style={{ padding: '24px 0 20px', borderTop: idx === 0 ? 'none' : `1px solid rgba(${aRgb},0.08)` }}>
                    <div
                      onClick={() => { if (isMobile) setCompetenceDeplieMobile(isActiveMobile ? null : c.id) }}
                      onMouseEnter={e => {
                        if (!isMobile) {
                          const actions = e.currentTarget.querySelector('[data-actions]')
                          if (actions) {
                            actions.style.opacity = '1'
                            actions.style.transform = 'translateY(0)'
                            actions.style.pointerEvents = 'auto'
                          }
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isMobile) {
                          const actions = e.currentTarget.querySelector('[data-actions]')
                          if (actions) {
                            actions.style.opacity = '0'
                            actions.style.transform = 'translateY(4px)'
                            actions.style.pointerEvents = 'none'
                          }
                        }
                      }}
                      style={{ cursor: isMobile ? 'pointer' : 'default' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 700, color: '#fff', fontFamily: 'Fraunces, serif', letterSpacing: '0.01em', lineHeight: 1.05 }}>{c.cat}</div>
                          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.24)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 8 }}>{(c.items||[]).length} item(s) · ordre {c.ordre || 0}</div>
                        </div>
                        <div data-actions style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: isMobile ? (isActiveMobile ? 1 : 0) : 0, transform: isMobile ? 'translateY(0)' : 'translateY(4px)', transition: 'all 180ms ease', pointerEvents: isMobile ? (isActiveMobile ? 'auto' : 'none') : 'none', maxHeight: isMobile ? (isActiveMobile ? 60 : 0) : 'none', overflow: 'hidden' }}>
                          <button onClick={e => { e.stopPropagation(); setCompetenceEnEdition(c) }} style={{ background: 'transparent', border: 'none', padding: 0, color: a, cursor: 'pointer', fontSize: 8, letterSpacing: '0.18em', textDecoration: 'underline', textUnderlineOffset: 3 }}>MODIFIER</button>
                          <button onClick={e => { e.stopPropagation(); if (confirm('Supprimer cette catégorie ?')) retirerCompetence(c.id) }} style={{ background: 'transparent', border: 'none', padding: 0, color: 'rgba(255,255,255,0.42)', cursor: 'pointer', fontSize: 8, letterSpacing: '0.18em', textDecoration: 'underline', textUnderlineOffset: 3 }}>SUPPRIMER</button>
                        </div>
                      </div>

                      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(c.items||[]).map((it, i) => (
                          <div key={i} style={{ position: 'relative', paddingTop: 6, paddingBottom: 8, borderBottom: i < (c.items||[]).length - 1 ? `1px solid rgba(${aRgb},0.05)` : 'none' }}>
                            <div style={{ position: 'absolute', right: 0, top: -2, fontFamily: 'Fraunces, serif', fontSize: 32, color: `rgba(${aRgb},0.1)`, pointerEvents: 'none', userSelect: 'none' }}>{it.pct}</div>
                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.16em', textTransform: 'uppercase', flex: 1 }}>{it.nom}</div>
                              <div style={{ fontSize: 11, color: '#fff', fontWeight: 600, minWidth: 34, textAlign: 'right' }}>{it.pct}%</div>
                            </div>
                            <div style={{ position: 'relative', zIndex: 1, marginTop: 8, height: 1, background: `rgba(${aRgb},0.12)`, overflow: 'hidden' }}>
                              <div style={{ width: `${it.pct}%`, height: '100%', background: a, transition: 'width 220ms ease' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal edition competence */}
            {competenceEnEdition !== null && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 140, display: 'grid', placeItems: 'center', background: 'rgba(5,5,5,0.97)' }}>
                <div style={{ width: isMobile ? 'min(560px, 94vw)' : 'min(760px,96%)', background: 'rgba(8,8,8,0.98)', borderTop: `1px solid rgba(${aRgb},0.12)`, boxShadow: 'none', padding: isMobile ? 16 : 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
                    <div style={{ fontSize: isMobile ? 14 : 16, fontFamily: 'Fraunces, serif', color: '#fff', letterSpacing: '0.02em' }}>ÉDITER CATÉGORIE</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setCompetenceEnEdition(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.55)', padding: '6px 0', borderRadius: 0, cursor: 'pointer', fontSize: 8, letterSpacing: '0.16em', textDecoration: 'underline', textUnderlineOffset: 3 }}>ANNULER</button>
                      <button onClick={() => sauvegarderCompetence(competenceEnEdition)} style={{ background: a, border: 'none', color: '#000', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 8, letterSpacing: '0.16em' }}>ENREGISTRER</button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// NOM CATÉGORIE</div>
                    <input value={competenceEnEdition.cat || ''} onChange={e => setCompetenceEnEdition(prev => ({...prev, cat: e.target.value}))} style={{ width: '100%', padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none', marginBottom: 12 }} />

                    <div style={{ fontSize: 7, color: `rgba(${aRgb},0.45)`, marginBottom: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// ITEMS</div>
                    {(competenceEnEdition.items || []).map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 8, alignItems: isMobile ? 'stretch' : 'center', marginBottom: 8 }}>
                        <input value={it.nom} onChange={e => {
                          const items = (competenceEnEdition.items||[]).slice(); items[idx] = {...items[idx], nom: e.target.value}; setCompetenceEnEdition(prev => ({...prev, items}))
                        }} style={{ flex: 1, padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }} />
                        <input type="number" value={it.pct} onChange={e => {
                          const items = (competenceEnEdition.items||[]).slice(); items[idx] = {...items[idx], pct: Number(e.target.value)}; setCompetenceEnEdition(prev => ({...prev, items}))
                        }} style={{ width: 96, padding: '10px 0 8px', borderRadius: 0, border: 'none', borderBottom: `1px solid rgba(${aRgb},0.15)`, background: 'transparent', color: '#fff', outline: 'none' }} />
                        <button onClick={() => { const items = (competenceEnEdition.items||[]).filter((_,i)=>i!==idx); setCompetenceEnEdition(prev=>({...prev, items})) }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}>SUPPR</button>
                      </div>
                    ))}
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => { const items = [...(competenceEnEdition.items||[]), { nom: '', pct: 0 }]; setCompetenceEnEdition(prev => ({...prev, items})) }} style={{ background: 'transparent', border: 'none', borderBottom: `1px solid rgba(${aRgb},0.16)`, color: a, padding: '6px 0', borderRadius: 0, cursor: 'pointer', fontSize: 9, letterSpacing: '0.16em', fontFamily: 'Space Mono, monospace' }}>+ AJOUTER UNE COMPÉTENCE</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LIVE ── */}
        {onglet === 'live' && !isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Métriques rapides */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
                    fontSize: statLabelSize, color: `rgba(${aRgb},0.4)`,
                    letterSpacing: '0.22em', marginBottom: 8,
                  }}>{label}</div>
                  <div style={{
                    fontSize: statValueSize, fontWeight: 800,
                    color: a, fontFamily: 'Fraunces, serif',
                    lineHeight: 1,
                  }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Sessions récentes + détail */}
            <div style={{
              display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: 16,
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

        {onglet === 'live' && isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Métriques en grille 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'SESSIONS', val: stats.total },
                { label: 'MESSAGES', val: stats.msgTotal },
                { label: 'CONTACTS ⚡', val: stats.demandesContact },
                { label: 'CV ⚡', val: stats.demandesCv },
              ].map(({ label, val }, i) => (
                <div key={i} style={{
                  background: `rgba(${aRgb},0.06)`,
                  border: `1px solid rgba(${aRgb},0.14)`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 8, right: 8, height: 1, background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.2),transparent)` }} />
                  <div style={{ fontSize: statLabelSize, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.18em', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: statValueSize, fontWeight: 800, color: a, lineHeight: 1 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Liste sessions — pleine largeur, items compacts */}
            <div style={{
              background: `rgba(${aRgb},0.04)`,
              border: `1px solid rgba(${aRgb},0.14)`,
              borderRadius: 16,
              padding: '14px',
            }}>
              <div style={{ fontSize: 6, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em', marginBottom: 10 }}>
                // FLUX TEMPS RÉEL
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sessions.slice(0, 15).map(s => (
                  <div
                    key={s.id}
                    onClick={() => setSessionSelectee(sessionSelectee?.id === s.id ? null : s)}
                    style={{
                      padding: '10px 12px',
                      background: sessionSelectee?.id === s.id ? `rgba(${aRgb},0.1)` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${sessionSelectee?.id === s.id ? `rgba(${aRgb},0.25)` : 'rgba(255,255,255,0.04)'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: profilColor(s.profil_visiteur), flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{s.prenom_visiteur || '—'}</span>
                        <span style={{ fontSize: 6, color: profilColor(s.profil_visiteur), letterSpacing: '0.12em' }}>{profilLabel(s.profil_visiteur)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {s.demande_contact && <span style={{ fontSize: 7, color: a }}>⚡</span>}
                        {s.demande_cv && <span style={{ fontSize: 7, color: '#f59e0b' }}>CV</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', display: 'flex', gap: 10 }}>
                      <span>{s.nb_messages || 0} msg</span>
                      <span>{formatDuree(s.duree_secondes || 0)}</span>
                      <span style={{ marginLeft: 'auto' }}>{formatDate(s.created_at)}</span>
                    </div>

                    {/* Conversation dépliée si sélectionnée */}
                    {sessionSelectee?.id === s.id && (
                      <div style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: `1px solid rgba(${aRgb},0.1)`,
                        display: 'flex', flexDirection: 'column', gap: 6,
                        maxHeight: 220, overflowY: 'auto',
                      }}>
                        {(s.historique || []).length === 0 && (
                          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '10px 0' }}>Aucun message</div>
                        )}
                        {(s.historique || []).map((msg, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                          }}>
                            <div style={{
                              maxWidth: '82%',
                              background: msg.role === 'user' ? 'rgba(255,255,255,0.04)' : `rgba(${aRgb},0.06)`,
                              border: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.06)' : `rgba(${aRgb},0.1)`}`,
                              borderRadius: msg.role === 'user' ? '10px 2px 10px 10px' : '2px 10px 10px 10px',
                              padding: '7px 10px',
                              fontSize: 10,
                              color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.85)',
                              lineHeight: 1.5,
                            }}>
                              {msg.contenu}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 8, color: 'rgba(255,255,255,0.1)', letterSpacing: '0.2em' }}>
                    Aucune session enregistrée
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SESSIONS ── */}
        {onglet === 'sessions' && !isMobile && (
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

        {onglet === 'sessions' && isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 6, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em', marginBottom: 4 }}>
              // TOUTES LES SESSIONS — {sessions.length}
            </div>
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => { setSessionSelectee(s); setOnglet('live') }}
                style={{
                  background: `rgba(${aRgb},0.05)`,
                  border: `1px solid rgba(${aRgb},0.12)`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 10, right: 10, height: 1, background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.15),transparent)` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{s.prenom_visiteur || '—'}</div>
                    <div style={{ fontSize: 6, color: profilColor(s.profil_visiteur), letterSpacing: '0.12em' }}>{profilLabel(s.profil_visiteur)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {s.demande_contact && <span style={{ fontSize: 6, color: a, border: `1px solid rgba(${aRgb},0.2)`, borderRadius: 4, padding: '2px 5px' }}>⚡ CONTACT</span>}
                    {s.demande_cv && <span style={{ fontSize: 6, color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4, padding: '2px 5px' }}>⚡ CV</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: a }}>{s.nb_messages || 0}</div>
                    <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>msg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: a }}>{formatDuree(s.duree_secondes || 0)}</div>
                    <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>durée</div>
                  </div>
                  <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                    <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.15)' }}>{formatDate(s.created_at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STATS ── */}
        {onglet === 'stats' && !isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12,
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
                    fontSize: statLabelSize, color: `rgba(${aRgb},0.4)`,
                    letterSpacing: '0.22em', marginBottom: 10,
                  }}>{label}</div>
                  <div style={{
                    fontSize: statValueSize, fontWeight: 800,
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

        {onglet === 'stats' && isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Métriques clés en 2x2 compact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'SESSIONS TOTALES', val: stats.total, sub: 'visiteurs' },
                { label: 'MESSAGES', val: stats.msgTotal, sub: 'échangés' },
                { label: 'DURÉE MOY.', val: formatDuree(stats.dureeMoy), sub: 'par session' },
                { label: 'TAUX CONTACT', val: stats.total ? `${Math.round((stats.demandesContact/stats.total)*100)}%` : '0%', sub: 'des visiteurs' },
              ].map(({ label, val, sub }, i) => (
                <div key={i} style={{
                  background: `rgba(${aRgb},0.06)`,
                  border: `1px solid rgba(${aRgb},0.14)`,
                  borderRadius: 12, padding: '12px 14px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 8, right: 8, height: 1, background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.2),transparent)` }} />
                  <div style={{ fontSize: statLabelSize, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.15em', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: statValueSize, fontWeight: 800, color: a, lineHeight: 1, marginBottom: 3 }}>{val}</div>
                  <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.18)' }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Profils en liste verticale */}
            <div style={{ background: `rgba(${aRgb},0.04)`, border: `1px solid rgba(${aRgb},0.12)`, borderRadius: 14, padding: '14px' }}>
              <div style={{ fontSize: 6, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em', marginBottom: 12 }}>// PROFILS</div>
              {[
                { label: 'Recruteurs', val: stats.recruteurs, color: '#3b82f6' },
                { label: 'Clients', val: stats.clients, color: '#10b981' },
                { label: 'Curieux', val: stats.curieux, color: a },
                { label: 'Collaborateurs', val: stats.collabs, color: '#a855f7' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                    <span style={{ fontSize: 9, color, fontWeight: 700 }}>{val}</span>
                  </div>
                  <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: stats.total ? `${(val/stats.total)*100}%` : '0%', background: color, borderRadius: 2, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Signaux chauds en liste */}
            <div style={{ background: `rgba(${aRgb},0.04)`, border: `1px solid rgba(${aRgb},0.12)`, borderRadius: 14, padding: '14px' }}>
              <div style={{ fontSize: 6, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em', marginBottom: 12 }}>// SIGNAUX CHAUDS</div>
              {[
                { label: 'Demandes contact', val: stats.demandesContact, color: a },
                { label: 'Demandes CV', val: stats.demandesCv, color: '#f59e0b' },
                { label: 'Taux CV', val: stats.total ? `${Math.round((stats.demandesCv/stats.total)*100)}%` : '0%', color: '#a855f7' },
                { label: 'Moy. msg/session', val: stats.total ? Math.round(stats.msgTotal/stats.total) : 0, color: '#3b82f6' },
              ].map(({ label, val, color }, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROMPT ── */}
        {onglet === 'prompt' && !isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Sous-onglets */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'systeme', label: '// PROMPT SYSTÈME' },
                { id: 'additionnel', label: '// INSTRUCTIONS ADDITIONNELLES' },
                { id: 'historique', label: '// HISTORIQUE' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setOngletPrompt(id)}
                  style={{
                    background: ongletPrompt === id ? `rgba(${aRgb},0.12)` : 'transparent',
                    border: `1px solid rgba(${aRgb},${ongletPrompt === id ? '0.3' : '0.1'})`,
                    color: ongletPrompt === id ? a : 'rgba(255,255,255,0.3)',
                    borderRadius: 8, padding: '6px 14px',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: 7, letterSpacing: '0.18em',
                    cursor: 'pointer', transition: 'all 180ms',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sous-onglet : Prompt Système */}
            {ongletPrompt === 'systeme' && (
              <div style={{ ...glass, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 7, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em', marginBottom: 5 }}>
                      // PROMPT SYSTÈME PRINCIPAL
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
                      Le prompt de base d'AXIS — appliqué à tous les visiteurs du portfolio
                    </div>
                  </div>
                  <button
                    onClick={sauvegarderPromptSysteme}
                    style={{
                      background: promptSystemeSauvegarde ? 'rgba(16,185,129,0.1)' : `rgba(${aRgb},0.08)`,
                      border: `1px solid ${promptSystemeSauvegarde ? 'rgba(16,185,129,0.3)' : `rgba(${aRgb},0.2)`}`,
                      color: promptSystemeSauvegarde ? '#10b981' : a,
                      borderRadius: 10, padding: '9px 18px',
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 8, letterSpacing: '0.2em',
                      cursor: 'pointer', transition: 'all 280ms',
                    }}
                  >
                    {promptSystemeSauvegarde ? '✓ SAUVEGARDÉ' : 'SAUVEGARDER'}
                  </button>
                </div>
                <textarea
                  value={promptSysteme}
                  onChange={e => setPromptSysteme(e.target.value)}
                  placeholder="Colle ici le prompt système complet de serviceIA.js — il sera chargé depuis Firestore à chaque conversation visiteur..."
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
                <div style={{ marginTop: 10, fontSize: 7, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.15em' }}>
                  {promptSysteme.length} caractères · remplace le prompt codé en dur dans serviceIA.js
                </div>
              </div>
            )}

            {/* Sous-onglet : Instructions additionnelles (prompt_principal existant) */}
            {ongletPrompt === 'additionnel' && (
              <div style={{ ...glass, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 7, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em', marginBottom: 5 }}>
                      // INSTRUCTIONS ADDITIONNELLES
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
                      Ajoutées en fin de prompt système — personnalité, comportements spécifiques
                    </div>
                  </div>
                  <button
                    onClick={sauvegarderPrompt}
                    style={{
                      background: promptSauvegarde ? 'rgba(16,185,129,0.1)' : `rgba(${aRgb},0.08)`,
                      border: `1px solid ${promptSauvegarde ? 'rgba(16,185,129,0.3)' : `rgba(${aRgb},0.2)`}`,
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
                  placeholder="Instructions personnalisées — comportements spécifiques, exemples de réponses..."
                  style={{
                    width: '100%', minHeight: 400,
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
                <div style={{ marginTop: 10, fontSize: 7, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.15em' }}>
                  {promptTexte.length} caractères · s'applique aux prochaines conversations
                </div>
              </div>
            )}

            {/* Sous-onglet : Historique */}
            {ongletPrompt === 'historique' && (
              <div style={{ ...glass, padding: 24 }}>
                <div style={{ fontSize: 7, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em', marginBottom: 16 }}>
                  // HISTORIQUE DES VERSIONS
                </div>
                {promptsHistorique.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 8, color: 'rgba(255,255,255,0.1)', letterSpacing: '0.2em' }}>
                    Aucune version sauvegardée
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {promptsHistorique.map(p => (
                    <div
                      key={p.id}
                      style={{
                        background: `rgba(${aRgb},0.04)`,
                        border: `1px solid rgba(${aRgb},0.1)`,
                        borderRadius: 12, padding: '16px 18px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: `rgba(${aRgb},0.8)` }}>{p.titre}</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)' }}>
                            {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                          <button
                            onClick={() => { setPromptTexte(p.contenu); setOngletPrompt('additionnel') }}
                            style={{
                              background: `rgba(${aRgb},0.08)`,
                              border: `1px solid rgba(${aRgb},0.2)`,
                              color: a, borderRadius: 6, padding: '4px 10px',
                              fontSize: 7, letterSpacing: '0.15em', cursor: 'pointer',
                            }}
                          >
                            RESTAURER
                          </button>
                        </div>
                      </div>
                      <div style={{
                        fontSize: 9, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                      }}>
                        {p.contenu}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {onglet === 'prompt' && isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* En-tête + bouton sauvegarder */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 6, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em', marginBottom: 3 }}>// PERSONNALITÉ AXIS</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>Modifie le comportement d'AXIS</div>
              </div>
              <button
                onClick={sauvegarderPrompt}
                style={{
                  background: promptSauvegarde ? 'rgba(16,185,129,0.1)' : `rgba(${aRgb},0.08)`,
                  border: `1px solid ${promptSauvegarde ? 'rgba(16,185,129,0.3)' : `rgba(${aRgb},0.2)`}`,
                  color: promptSauvegarde ? '#10b981' : a,
                  borderRadius: 8, padding: '7px 12px',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 7, letterSpacing: '0.15em',
                  cursor: 'pointer',
                }}
              >
                {promptSauvegarde ? '✓ OK' : 'SAUVER'}
              </button>
            </div>

            {/* Zone de texte */}
            <textarea
              value={promptTexte}
              onChange={e => setPromptTexte(e.target.value)}
              placeholder="Instructions pour AXIS..."
              style={{
                width: '100%', minHeight: 200,
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid rgba(${aRgb},0.1)`,
                borderRadius: 12, padding: '14px',
                fontFamily: 'Space Mono, monospace',
                fontSize: 11, color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.7, outline: 'none',
                resize: 'vertical', boxSizing: 'border-box',
                caretColor: a,
              }}
            />
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.12em' }}>
              {promptTexte.length} caractères
            </div>

            {/* Historique des prompts */}
            {promptsHistorique.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 6, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.25em', marginBottom: 4 }}>// HISTORIQUE</div>
                {promptsHistorique.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setPromptTexte(p.contenu)}
                    style={{
                      background: `rgba(${aRgb},0.04)`,
                      border: `1px solid rgba(${aRgb},0.1)`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: `rgba(${aRgb},0.8)` }}>{p.titre}</div>
                      <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.2)' }}>
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 9, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {p.contenu}
                    </div>
                  </div>
                ))}
              </div>
            )}
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