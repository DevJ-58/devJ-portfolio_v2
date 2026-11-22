import React, { useState, useEffect, useRef } from 'react'
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
import utiliserStore from '@/store/utiliserStore'
import { dureeParole } from '@/composants/ui/axis/visemes'
import { signalerPositionVoix } from '@/composants/ui/axis/canalParole'
import AvatarAxis from '@/composants/ui/AvatarAxis'
import PanneauParametres from '@/composants/ui/PanneauParametres'
import { televerserImage, verifierFichier } from '@/services/televersement'
import { PROJETS, VERSION_PROJETS } from '@/donnees/projets'
import { Volume2, Mic, Send, X, Menu, Plus, Upload, Trash2, ArrowUpRight, LogOut, Pencil } from 'lucide-react'

const PROJETS_DEFAUT_A_IMPORTER = PROJETS.map(({ num, ...p }) => p) // eslint-disable-line no-unused-vars

const COMPETENCES_DEFAUT_A_IMPORTER = [
  { cat: 'Frontend', ordre: 0, items: [{ nom: 'HTML5', pct: 95 }, { nom: 'CSS3', pct: 90 }, { nom: 'JavaScript', pct: 85 }, { nom: 'React', pct: 80 }, { nom: 'TypeScript', pct: 75 }, { nom: 'Bootstrap', pct: 90 }, { nom: 'GSAP', pct: 75 }] },
  { cat: 'Backend', ordre: 1, items: [{ nom: 'PHP', pct: 85 }, { nom: 'Laravel', pct: 80 }] },
  { cat: 'IA & ML', ordre: 2, items: [{ nom: 'Python', pct: 70 }, { nom: 'TensorFlow', pct: 65 }, { nom: 'NLP', pct: 60 }] },
  { cat: 'Outils', ordre: 3, items: [{ nom: 'Git & GitHub', pct: 90 }, { nom: 'Figma', pct: 85 }, { nom: 'Canva', pct: 88 }, { nom: 'Docker', pct: 60 }] },
]

const AvatarStable = React.memo(function AvatarStable({ etat, taille = 200 }) {
  // Sans « etat », l'avatar suit le store : bouche synchronisée sur la voix
  return <AvatarAxis width={taille} height={taille} etat={etat} />
})

export default function AdminDashboard({ onFermer }) {
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
  const [axisMessage, setAxisMessage] = useState({ texte: '', id: 0 })
  const annoncer = (texte) => setAxisMessage((m) => ({ texte, id: m.id + 1 }))
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
  const [modeParler, setModeParler] = useState(false)
  const [ecoute, setEcoute] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [drawerOuvert, setDrawerOuvert] = useState(false)
  const [projetsListe, setProjetsListe] = useState([])
  const [competencesListe, setCompetencesListe] = useState([])
  const [chargementPortfolio, setChargementPortfolio] = useState(false)
  const [projetEnEdition, setProjetEnEdition] = useState(null)
  const [projetEnApercu, setProjetEnApercu] = useState(null)
  const [competenceEnEdition, setCompetenceEnEdition] = useState(null)
  const [portfolioSauvegarde, setPortfolioSauvegarde] = useState(false)
  const [importEnCours, setImportEnCours] = useState(false)
  const [importReussi, setImportReussi] = useState(false)
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const modeParlerRef = useRef(false)
  const recognitionRef = useRef(null)
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY
  const MODELE = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'

  // ── Auth ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) onFermer()
      else {
        setUser(u)
        // Message d'accueil AXIS pour Fréjus
        setTimeout(() => {
          const h = new Date().getHours()
          const moment = h < 12 ? 'matin' : h < 18 ? 'après-midi' : 'soir'
          const accueils = [
            `Bon ${moment} Fréjus. Système opérationnel, je surveille les sessions de tes visiteurs. Qu'est-ce qu'on fait aujourd'hui ?`,
            `Fréjus, te voilà. Tout tourne bien de mon côté. Tu veux qu'on regarde les dernières interactions ?`,
            `Connexion établie. Bon ${moment} créateur. J'ai des données à te montrer si tu es prêt.`,
          ]
          const msg = accueils[new Date().getMinutes() % accueils.length]
          annoncer(msg)
          setHistoriqueAdmin([{ role: 'axis', texte: msg }])
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
    }
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // ── Voix d'AXIS + bouche de l'avatar (même mécanisme que l'espace AXIS)
  useEffect(() => {
    const message = axisMessage.texte
    if (!message) return
    const { definirAxisParle } = utiliserStore.getState()
    const synthese = typeof window !== 'undefined' ? window.speechSynthesis : null
    let actif = true
    let minuterie = null
    let keepAlive = null

    const textePropre = message
      .replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/[-*•]\s/g, '')
      .replace(/\n{2,}/g, '. ').replace(/\n/g, ', ').replace(/\s{2,}/g, ' ').trim()

    const terminer = () => {
      if (keepAlive) clearInterval(keepAlive)
      definirAxisParle(false)
      setAiState('idle')
    }
    // Sans voix (coupée ou refusée par le navigateur) : la bouche suit le texte en silence
    const parlerEnSilence = () => {
      definirAxisParle(true, textePropre)
      setAiState('speaking')
      minuterie = setTimeout(() => { if (actif) terminer() }, dureeParole(textePropre) * 1000)
    }

    if (!modeVocal || !synthese) { parlerEnSilence(); return () => { actif = false; clearTimeout(minuterie) } }

    synthese.cancel()
    const voixTexte = textePropre.replace(/Fréjus/gi, 'Fréjusse').replace(/Frejus/gi, 'Fréjusse')
    const segments = voixTexte.split(/(?<=[.!?])\s+/).filter((x) => x.trim())
    let curseur = 0
    const debuts = segments.map((seg) => { const pos = voixTexte.indexOf(seg, curseur); curseur = (pos >= 0 ? pos : curseur) + seg.length; return pos >= 0 ? pos : curseur - seg.length })
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    let idx = 0
    let entendu = false

    function choisirVoix() {
      const voix = synthese.getVoices()
      const priorite = [
        (v) => v.lang.startsWith('fr') && /thomas|nicolas|paul/i.test(v.name),
        (v) => v.lang === 'fr-FR' && v.name.includes('Google'),
        (v) => v.lang === 'fr-FR' && !/amelie|marie|alice|stephanie/i.test(v.name),
        (v) => v.lang.startsWith('fr'),
      ]
      for (const test of priorite) { const v = voix.find(test); if (v) return v }
      return null
    }

    function parlerSegment(voixChoisie) {
      if (!actif) return
      if (idx >= segments.length) { terminer(); return }
      const seg = new SpeechSynthesisUtterance(segments[idx])
      if (voixChoisie) seg.voice = voixChoisie
      seg.lang = 'fr-FR'; seg.pitch = 0.82; seg.rate = isIOS ? 0.88 : 0.92; seg.volume = 1
      const debut = debuts[idx], fin = debut + segments[idx].length
      seg.onstart = () => { if (!actif) return; entendu = true; signalerPositionVoix(debut, fin) }
      seg.onboundary = (ev) => { if (actif && ev.charIndex != null) signalerPositionVoix(debut + ev.charIndex, fin) }
      seg.onend = () => { if (!actif) return; idx += 1; setTimeout(() => parlerSegment(voixChoisie), isIOS ? 200 : 120) }
      seg.onerror = (e) => {
        if (!actif) return
        console.warn('[voix admin]', e.error)
        // Voix refusée dès le départ (pas encore d'interaction, voix absente) : bouche en silence
        if (!entendu) { if (keepAlive) clearInterval(keepAlive); clearTimeout(minuterie); parlerEnSilence(); return }
        idx += 1; setTimeout(() => parlerSegment(voixChoisie), 200)
      }
      synthese.speak(seg)
    }

    function demarrer() {
      if (!actif) return
      definirAxisParle(true, voixTexte)
      setAiState('speaking')
      if (!isIOS && !('ontouchstart' in window)) {
        keepAlive = setInterval(() => { synthese.pause(); synthese.resume() }, 10000)
      }
      parlerSegment(choisirVoix())
      // Filet de sécurité : si la voix ne démarre jamais, la bouche parle en silence
      minuterie = setTimeout(() => { if (actif && !entendu) { synthese.cancel(); parlerEnSilence() } }, 2500)
    }

    // Petit délai après cancel() : Chrome ignore parfois une parole lancée aussitôt
    let demarre = false
    let attenteVoix = null
    const go = () => { if (demarre || !actif) return; demarre = true; synthese.onvoiceschanged = null; clearTimeout(attenteVoix); demarrer() }
    const lancement = setTimeout(() => {
      if (synthese.getVoices().length > 0) go()
      else { synthese.onvoiceschanged = go; attenteVoix = setTimeout(go, 1000) } // liste des voix jamais annoncée : on démarre quand même
    }, 80)

    return () => {
      actif = false
      clearTimeout(lancement); clearTimeout(minuterie); clearTimeout(attenteVoix)
      if (keepAlive) clearInterval(keepAlive)
      synthese.onvoiceschanged = null
    }
  }, [axisMessage, modeVocal])

  // En quittant l'admin : silence et bouche au repos
  useEffect(() => () => {
    window.speechSynthesis?.cancel()
    utiliserStore.getState().definirAxisParle(false)
  }, [])

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
  async function sauvegarderProjet(saisie) {
    // La version courante marque ce projet comme réglé depuis l'admin
    const { num, ...donnees } = { ...saisie, version: VERSION_PROJETS } // eslint-disable-line no-unused-vars
    const estNouveau = !donnees.id
    const resultat = estNouveau
      ? await creerProjet(donnees)
      : await modifierProjet(donnees.id, donnees)
    if (resultat) {
      const liste = await listerProjets()
      setProjetsListe(liste)
      setProjetEnEdition(null)
      setTeleversement({ enCours: false, erreur: '', mode: '' })
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
      annoncer(reponseMode)
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
      annoncer(reponseOk)
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
      annoncer(reponseCollecte)
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
      annoncer(reponse)
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
    onFermer()
  }

  // ── Téléversement de l'image d'un projet
  const [televersement, setTeleversement] = useState({ enCours: false, erreur: '', mode: '' })
  const [survolDepot, setSurvolDepot] = useState(false)
  async function choisirImage(fichier) {
    const erreur = verifierFichier(fichier)
    if (erreur) { setTeleversement({ enCours: false, erreur, mode: '' }); return }
    setTeleversement({ enCours: true, erreur: '', mode: '' })
    try {
      const { url, mode } = await televerserImage(fichier, 'projets')
      setProjetEnEdition((prev) => (prev ? { ...prev, img: url } : prev))
      setTeleversement({ enCours: false, erreur: '', mode })
    } catch (e) {
      setTeleversement({ enCours: false, erreur: e.message || 'Échec du téléversement.', mode: '' })
    }
  }
  const fermerEdition = () => { setProjetEnEdition(null); setTeleversement({ enCours: false, erreur: '', mode: '' }) }

  // Échap ferme d'abord les fenêtres ouvertes
  useEffect(() => {
    const echap = (e) => {
      if (e.key !== 'Escape') return
      if (projetEnEdition) { setProjetEnEdition(null); setTeleversement({ enCours: false, erreur: '', mode: '' }) }
      else if (projetEnApercu) setProjetEnApercu(null)
      else if (competenceEnEdition) setCompetenceEnEdition(null)
      else if (drawerOuvert) setDrawerOuvert(false)
    }
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [projetEnEdition, projetEnApercu, competenceEnEdition, drawerOuvert])

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

  

  const ONGLETS = [
    { id: 'axis', label: 'AXIS', desc: 'Converse avec ton assistant' },
    { id: 'live', label: 'En direct', desc: 'Sessions récentes et conversations' },
    { id: 'sessions', label: 'Sessions', desc: 'Toutes les visites enregistrées' },
    { id: 'stats', label: 'Statistiques', desc: 'Profils et signaux d’intérêt' },
    { id: 'prompt', label: 'Instructions', desc: 'Ce qu’AXIS sait et doit faire' },
    { id: 'projets', label: 'Projets', desc: 'Les travaux affichés sur le portfolio' },
    { id: 'competences', label: 'Compétences', desc: 'Catégories et niveaux' },
  ]
  const ongletCourant = ONGLETS.find((o) => o.id === onglet) || ONGLETS[0]
  const COULEURS_TYPE = { frontend: '#5DCAA5', fullstack: '#378ADD', ia: '#D4537E', impact: '#EF9F27' }
  const libelleEtat = aiState === 'thinking' ? 'Réfléchit' : aiState === 'speaking' ? 'Parle' : 'En attente'
  const pourcent = (n, total) => (total ? Math.round((n / total) * 100) : 0)
  const suggestions = ['Qui a visité aujourd’hui ?', 'Qui a demandé un contact ?', 'Résume les dernières conversations', 'Mode prompt']

  const rendreSession = (s, compacte) => (
    <button
      key={s.id}
      type="button"
      className={`ad-session${sessionSelectee?.id === s.id ? ' est-actif' : ''}${compacte ? ' est-compacte' : ''}`}
      style={{ '--c': profilColor(s.profil_visiteur) }}
      onClick={() => {
        if (compacte) setSessionSelectee(sessionSelectee?.id === s.id ? null : s)
        else { setSessionSelectee(s); setOnglet('live') }
      }}
    >
      <span className="ad-session__nom"><i />{s.prenom_visiteur || '—'}</span>
      <span className="ad-session__profil">{profilLabel(s.profil_visiteur)}</span>
      <span className="ad-session__chiffres">{s.nb_messages || 0} msg · {formatDuree(s.duree_secondes || 0)}</span>
      <span className="ad-session__signaux">
        {s.demande_contact && <b className="est-contact">Contact</b>}
        {s.demande_cv && <b className="est-cv">CV</b>}
      </span>
      <span className="ad-session__date">{formatDate(s.created_at)}</span>
    </button>
  )

  return (
    <div className="ad-tableau">
      {/* ── Navigation ── */}
      <aside className={`ad-nav${drawerOuvert ? ' est-ouvert' : ''}`} aria-label="Sections de l'admin">
        <div className="ad-nav__tete">
          <span className="ad-logo">&lt;/<span>DevJ</span>&gt;</span>
          <span className="ad-badge">Admin</span>
        </div>
        <button type="button" className={`ad-nav__axis est-${aiState}`} onClick={() => { setOnglet('axis'); setDrawerOuvert(false) }}>
          <i aria-hidden="true" />
          <span><b>AXIS</b>{libelleEtat}</span>
        </button>
        <nav>
          <ol className="ad-nav__liste">
            {ONGLETS.map((o, i) => (
              <li key={o.id}>
                <button type="button" className={onglet === o.id ? 'est-actif' : ''} aria-current={onglet === o.id ? 'page' : undefined} onClick={() => { setOnglet(o.id); setDrawerOuvert(false) }}>
                  <span className="ad-nav__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ad-nav__label">{o.label}</span>
                  {o.id === 'sessions' && sessions.length > 0 && <span className="ad-nav__compte">{sessions.length}</span>}
                  {o.id === 'live' && stats.demandesContact > 0 && <span className="ad-nav__compte est-chaud">{stats.demandesContact}</span>}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="ad-nav__pied">
          <details className="ad-apparence">
            <summary>Apparence</summary>
            <PanneauParametres variante="integre" />
          </details>
          <p className="ad-nav__compte-email">{user?.email}</p>
          <div className="ad-nav__boutons">
            <button type="button" className="ad-bouton" onClick={onFermer}><ArrowUpRight size={14} aria-hidden="true" /> Revenir au site</button>
            <button type="button" className="ad-bouton ad-bouton--discret" onClick={deconnexion}><LogOut size={14} aria-hidden="true" /> Déconnexion</button>
          </div>
        </div>
      </aside>
      {drawerOuvert && <div className="ad-voile" onClick={() => setDrawerOuvert(false)} />}

      <main className="ad-principal">
        {/* ── En-tête ── */}
        <header className="ad-tete">
          <button type="button" className="ad-rond ad-tete__menu" onClick={() => setDrawerOuvert(true)} aria-label="Ouvrir le menu"><Menu size={18} /></button>
          <div className="ad-tete__titre">
            <span className="pf-label"><b>{String(ONGLETS.indexOf(ongletCourant) + 1).padStart(2, '0')}</b> {ongletCourant.desc}</span>
            <h1>{ongletCourant.label}</h1>
          </div>
          <div className="ad-tete__droite">
            <span className="ad-horloge">{heure}<small>{dateStr}</small></span>
            <button type="button" className="ad-rond" onClick={onFermer} aria-label="Fermer l'admin et revenir au site" title="Revenir au site"><X size={18} /></button>
          </div>
        </header>

        <div className="ad-contenu" key={onglet}>
          {/* ── AXIS ── */}
          {onglet === 'axis' && (
            <section className="ad-axis">
              <div className="ad-axis__scene">
                <div className={`ad-axis__avatar est-${aiState}`}>
                  <AvatarStable etat={aiState === 'thinking' ? 'thinking' : undefined} taille={isMobile ? 150 : 230} />
                </div>
                <p className={`ad-etat est-${aiState}`}><i aria-hidden="true" />{libelleEtat}</p>
                <div className="ad-modes">
                  <button type="button" className={modeVocal ? 'est-actif' : ''} aria-pressed={modeVocal} onClick={() => setModeVocal((p) => !p)}><Volume2 size={14} aria-hidden="true" /> Voix</button>
                  <button type="button" className={modeParler ? 'est-actif' : ''} aria-pressed={modeParler} onClick={toggleParlerAdmin}><Mic size={14} aria-hidden="true" /> {ecoute ? 'Écoute…' : 'Micro'}</button>
                </div>
                {modeCollectePrompt && <p className="ad-axis__collecte">Mode prompt : AXIS note tes instructions. Dis « sauvegarde » quand tu as fini.</p>}
              </div>
              <div className="ad-axis__chat">
                <div className="ad-fil" ref={chatRef} aria-live="polite">
                  {historiqueAdmin.map((m, i) => (
                    <div key={i} className={`ad-msg ${m.role === 'frejus' ? 'est-moi' : 'est-axis'}`}>
                      <span className="ad-msg__auteur">{m.role === 'frejus' ? 'Toi' : 'AXIS'}</span>
                      <p>{m.texte}</p>
                    </div>
                  ))}
                  {axisTyping && <div className="ad-msg est-axis est-ecrit"><span className="ad-msg__auteur">AXIS</span><p><i /><i /><i /></p></div>}
                </div>
                <div className="ad-suggestions">
                  {suggestions.map((t) => <button key={t} type="button" onClick={() => envoyerAAxis(t)}>{t}</button>)}
                </div>
                {modeParler ? (
                  <div className={`ad-ecoute${ecoute ? ' est-ecoute' : ''}`}><span aria-hidden="true"><i /><i /><i /><i /><i /></span>{ecoute ? 'Écoute en cours — parle' : 'Micro prêt — en attente'}</div>
                ) : (
                  <form className="ad-saisie" onSubmit={(e) => { e.preventDefault(); envoyerAAxis() }}>
                    <input ref={inputRef} value={inputAdmin} onChange={(e) => setInputAdmin(e.target.value)} placeholder="Parle à AXIS…" aria-label="Message pour AXIS" />
                    <button type="submit" className="ad-saisie__envoi" disabled={!inputAdmin.trim()} aria-label="Envoyer"><Send size={16} /></button>
                  </form>
                )}
              </div>
            </section>
          )}

          {/* ── EN DIRECT ── */}
          {onglet === 'live' && (
            <section className="ad-pile">
              <div className="ad-kpis">
                {[['Sessions', stats.total], ['Messages', stats.msgTotal], ['Demandes de contact', stats.demandesContact], ['Demandes de CV', stats.demandesCv]].map(([l, v]) => (
                  <div key={l} className="ad-kpi"><span>{l}</span><b>{v}</b></div>
                ))}
              </div>
              <div className="ad-direct">
                <div className="ad-carte">
                  <header className="ad-carte__tete"><span className="pf-label"><b>Flux</b> 30 dernières sessions</span><span className="ad-pulse"><i />Actualisé toutes les 15 s</span></header>
                  <div className="ad-sessions est-compactes">
                    {sessions.slice(0, 30).map((s) => rendreSession(s, true))}
                    {sessions.length === 0 && <p className="ad-vide">{chargement ? 'Chargement des sessions…' : 'Aucune session enregistrée pour l’instant.'}</p>}
                  </div>
                </div>
                <div className="ad-carte">
                  <header className="ad-carte__tete">
                    <span className="pf-label"><b>Conversation</b> {sessionSelectee ? `${sessionSelectee.prenom_visiteur} · ${profilLabel(sessionSelectee.profil_visiteur)}` : ''}</span>
                    {sessionSelectee && <button type="button" className="ad-lien" onClick={() => setSessionSelectee(null)}>Fermer</button>}
                  </header>
                  {!sessionSelectee ? (
                    <p className="ad-vide">Choisis une session pour lire la conversation.</p>
                  ) : (
                    <div className="ad-fil est-lecture">
                      {(sessionSelectee.historique || []).map((m, i) => (
                        <div key={i} className={`ad-msg ${m.role === 'user' ? 'est-visiteur' : 'est-axis'}`}>
                          <span className="ad-msg__auteur">{m.role === 'user' ? sessionSelectee.prenom_visiteur : 'AXIS'}</span>
                          <p>{m.contenu}</p>
                        </div>
                      ))}
                      {(sessionSelectee.historique || []).length === 0 && <p className="ad-vide">Pas de message dans cette session.</p>}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── SESSIONS ── */}
          {onglet === 'sessions' && (
            <section className="ad-carte">
              <header className="ad-carte__tete"><span className="pf-label"><b>{sessions.length}</b> sessions</span><span className="ad-note">Clique pour lire la conversation</span></header>
              <div className="ad-sessions">
                <div className="ad-sessions__entete" aria-hidden="true"><span>Visiteur</span><span>Profil</span><span>Échanges</span><span>Signaux</span><span>Date</span></div>
                {sessions.map((s) => rendreSession(s, false))}
                {sessions.length === 0 && <p className="ad-vide">{chargement ? 'Chargement des sessions…' : 'Aucune session enregistrée pour l’instant.'}</p>}
              </div>
            </section>
          )}

          {/* ── STATISTIQUES ── */}
          {onglet === 'stats' && (
            <section className="ad-pile">
              <div className="ad-kpis">
                {[['Sessions', stats.total, 'visiteurs'], ['Messages', stats.msgTotal, 'échangés'], ['Durée moyenne', formatDuree(stats.dureeMoy), 'par session'], ['Taux de contact', `${pourcent(stats.demandesContact, stats.total)} %`, 'des visiteurs']].map(([l, v, sous]) => (
                  <div key={l} className="ad-kpi"><span>{l}</span><b>{v}</b><small>{sous}</small></div>
                ))}
              </div>
              <div className="ad-duo">
                <div className="ad-carte">
                  <header className="ad-carte__tete"><span className="pf-label"><b>Profils</b> qui visite</span></header>
                  {[['Recruteurs', stats.recruteurs, profilColor('recruiter')], ['Clients', stats.clients, profilColor('client')], ['Curieux', stats.curieux, profilColor('curieux')], ['Collaborateurs', stats.collabs, profilColor('collaborateur')]].map(([l, v, c]) => (
                    <div key={l} className="ad-barre" style={{ '--c': c, '--p': `${pourcent(v, stats.total)}%` }}>
                      <div><span>{l}</span><b>{v} <small>{pourcent(v, stats.total)} %</small></b></div>
                      <i />
                    </div>
                  ))}
                </div>
                <div className="ad-carte">
                  <header className="ad-carte__tete"><span className="pf-label"><b>Signaux</b> d’intérêt</span></header>
                  <dl className="ad-signaux">
                    <div><dt>Demandes de contact</dt><dd>{stats.demandesContact}</dd></div>
                    <div><dt>Demandes de CV</dt><dd>{stats.demandesCv}</dd></div>
                    <div><dt>Taux de CV</dt><dd>{pourcent(stats.demandesCv, stats.total)} %</dd></div>
                    <div><dt>Messages par session</dt><dd>{stats.total ? Math.round(stats.msgTotal / stats.total) : 0}</dd></div>
                  </dl>
                </div>
              </div>
            </section>
          )}

          {/* ── INSTRUCTIONS ── */}
          {onglet === 'prompt' && (
            <section className="ad-pile">
              <div className="ad-sous-onglets" role="tablist">
                {[['systeme', 'Prompt système'], ['additionnel', 'Instructions additionnelles'], ['historique', `Historique (${promptsHistorique.length})`]].map(([id, l]) => (
                  <button key={id} type="button" role="tab" aria-selected={ongletPrompt === id} className={ongletPrompt === id ? 'est-actif' : ''} onClick={() => setOngletPrompt(id)}>{l}</button>
                ))}
              </div>
              {ongletPrompt !== 'historique' && (() => {
                const systeme = ongletPrompt === 'systeme'
                const valeur = systeme ? promptSysteme : promptTexte
                const sauve = systeme ? promptSystemeSauvegarde : promptSauvegarde
                return (
                  <div className="ad-carte">
                    <header className="ad-carte__tete">
                      <span className="pf-label"><b>{systeme ? 'Système' : 'Additionnel'}</b> {systeme ? 'remplace le prompt de base d’AXIS' : 's’ajoute aux prochaines conversations'}</span>
                      <button type="button" className={`ad-bouton ad-bouton--plein${sauve ? ' est-ok' : ''}`} onClick={() => (systeme ? sauvegarderPromptSysteme() : sauvegarderPrompt())}>{sauve ? 'Enregistré ✓' : 'Enregistrer'}</button>
                    </header>
                    <textarea className="ad-texte" value={valeur} onChange={(e) => (systeme ? setPromptSysteme(e.target.value) : setPromptTexte(e.target.value))} placeholder={systeme ? 'Tu es AXIS, l’IA du portfolio de Fréjus…' : 'Ajoute ici des consignes pour AXIS…'} spellCheck />
                    <p className="ad-note">{valeur.length} caractères</p>
                  </div>
                )
              })()}
              {ongletPrompt === 'historique' && (
                <div className="ad-pile">
                  {promptsHistorique.length === 0 && <p className="ad-vide">Aucune version enregistrée.</p>}
                  {promptsHistorique.map((p) => (
                    <article key={p.id} className="ad-carte ad-version">
                      <header className="ad-carte__tete">
                        <span className="pf-label"><b>{p.titre}</b> {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        <button type="button" className="ad-bouton" onClick={() => { setPromptTexte(p.contenu); setOngletPrompt('additionnel') }}>Restaurer</button>
                      </header>
                      <p className="ad-version__texte">{p.contenu}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── PROJETS ── */}
          {onglet === 'projets' && (
            <section className="ad-pile">
              <div className="ad-barre-actions">
                <span className="ad-note">{projetsListe.length} projet{projetsListe.length > 1 ? 's' : ''}{portfolioSauvegarde && <b className="ad-ok"> · Enregistré ✓</b>}</span>
                <div>
                  <button type="button" className="ad-bouton ad-bouton--discret" onClick={importerDonneesParDefaut} disabled={importEnCours}>{importEnCours ? 'Import…' : importReussi ? 'Importé ✓' : 'Importer les données par défaut'}</button>
                  <button type="button" className="ad-bouton ad-bouton--plein" onClick={() => setProjetEnEdition({ titre: '', categorie: '', type: 'frontend', tags: [], desc: '', img: '', lien: '', annee: String(new Date().getFullYear()), status: 'EN LIGNE', ordre: projetsListe.length })}><Plus size={14} aria-hidden="true" /> Nouveau projet</button>
                </div>
              </div>
              {chargementPortfolio ? <p className="ad-vide">Chargement…</p> : (
                <div className="ad-projets">
                  {projetsListe.map((p) => (
                    <article key={p.id} className="ad-projet" style={{ '--c': COULEURS_TYPE[p.type] || a }}>
                      <button type="button" className="ad-projet__visuel" onClick={() => setProjetEnApercu(p)} aria-label={`Aperçu de ${p.titre}`}>
                        {p.img ? <img src={p.img} alt="" loading="lazy" /> : <span>Pas d’image</span>}
                        <b className="ad-projet__type"><i />{p.type}</b>
                      </button>
                      <div className="ad-projet__corps">
                        <h3>{p.titre || 'Sans titre'}</h3>
                        <p>{p.categorie || '—'} · {p.annee || '—'} · {p.status || '—'}</p>
                        <p className="ad-projet__tags">{(p.tags || []).join(' · ') || '—'}</p>
                      </div>
                      <div className="ad-projet__actions">
                        <button type="button" className="ad-lien" onClick={() => setProjetEnEdition(p)}><Pencil size={13} aria-hidden="true" /> Modifier</button>
                        <button type="button" className="ad-lien est-danger" onClick={() => { if (confirm(`Supprimer « ${p.titre} » ?`)) retirerProjet(p.id) }}><Trash2 size={13} aria-hidden="true" /> Supprimer</button>
                      </div>
                    </article>
                  ))}
                  {projetsListe.length === 0 && <p className="ad-vide">Aucun projet. Ajoute le premier ou importe les données par défaut.</p>}
                </div>
              )}
            </section>
          )}

          {/* ── COMPÉTENCES ── */}
          {onglet === 'competences' && (
            <section className="ad-pile">
              <div className="ad-barre-actions">
                <span className="ad-note">{competencesListe.length} catégorie{competencesListe.length > 1 ? 's' : ''}{portfolioSauvegarde && <b className="ad-ok"> · Enregistré ✓</b>}</span>
                <div>
                  <button type="button" className="ad-bouton ad-bouton--discret" onClick={importerDonneesParDefaut} disabled={importEnCours}>{importEnCours ? 'Import…' : importReussi ? 'Importé ✓' : 'Importer les données par défaut'}</button>
                  <button type="button" className="ad-bouton ad-bouton--plein" onClick={() => setCompetenceEnEdition({ cat: '', items: [], ordre: competencesListe.length })}><Plus size={14} aria-hidden="true" /> Nouvelle catégorie</button>
                </div>
              </div>
              {chargementPortfolio ? <p className="ad-vide">Chargement…</p> : (
                <div className="ad-competences">
                  {competencesListe.map((c) => (
                    <article key={c.id} className="ad-carte ad-competence">
                      <header className="ad-carte__tete">
                        <h3>{c.cat}</h3>
                        <div>
                          <button type="button" className="ad-lien" onClick={() => setCompetenceEnEdition(c)}><Pencil size={13} aria-hidden="true" /> Modifier</button>
                          <button type="button" className="ad-lien est-danger" onClick={() => { if (confirm(`Supprimer la catégorie « ${c.cat} » ?`)) retirerCompetence(c.id) }}><Trash2 size={13} aria-hidden="true" /> Supprimer</button>
                        </div>
                      </header>
                      {(c.items || []).map((it, i) => (
                        <div key={i} className="ad-barre" style={{ '--c': a, '--p': `${it.pct}%` }}>
                          <div><span>{it.nom}</span><b>{it.pct} %</b></div>
                          <i />
                        </div>
                      ))}
                    </article>
                  ))}
                  {competencesListe.length === 0 && <p className="ad-vide">Aucune catégorie. Ajoute la première ou importe les données par défaut.</p>}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* ── Édition d'un projet ── */}
      {projetEnEdition && (
        <Modale
          titre={projetEnEdition.id ? 'Modifier le projet' : 'Nouveau projet'}
          large
          onFermer={fermerEdition}
          actions={<>
            <button type="button" className="ad-bouton ad-bouton--discret" onClick={fermerEdition}>Annuler</button>
            <button type="button" className="ad-bouton ad-bouton--plein" disabled={televersement.enCours || !projetEnEdition.titre?.trim()} onClick={() => sauvegarderProjet(projetEnEdition)}>Enregistrer</button>
          </>}
        >
          <div className="ad-formulaire">
            <div className="ad-formulaire__champs">
              <label className="ad-champ"><span>Titre</span><input value={projetEnEdition.titre || ''} onChange={(e) => setProjetEnEdition((p) => ({ ...p, titre: e.target.value }))} autoFocus /></label>
              <div className="ad-grille-2">
                <label className="ad-champ"><span>Catégorie</span><input value={projetEnEdition.categorie || ''} onChange={(e) => setProjetEnEdition((p) => ({ ...p, categorie: e.target.value }))} /></label>
                <label className="ad-champ"><span>Type</span>
                  <select value={projetEnEdition.type || 'frontend'} onChange={(e) => setProjetEnEdition((p) => ({ ...p, type: e.target.value }))}>
                    <option value="frontend">Frontend</option><option value="fullstack">Fullstack</option><option value="ia">IA & Data</option><option value="impact">Impact social</option>
                  </select>
                </label>
              </div>
              <label className="ad-champ"><span>Technologies (séparées par des virgules)</span><input value={(projetEnEdition.tags || []).join(', ')} onChange={(e) => setProjetEnEdition((p) => ({ ...p, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))} /></label>
              <label className="ad-champ"><span>Description</span><textarea rows={5} value={projetEnEdition.desc || ''} onChange={(e) => setProjetEnEdition((p) => ({ ...p, desc: e.target.value }))} /></label>
              <label className="ad-champ"><span>Lien</span><input type="url" placeholder="https://…" value={projetEnEdition.lien || ''} onChange={(e) => setProjetEnEdition((p) => ({ ...p, lien: e.target.value }))} /></label>
              <div className="ad-grille-3">
                <label className="ad-champ"><span>Année</span><input inputMode="numeric" value={projetEnEdition.annee || ''} onChange={(e) => setProjetEnEdition((p) => ({ ...p, annee: e.target.value }))} /></label>
                <label className="ad-champ"><span>Statut</span>
                  <select value={projetEnEdition.status || 'EN LIGNE'} onChange={(e) => setProjetEnEdition((p) => ({ ...p, status: e.target.value }))}>
                    <option>EN LIGNE</option><option>EN PRODUCTION</option><option>SUR GITHUB</option><option>PRIVÉ</option>
                  </select>
                </label>
                <label className="ad-champ"><span>Ordre</span><input type="number" value={projetEnEdition.ordre ?? 0} onChange={(e) => setProjetEnEdition((p) => ({ ...p, ordre: Number(e.target.value) }))} /></label>
              </div>
            </div>
            <div className="ad-formulaire__image">
              <span className="ad-champ__label">Image du projet</span>
              <label
                className={`ad-depot${survolDepot ? ' est-survol' : ''}${televersement.enCours ? ' est-envoi' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setSurvolDepot(true) }}
                onDragLeave={() => setSurvolDepot(false)}
                onDrop={(e) => { e.preventDefault(); setSurvolDepot(false); choisirImage(e.dataTransfer.files?.[0]) }}
              >
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e) => { choisirImage(e.target.files?.[0]); e.target.value = '' }} disabled={televersement.enCours} />
                {projetEnEdition.img ? <img src={projetEnEdition.img} alt="Aperçu de l'image du projet" /> : (
                  <span className="ad-depot__invite"><Upload size={22} aria-hidden="true" /><b>Choisir une image</b>ou la glisser ici · JPG, PNG, WebP</span>
                )}
                {televersement.enCours && <span className="ad-depot__voile"><i /> Compression et envoi…</span>}
              </label>
              {projetEnEdition.img && !televersement.enCours && (
                <div className="ad-depot__actions">
                  <label className="ad-lien ad-lien--fichier"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e) => { choisirImage(e.target.files?.[0]); e.target.value = '' }} /><Upload size={13} aria-hidden="true" /> Remplacer</label>
                  <button type="button" className="ad-lien est-danger" onClick={() => setProjetEnEdition((p) => ({ ...p, img: '' }))}><Trash2 size={13} aria-hidden="true" /> Retirer</button>
                </div>
              )}
              {televersement.erreur && <p className="ad-erreur" role="alert">{televersement.erreur}</p>}
              {televersement.mode === 'integre' && <p className="ad-note">Image compressée et enregistrée avec le projet (Firebase Storage n’est pas disponible).</p>}
              {televersement.mode === 'stockage' && <p className="ad-note ad-ok">Image envoyée ✓</p>}
            </div>
          </div>
        </Modale>
      )}

      {/* ── Aperçu d'un projet ── */}
      {projetEnApercu && (
        <Modale
          titre={projetEnApercu.titre}
          onFermer={() => setProjetEnApercu(null)}
          actions={<button type="button" className="ad-rond" onClick={() => setProjetEnApercu(null)} aria-label="Fermer"><X size={16} /></button>}
        >
          <div className="ad-apercu">
            {projetEnApercu.img && <img src={projetEnApercu.img} alt="" />}
            <p className="pf-label"><b>{projetEnApercu.status}</b> {projetEnApercu.categorie} · {projetEnApercu.annee}</p>
            <p className="ad-apercu__desc">{projetEnApercu.desc}</p>
            <ul className="ad-tags">{(projetEnApercu.tags || []).map((t) => <li key={t}>{t}</li>)}</ul>
            <div className="ad-apercu__actions">
              {projetEnApercu.lien && <a className="ad-lien" href={projetEnApercu.lien} target="_blank" rel="noopener noreferrer">Voir le projet ↗</a>}
              <button type="button" className="ad-bouton" onClick={() => { const p = projetEnApercu; setProjetEnApercu(null); setProjetEnEdition(p) }}><Pencil size={14} aria-hidden="true" /> Modifier</button>
            </div>
          </div>
        </Modale>
      )}

      {/* ── Édition d'une catégorie de compétences ── */}
      {competenceEnEdition && (
        <Modale
          titre={competenceEnEdition.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          onFermer={() => setCompetenceEnEdition(null)}
          actions={<>
            <button type="button" className="ad-bouton ad-bouton--discret" onClick={() => setCompetenceEnEdition(null)}>Annuler</button>
            <button type="button" className="ad-bouton ad-bouton--plein" disabled={!competenceEnEdition.cat?.trim()} onClick={() => sauvegarderCompetence(competenceEnEdition)}>Enregistrer</button>
          </>}
        >
          <div className="ad-pile">
            <div className="ad-grille-2">
              <label className="ad-champ"><span>Nom de la catégorie</span><input value={competenceEnEdition.cat || ''} onChange={(e) => setCompetenceEnEdition((p) => ({ ...p, cat: e.target.value }))} autoFocus /></label>
              <label className="ad-champ"><span>Ordre</span><input type="number" value={competenceEnEdition.ordre ?? 0} onChange={(e) => setCompetenceEnEdition((p) => ({ ...p, ordre: Number(e.target.value) }))} /></label>
            </div>
            <span className="ad-champ__label">Compétences</span>
            {(competenceEnEdition.items || []).map((it, idx) => {
              const maj = (champ, v) => setCompetenceEnEdition((p) => { const items = [...(p.items || [])]; items[idx] = { ...items[idx], [champ]: v }; return { ...p, items } })
              return (
                <div key={idx} className="ad-item">
                  <input aria-label="Nom" placeholder="Nom" value={it.nom} onChange={(e) => maj('nom', e.target.value)} />
                  <input aria-label="Niveau" type="range" min="0" max="100" value={it.pct || 0} onChange={(e) => maj('pct', Number(e.target.value))} />
                  <output>{it.pct || 0} %</output>
                  <button type="button" className="ad-rond" aria-label={`Retirer ${it.nom || 'cette compétence'}`} onClick={() => setCompetenceEnEdition((p) => ({ ...p, items: (p.items || []).filter((_, i) => i !== idx) }))}><X size={14} /></button>
                </div>
              )
            })}
            <button type="button" className="ad-bouton" onClick={() => setCompetenceEnEdition((p) => ({ ...p, items: [...(p.items || []), { nom: '', pct: 50 }] }))}><Plus size={14} aria-hidden="true" /> Ajouter une compétence</button>
          </div>
        </Modale>
      )}
    </div>
  )
}

// Fenêtre modale (définie hors du tableau de bord pour ne pas être recréée à chaque rendu)
function Modale({ titre, onFermer: fermerModale, actions, large, children }) {
  return (
    <div className="ad-modale" onClick={fermerModale}>
      <div className={`ad-modale__carte${large ? ' est-large' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={titre}>
        <header className="ad-modale__tete">
          <h2>{titre}</h2>
          <div className="ad-modale__actions">{actions}</div>
        </header>
        <div className="ad-modale__corps">{children}</div>
      </div>
    </div>
  )
}
