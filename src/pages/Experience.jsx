import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserStore from '@/store/utiliserStore'
import utiliserTheme from '@/store/utiliserTheme'
import { useAxis } from '@/hooks/utiliserDevJAI'
import AvatarAxis from '@/composants/ui/AvatarAxis'
import { parlerAxis } from '@/services/voixAxis'

// Import du hook AXIS renommé sans changer le nom du fichier
import Portfolio from '@/composants/Portfolio'
import PanneauParametres from '@/composants/ui/PanneauParametres'
import { Volume2, Layout, RotateCcw, Send, MapPin, Briefcase, Zap, Mic, MessageSquare, PenLine, X, SlidersHorizontal } from 'lucide-react'
import { gsap, useGSAP, EASE, mouvementReduit } from '@/composants/portfolio/moteur/gsap'
import { variablesTheme } from '@/composants/portfolio/moteur/contexte'
import './experience.css'
import { creerCompteurTouches } from '@/hooks/useAccesSecret'
import cartesPortfolio from '@/donnees/cartesPortfolio'
import usePortfolioData from '@/hooks/usePortfolioData'

const AvatarStable = React.memo(function AvatarStable({ etat, width = 280, height = 280 }) {
  return (
    <AvatarAxis
      width={width}
      height={height}
      etat={etat}
    />
  )
})

export default function Experience() {
  const { visiteur } = utiliserStore()
  const naviguer = useNavigate()
  const { theme, setTheme, mode, getThemeEffectif } = utiliserTheme()
  const eff = getThemeEffectif ? getThemeEffectif() : theme
  const isLight = mode === 'light'

  useEffect(() => {
    const handler = (e) => {
      const { setMode, mode } = utiliserTheme.getState
        ? utiliserTheme.getState()
        : {}
      if (setMode && mode !== e.detail) setMode(e.detail)
    }
    window.addEventListener('axis-set-mode', handler)
    return () => window.removeEventListener('axis-set-mode', handler)
  }, [])

  const [modeVocal, setModeVocal] = useState(true)
  const [modeChat, setModeChat] = useState(false)
  const [modePortfolio, setModePortfolio] = useState(false)
  // Le portfolio reste affiché pendant son animation de fermeture (760 ms)
  const [portfolioVisible, setPortfolioVisible] = useState(false)
  if (modePortfolio && !portfolioVisible) setPortfolioVisible(true)
  useEffect(() => {
    if (modePortfolio || !portfolioVisible) return
    const t = setTimeout(() => setPortfolioVisible(false), 760)
    return () => clearTimeout(t)
  }, [modePortfolio, portfolioVisible])
  const [modeParler, setModeParler] = useState(
    visiteur.microActif === true
  )
  const [ecoute, setEcoute] = useState(false) // vraie = micro actif
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [drawerSys, setDrawerSys] = useState(false)
  const [dernierMessage, setDernierMessage] = useState('')
  const [bulleVisible, setBulleVisible] = useState(false)
  const [photoFrejusVisible, setPhotoFrejusVisible] = useState(false)
  const [inputCmd, setInputCmd] = useState('')
  const [heure, setHeure] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [, setSectionActive] = useState(null)
  const [cartesActives, setCartesActives] = useState([])
  // CORRECTION 2B — État pour afficher/masquer la zone d'écriture dans le portfolio
  const [inputPortfolioVisible, setInputPortfolioVisible] = useState(false)
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
  const xpRef = useRef(null)
  // Accès secret à l'espace admin : 5 touches rapides sur l'avatar
  const [toucherAvatar] = useState(() => creerCompteurTouches(5, 3000))

  // Entrée de l'espace AXIS
  useGSAP(() => {
    if (mouvementReduit() || !xpRef.current) return
    const q = gsap.utils.selector(xpRef)
    gsap.timeline({ defaults: { ease: EASE.sortie } })
      .from(q('[data-xp-tete] > *'), { y: -24, autoAlpha: 0, duration: 0.9, stagger: 0.08 })
      .from(q('[data-xp-avatar]'), { scale: 0.82, autoAlpha: 0, duration: 1.5 }, 0.1)
      .from(q('[data-xp-panneau] > *'), { y: 30, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.3)
      .from(q('[data-xp-saisie]'), { y: 40, autoAlpha: 0, duration: 1 }, 0.5)
  }, { scope: xpRef })
  const derniereQuestionRef = useRef('')
  const sectionEnAttenteRef = useRef(null)
  const { envoyerMessage, estEnChargement, estEnTrain, messageCourant } = useAxis()
  // État d'AXIS dérivé du store : réflexion pendant l'appel à Groq,
  // parole pendant la lecture / l'affichage de la réponse
  const aiState = estEnChargement ? 'thinking' : estEnTrain ? 'speaking' : 'idle'
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
                     'présente', 'présentation', 'bio', 'profil', 'frejus', 'académique'],
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

  // Projets lus dans la base ; compétences avec repli sur cartesPortfolio
  const competencesParDefaut = cartesPortfolio.skills || []
  const { projets, competences } = usePortfolioData(competencesParDefaut)

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

  const parseEtExecuterCommande = useCallback((texteReponse) => {
    const match = texteReponse.match(/<AXIS_CMD>(.*?)<\/AXIS_CMD>/s)
    if (!match) return texteReponse

    try {
      const cmd = JSON.parse(match[1])

      switch (cmd.action) {
        case 'SET_CHAT':
          setModeChat(cmd.valeur === 'on')
          break
        case 'SET_VOCAL':
          setModeVocal(cmd.valeur === 'on')
          break
        case 'SET_MICRO':
          if (cmd.valeur === 'on') {
            setModeParler(true)
            modeParlerRef.current = true
          } else {
            setModeParler(false)
            modeParlerRef.current = false
            try { recognitionRef.current?.abort() } catch {}
            setEcoute(false)
          }
          break
        case 'SET_THEME': {
          const themesMap = {
            vert:   { id:'vert',   accent:'#10b981', accentRgb:'16,185,129',   accentFonce:'#059669', fond:'#030303', fondSecondaire:'#050505', texte:'#ffffff', grille:'rgba(16,185,129,0.025)' },
            rouge:  { id:'rouge',  accent:'#ef4444', accentRgb:'239,68,68',    accentFonce:'#dc2626', fond:'#030303', fondSecondaire:'#050505', texte:'#ffffff', grille:'rgba(239,68,68,0.025)' },
            blanc:  { id:'blanc',  accent:'#e2e8f0', accentRgb:'226,232,240',  accentFonce:'#cbd5e1', fond:'#050508', fondSecondaire:'#080810', texte:'#ffffff', grille:'rgba(226,232,240,0.025)' },
            orange: { id:'orange', accent:'#f97316', accentRgb:'249,115,22',   accentFonce:'#ea580c', fond:'#080400', fondSecondaire:'#120600', texte:'#ffffff', grille:'rgba(249,115,22,0.025)' },
            violet: { id:'violet', accent:'#a855f7', accentRgb:'168,85,247',   accentFonce:'#9333ea', fond:'#050008', fondSecondaire:'#110016', texte:'#ffffff', grille:'rgba(168,85,247,0.025)' },
            rose:   { id:'rose',   accent:'#ec4899', accentRgb:'236,72,153',   accentFonce:'#db2777', fond:'#080004', fondSecondaire:'#14000c', texte:'#ffffff', grille:'rgba(236,72,153,0.025)' },
              bleu:   { id:'bleu',   accent:'#3b82f6', accentRgb:'59,130,246',   accentFonce:'#2563eb', fond:'#020510', fondSecondaire:'#040820', texte:'#ffffff', grille:'rgba(59,130,246,0.025)' },
              noir:   { id:'noir',   accent:'#94a3b8', accentRgb:'148,163,184',   accentFonce:'#64748b', fond:'#000000', fondSecondaire:'#080808', texte:'#ffffff', grille:'rgba(148,163,184,0.02)' },
          }
          const t = themesMap[cmd.valeur.toLowerCase()]
          if (t) setTheme(t)
          break
        }
        case 'SET_MODE':
          // toggleMode si le mode actuel est différent
          // On utilise un event personnalisé pour communiquer avec le store
          window.dispatchEvent(new CustomEvent('axis-set-mode', { detail: cmd.valeur }))
          break
        case 'DOWNLOAD_CV': {
          const link = document.createElement('a')
          link.href = '/asset/cv_frejus.pdf'
          link.download = 'cv_frejus.pdf'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          break
        }
        case 'OPEN_PORTFOLIO':
          setModePortfolio(true)
          break
        case 'CLOSE_PORTFOLIO':
          setModePortfolio(false)
          break
        default:
          break
      }
    } catch (e) {
      console.warn('[AXIS_CMD] parse error:', e)
    }

    return texteReponse.replace(/<AXIS_CMD>.*?<\/AXIS_CMD>/s, '').trim()
  }, [setTheme, setModeChat, setModeVocal, setModeParler, setModePortfolio])

  useEffect(() => {
    if (!messageCourant || messageCourant === dernierMessage) return

    const init = window.setTimeout(() => {
      const messageNettoye = parseEtExecuterCommande(messageCourant)
      setDernierMessage(messageNettoye)

      // ── Détection ouverture portfolio ──
      const reponseIA = messageNettoye.toLowerCase()
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
          'projet':      'projects',
          'compétence':  'skills',
          'contact':     'contact',
          'parcours':    'academic',
          'académique':  'academic',
          'à propos':    'about',
          'about':       'about',
          'service':     'services',
          'tarif':       'services',
          'github':      'github',
          'méthode':     'methodology',
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
      if (detectionPhoto(messageNettoye, derniereQuestionRef.current)) {
        setPhotoFrejusVisible(true)
        setTimeout(() => setPhotoFrejusVisible(false), 9000)
      }
      // Détecter la commande de retour
      const msgLower = messageNettoye.toLowerCase()
      const retourMots = [
        'reviens à mon espace', 'je reviens à mon espace',
        'retourne à mon espace', 'ferme le portfolio'
      ]
      if (retourMots.some(m => msgLower.includes(m))) {
        setModePortfolio(false)
      }

      // ── Navigation de section quand portfolio déjà ouvert ──
      if (modePortfolio && portfolioRef.current) {
        // Map mots-clés → ID de section dans Portfolio.jsx
        const sectionMap = {
          'accueil':      'hero',
          'hero':         'hero',
          'début':        'hero',
          'haut':         'hero',
          'à propos':     'about',
          'about':        'about',
          'présentation': 'about',
          'qui':          'about',
          'compétence':   'skills',
          'skill':        'skills',
          'technologie':  'skills',
          'stack':        'skills',
          'projet':       'projects',
          'réalisation':  'projects',
          'travaux':      'projects',
          'service':      'services',
          'tarif':        'services',
          'prix':         'services',
          'offre':        'services',
          'méthode':      'methodology',
          'méthodologie': 'methodology',
          'processus':    'methodology',
          'étape':        'methodology',
          'contact':      'contact',
          'joindre':      'contact',
          'email':        'contact',
          'whatsapp':     'contact',
          'parcours':     'academic',
          'académique':   'academic',
          'formation':    'academic',
          'diplôme':      'academic',
          'github':       'github',
          'activité':     'github',
          'contribution': 'github',
        }

        // Chercher dans la question de l'utilisateur (priorité)
        let sectionDetectee = null
        Object.entries(sectionMap).forEach(([mot, section]) => {
          if (questionUsr.includes(mot) && !sectionDetectee) {
            sectionDetectee = section
          }
        })

        // Si rien trouvé dans la question, chercher dans la réponse
        if (!sectionDetectee) {
          Object.entries(sectionMap).forEach(([mot, section]) => {
            if (reponseIA.includes(mot) && !sectionDetectee) {
              sectionDetectee = section
            }
          })
        }

        // Mots déclencheurs qui confirment une intention de navigation
        const motsDeclencheurs = [
          'va', 'aller', 'naviguer', 'navigue', 'montre',
          'affiche', 'voir', 'voir la', 'voir les', 'ouvre',
          'section', 'scroll', 'descend', 'accède', 'emmène',
          'rends', 'dirige', 'va vers', 'montre-moi',
        ]

        const intentionNavigation = motsDeclencheurs.some(m =>
          questionUsr.includes(m) || reponseIA.includes(m)
        )

        // Naviguer seulement si intention + section détectée
        if (sectionDetectee && intentionNavigation) {
          console.log('[nav-portfolio] section détectée:', sectionDetectee)
          portfolioRef.current.naviguerVers(sectionDetectee)
          setSectionActive(sectionDetectee)
          setTimeout(() => setSectionActive(null), 3000)
        }
      }

      setBulleVisible(true)
      // Afficher la photo de Fréjus dès le premier message
      if (!derniereQuestionRef.current) {
        setPhotoFrejusVisible(true)
        setTimeout(() => setPhotoFrejusVisible(false), 9000)
      }
      const cartes = detecterCartes(messageNettoye, derniereQuestionRef.current)
      setCartesActives(cartes)
      console.log('[cartes] cartesActives définies:', cartes.map(c => c.id))
    }, 0)

    return () => window.clearTimeout(init)
  }, [messageCourant, dernierMessage, modePortfolio, parseEtExecuterCommande])

  // Voix d'AXIS : ElevenLabs, sinon voix du navigateur, sinon bouche en silence
  useEffect(() => {
    if (!dernierMessage) return
    const arreter = parlerAxis(dernierMessage, {
      vocal: modeVocal,
      surFin: () => setCartesActives([]),
    })
    return arreter
  }, [dernierMessage, modeVocal])

  // ── Micro : une seule écoute à la fois, coupée pendant que AXIS réfléchit
  // ou parle (sinon il s'entend lui-même), relancée sans clignoter tant
  // que le visiteur garde le micro ouvert.
  const aiStateRef = useRef(aiState)
  useEffect(() => { aiStateRef.current = aiState }, [aiState])
  const silencesRef = useRef(0) // écoutes de suite sans aucune parole
  const MAX_SILENCES = 10 // ≈ 1 minute sans rien dire : le micro se coupe

  const arreterMicro = useCallback(() => {
    const rec = recognitionRef.current
    recognitionRef.current = null
    if (rec) {
      rec.onend = null; rec.onresult = null; rec.onerror = null
      try { rec.abort() } catch { /* déjà arrêté */ }
    }
    setEcoute(false)
  }, [])

  const demarrerMicro = useCallback(function demarrer() {
    if (!modeParlerRef.current || aiStateRef.current !== 'idle' || recognitionRef.current) return
    const RecVocale = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!RecVocale) return
    const rec = new RecVocale()
    rec.lang = 'fr-FR'
    rec.continuous = false
    rec.interimResults = false
    let entendu = false

    rec.onstart = () => setEcoute(true)
    rec.onresult = (event) => {
      if (aiStateRef.current !== 'idle') return
      const texte = event.results[0][0].transcript.trim()
      if (!texte) return
      entendu = true
      silencesRef.current = 0
      derniereQuestionRef.current = texte
      envoyerMessageRef.current(texte)
    }
    rec.onerror = (e) => {
      // Micro refusé ou absent : inutile de réessayer en boucle
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(e.error)) {
        modeParlerRef.current = false
        setModeParler(false)
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('[micro]', e.error)
      }
    }
    rec.onend = () => {
      if (recognitionRef.current !== rec) return
      recognitionRef.current = null
      if (!entendu) silencesRef.current += 1
      if (silencesRef.current >= MAX_SILENCES) {
        modeParlerRef.current = false
        setModeParler(false)
      }
      if (modeParlerRef.current && aiStateRef.current === 'idle') {
        // Le navigateur ferme l'écoute après un silence : on la rouvre
        // aussitôt, l'indicateur reste sur « écoute »
        setTimeout(demarrer, 250)
      } else {
        setEcoute(false)
      }
    }
    recognitionRef.current = rec
    try { rec.start() } catch { recognitionRef.current = null; setEcoute(false) }
  }, [])

  useEffect(() => {
    if (modeParler && aiState === 'idle') {
      silencesRef.current = 0
      const t = setTimeout(demarrerMicro, 700) // laisse la fin de la voix se dissiper
      return () => clearTimeout(t)
    }
    arreterMicro()
  }, [aiState, modeParler, arreterMicro, demarrerMicro])

  useEffect(() => {
    return () => {
      const rec = recognitionRef.current
      recognitionRef.current = null
      if (rec) { rec.onend = null; try { rec.abort() } catch { /* déjà arrêté */ } }
      utiliserStore.getState().definirAxisParle(false)
    }
  }, []) // [] = seulement au démontage du composant

  const soumettre = useCallback(() => {
    if (!inputCmd.trim()) return
    derniereQuestionRef.current = inputCmd.trim()
    envoyerMessage(inputCmd.trim())
    setInputCmd('')
  }, [inputCmd, envoyerMessage, setInputCmd])

  const envoyerCommande = (cmd) => {
    derniereQuestionRef.current = cmd
    envoyerMessageRef.current(cmd)
  }

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
      silencesRef.current = 0
      setModeParler(true)
      modeParlerRef.current = true
      demarrerMicro() // dans le geste du visiteur : le navigateur accepte la demande d'accès
    } else {
      modeParlerRef.current = false
      setModeParler(false)
      arreterMicro()
    }
  }, [modeParler, demarrerMicro, arreterMicro])

  // ── Affichage ───────────────────────────────────────────────────────────
  const libelleEtat = aiState === 'idle' ? 'En attente' : aiState === 'thinking' ? 'Réflexion…' : 'Parole'
  const profils = { recruiter: 'Recruteur', recruteur: 'Recruteur', client: 'Client', collaborateur: 'Collaborateur', collab: 'Collaborateur', curieux: 'Curieux' }
  const libelleProfil = profils[visiteur.profession] || visiteur.profession || '—'
  const raccourcis = ['> voir le portfolio', '> mes projets', '> me contacter', '> mon parcours']
  const avatarTaille = isMobile ? 230 : 340
  const reponseVisible = bulleVisible && (modeChat || !modeVocal) && !modePortfolio

  const ouvrirCarte = () => {
    const carte = cartesActives[0]
    setModePortfolio(true)
    setTimeout(() => {
      if (portfolioRef.current) {
        const sectionMap = { projets: 'projects', competences: 'skills', contact: 'contact', parcours: 'academic', services: 'services' }
        portfolioRef.current.naviguerVers(sectionMap[carte?.id] || 'hero')
      }
    }, 400)
    setCartesActives([])
  }

  const fermerPortfolio = () => { setModePortfolio(false); setInputPortfolioVisible(false) }

  const blocSession = (
    <section className="xp-bloc" aria-label="Session">
      <span className="pf-label"><b>01</b> Session</span>
      <dl className="xp-session">
        <div><dt>Visiteur</dt><dd>{visiteur.prenom || '—'}</dd></div>
        <div><dt>Profil</dt><dd>{libelleProfil}</dd></div>
        <div><dt>Statut</dt><dd className="xp-session__statut"><i aria-hidden="true" />Connecté</dd></div>
      </dl>
    </section>
  )
  const blocRaccourcis = (
    <section className="xp-bloc" aria-label="Raccourcis">
      <span className="pf-label"><b>02</b> Raccourcis</span>
      <ul className="xp-raccourcis">
        {raccourcis.map((cmd) => (
          <li key={cmd}>
            <button type="button" onClick={() => { envoyerCommande(cmd); setDrawerSys(false) }}>
              <span>{cmd.replace('> ', '')}</span><i aria-hidden="true">↗</i>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
  const interrupteur = (actif) => <span className={`xp-switch${actif ? ' est-actif' : ''}`} aria-hidden="true"><i /></span>
  const blocModes = (
    <section className="xp-bloc" aria-label="Modes">
      <span className="pf-label"><b>03</b> Modes</span>
      <div className="xp-modes">
        <button type="button" role="switch" aria-checked={modeVocal} onClick={() => setModeVocal((p) => !p)}>
          <Volume2 size={16} aria-hidden="true" /><span>Voix d'AXIS</span>{interrupteur(modeVocal)}
        </button>
        <button type="button" role="switch" aria-checked={modeChat} onClick={() => setModeChat((p) => !p)}>
          <MessageSquare size={16} aria-hidden="true" /><span>Afficher le texte</span>{interrupteur(modeChat)}
        </button>
        <button type="button" role="switch" aria-checked={modeParler} onClick={toggleParler}>
          <Mic size={16} aria-hidden="true" /><span>{ecoute ? 'Écoute en cours…' : 'Micro'}</span>{interrupteur(modeParler)}
        </button>
      </div>
    </section>
  )
  const blocSysteme = (
    <section className="xp-bloc" aria-label="Système">
      <span className="pf-label"><b>04</b> Système</span>
      <dl className="xp-systeme">
        {[['Moteur', 'AXIS'], ['Session', 'Active'], ['Voix', 'FR-FR']].map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
    </section>
  )

  return (
    <div className={`xp ${isLight ? 'est-clair' : 'est-sombre'}`} style={variablesTheme(eff, isLight)} ref={xpRef}>
      <header className="xp-tete" data-xp-tete>
        <div className="xp-tete__gauche">
          <span className="xp-logo">&lt;<span>/DevJ</span>&gt;</span>
          <span className="xp-statut"><i aria-hidden="true" />AXIS en ligne</span>
          <span className="xp-date">{dateStr}</span>
        </div>
        <div className="xp-horloge" aria-label="Heure">{heure}</div>
        <nav className="xp-commandes" aria-label="Commandes">
          <button type="button" className={`xp-puce${modeVocal ? ' est-actif' : ''}`} aria-pressed={modeVocal} onClick={() => setModeVocal((p) => !p)}>
            <Volume2 size={14} aria-hidden="true" /><span>Voix</span>
          </button>
          <button type="button" className={`xp-puce${modeParler ? ' est-actif' : ''}${ecoute ? ' est-ecoute' : ''}`} aria-pressed={modeParler} onClick={toggleParler}>
            <Mic size={14} aria-hidden="true" /><span>{ecoute ? 'Écoute' : 'Micro'}</span>
          </button>
          <button type="button" className={`xp-puce${modeChat ? ' est-actif' : ''}`} aria-pressed={modeChat} onClick={() => setModeChat((p) => !p)}>
            <MessageSquare size={14} aria-hidden="true" /><span>Texte</span>
          </button>
          <button type="button" className="xp-puce xp-puce--plein" onClick={() => setModePortfolio(true)}>
            <Layout size={14} aria-hidden="true" /><span>Portfolio</span>
          </button>
          <button type="button" className="xp-puce xp-puce--icone" onClick={() => naviguer('/')} aria-label="Recommencer" title="Recommencer">
            <RotateCcw size={14} aria-hidden="true" />
          </button>
        </nav>
        <button type="button" className="xp-menu" onClick={() => setDrawerSys((v) => !v)} aria-expanded={drawerSys} aria-label={drawerSys ? 'Fermer le panneau' : 'Ouvrir le panneau'}>
          {drawerSys ? <X size={18} aria-hidden="true" /> : <SlidersHorizontal size={18} aria-hidden="true" />}
        </button>
      </header>

      <aside className="xp-panneau xp-panneau--gauche" data-xp-panneau>
        {blocSession}
        {blocRaccourcis}
      </aside>

      <main className={`xp-scene${reponseVisible ? ' a-reponse' : ''}`}>
        <span className="xp-scene__fond" aria-hidden="true">AXIS</span>
        <div className="xp-avatar" data-xp-avatar style={{ '--t': `${avatarTaille}px` }} onClick={toucherAvatar}>
          <span className={`xp-avatar__anneau est-${aiState}`} aria-hidden="true" />
          <AvatarStable etat={aiState} width={avatarTaille} height={avatarTaille} />
        </div>
        <div className={`xp-etat est-${aiState}`} role="status"><i aria-hidden="true" />{libelleEtat}</div>
        <p className="xp-identite">Fréjus Kouadio · Développeur fullstack &amp; IA</p>
        {reponseVisible && (
          <div className="xp-bulle" aria-live="polite">
            <span className="pf-label"><b>AXIS</b> Réponse</span>
            {dernierMessage.split(/\n+/).filter(Boolean).map((ligne, i) => <p key={i}>{ligne}</p>)}
          </div>
        )}
      </main>

      <aside className="xp-panneau xp-panneau--droite" data-xp-panneau>
        {blocModes}
        {blocSysteme}
      </aside>

      <footer className="xp-saisie" data-xp-saisie>
        {!modeParler ? (
          <form className="xp-champ" onSubmit={(e) => { e.preventDefault(); soumettre() }}>
            <label htmlFor="xp-commande" className="xp-visuel-cache">Commande pour AXIS</label>
            <input
              id="xp-commande"
              ref={inputRef}
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              placeholder="Entrez votre commande..."
              autoComplete="off"
            />
            <button type="button" className="xp-champ__micro" onClick={toggleParler} aria-label="Parler à AXIS">
              <Mic size={18} aria-hidden="true" />
            </button>
            <button type="submit" className="xp-champ__envoi" aria-label="Envoyer" disabled={!inputCmd.trim()}>
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        ) : (
          <div className={`xp-ecoute${ecoute ? ' est-ecoute' : ''}`}>
            <span className="xp-ecoute__barres" aria-hidden="true"><i /><i /><i /><i /><i /></span>
            <span>{ecoute ? 'Écoute en cours — parlez' : 'Micro prêt — en attente'}</span>
            <button type="button" onClick={toggleParler}>Écrire plutôt</button>
          </div>
        )}
        <span className="xp-saisie__aide">{estEnChargement ? 'AXIS réfléchit…' : 'Entrée pour envoyer · ou essayez « montre-moi ses projets »'}</span>
      </footer>

      {(cartesActives.length > 0 || photoFrejusVisible) && (
        <div className="xp-volants">
          {photoFrejusVisible && (
            <figure className="xp-photo">
              <img src="/captures/frejus3.jpg" alt="Fréjus Kouadio" />
              <figcaption>
                <strong>Fréjus Kouadio</strong>
                <span>Développeur fullstack · IA</span>
                <ul>
                  <li><MapPin size={12} aria-hidden="true" />Yamoussoukro</li>
                  <li><Briefcase size={12} aria-hidden="true" />Freelance</li>
                  <li><Zap size={12} aria-hidden="true" />IA · React</li>
                </ul>
              </figcaption>
            </figure>
          )}
          {cartesActives.length > 0 && (
            <button type="button" className="xp-carte" onClick={ouvrirCarte}>
              <span className="xp-carte__tete"><span>{cartesActives[0].label}</span><i aria-hidden="true">↗</i></span>
              <span className="xp-carte__image">
                <img src={cartesActives[0].image} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </span>
              <span className="xp-carte__pied">
                <strong>{cartesActives[0].titre}</strong>
                <span>{cartesActives[0].stats.join(' · ')}</span>
              </span>
            </button>
          )}
        </div>
      )}

      {drawerSys && (
        <>
          <div className="xp-voile" onClick={() => setDrawerSys(false)} aria-hidden="true" />
          <div className="xp-feuille" role="dialog" aria-modal="true" aria-label="Panneau AXIS">
            <span className="xp-feuille__poignee" aria-hidden="true" />
            {blocModes}
            {blocSession}
            {blocRaccourcis}
            {blocSysteme}
            <PanneauParametres variante="integre" />
          </div>
        </>
      )}

      {portfolioVisible && (
        <div className={`pf-overlay${modePortfolio ? '' : ' est-sortie'}`} style={{ position: 'fixed', inset: 0, zIndex: 50, overflow: 'hidden' }}>
          <Portfolio ref={portfolioRef} onClose={fermerPortfolio} />

          <div className="xp-pf-avatar">
            <button type="button" onClick={fermerPortfolio} title="Fermer le portfolio" aria-label="Fermer le portfolio et revenir à AXIS">
              <span className={`xp-avatar__anneau est-${aiState}`} aria-hidden="true" />
              <AvatarStable etat={aiState} width={isMobile ? 64 : 104} height={isMobile ? 64 : 104} />
            </button>
            <span className={`xp-etat est-${aiState}`}><i aria-hidden="true" />{libelleEtat}</span>
          </div>

          <div className="xp-pf-ecrire">
            {inputPortfolioVisible && (
              <form className="xp-champ" onSubmit={(e) => { e.preventDefault(); soumettre(); setInputPortfolioVisible(false) }}>
                <input value={inputCmd} onChange={(e) => setInputCmd(e.target.value)} placeholder="Message à AXIS..." aria-label="Message pour AXIS" autoFocus />
                <button type="submit" className="xp-champ__envoi" aria-label="Envoyer" disabled={!inputCmd.trim()}><Send size={16} aria-hidden="true" /></button>
              </form>
            )}
            <button
              type="button"
              className={`xp-pf-ecrire__bouton${inputPortfolioVisible ? ' est-actif' : ''}`}
              onClick={() => setInputPortfolioVisible((p) => !p)}
              title={inputPortfolioVisible ? 'Fermer' : 'Écrire à AXIS'}
              aria-label={inputPortfolioVisible ? 'Fermer la saisie' : 'Écrire à AXIS'}
            >
              {inputPortfolioVisible ? <X size={16} aria-hidden="true" /> : <PenLine size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>
      )}

      {!portfolioVisible && !isMobile && <PanneauParametres />}
    </div>
  )
}
