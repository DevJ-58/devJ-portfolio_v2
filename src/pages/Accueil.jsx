import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Target, Briefcase, Users, Eye, Mic, PenLine } from 'lucide-react'
import AvatarAxis from '@/composants/ui/AvatarAxis'
import utiliserStore from '@/store/utiliserStore'
import utiliserTheme from '@/store/utiliserTheme'
import { gsap, SplitText, useGSAP, EASE, mouvementReduit } from '@/composants/portfolio/moteur/gsap'
import { variablesTheme } from '@/composants/portfolio/moteur/contexte'
import '@/composants/portfolio/portfolio.css'
import './accueil.css'

// Identifiants alignés sur ceux qu'attend AXIS (serviceIA)
const ROLES = [
  { key: 'recruiter', icon: Target, titre: 'Recruteur', sous: "À la recherche d'un talent" },
  { key: 'client', icon: Briefcase, titre: 'Client', sous: "J'ai un projet en tête" },
  { key: 'collaborateur', icon: Users, titre: 'Collaborateur', sous: 'Travaillons ensemble' },
  { key: 'curieux', icon: Eye, titre: 'Curieux', sous: 'Je découvre simplement' },
]

const ETAPES = [
  { n: '01', label: 'Identité' },
  { n: '02', label: 'Profil' },
  { n: '03', label: 'Micro' },
]

// Accueil : trois étapes de dialogue avec AXIS (prénom, rôle, micro), après
// le choix d'une ambiance lors de la première visite.
export default function Accueil() {
  const [etape, setEtape] = useState(1)
  const [prenom, setPrenom] = useState('')
  const [profil, setProfil] = useState(null)
  const [showThemeModal, setShowThemeModal] = useState(() => !sessionStorage.getItem('devj-theme-session'))
  const store = utiliserStore()
  const { theme, themes, changerTheme, mode, setMode, getThemeEffectif } = utiliserTheme()
  const eff = getThemeEffectif ? getThemeEffectif() : theme
  const isLight = mode === 'light'
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const ref = useRef(null)
  const scrutRef = useRef(null)
  const modalRef = useRef(null)
  const [petit, setPetit] = useState(() => window.innerWidth < 900)

  useEffect(() => {
    const surResize = () => setPetit(window.innerWidth < 900)
    window.addEventListener('resize', surResize)
    return () => window.removeEventListener('resize', surResize)
  }, [])

  useEffect(() => {
    if (etape === 1 && !showThemeModal) inputRef.current?.focus({ preventScroll: true })
  }, [etape, showThemeModal])

  // Entrée de la page
  useGSAP(() => {
    if (mouvementReduit()) return
    const q = gsap.utils.selector(ref)
    gsap.timeline({ defaults: { ease: EASE.sortie } })
      .from(q('[data-tete] > *'), { y: -24, autoAlpha: 0, duration: 0.9, stagger: 0.08 })
      .from(q('[data-avatar]'), { scale: 0.8, autoAlpha: 0, duration: 1.4 }, 0.1)
      .from(q('[data-bulle]'), { y: 20, autoAlpha: 0, duration: 1 }, 0.5)
  }, { scope: ref })

  // Changement d'étape : la question s'écrit, le contenu arrive en cascade
  useGSAP(() => {
    const zone = scrutRef.current
    if (!zone || mouvementReduit()) return
    const titre = zone.querySelector('[data-question]')
    const split = SplitText.create(titre, { type: 'lines,words,chars', mask: 'lines', linesClass: 'pf-ligne', wordsClass: 'pf-mot', charsClass: 'pf-car' })
    gsap.timeline({ defaults: { ease: EASE.sortie } })
      .fromTo(split.chars, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.02 })
      .fromTo(zone.querySelectorAll('[data-entre]'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.08 }, 0.25)
    return () => split.revert()
  }, { dependencies: [etape], scope: scrutRef, revertOnUpdate: true })

  // Fenêtre d'ambiance
  useGSAP(() => {
    if (!showThemeModal || !modalRef.current || mouvementReduit()) return
    const q = gsap.utils.selector(modalRef)
    gsap.timeline({ defaults: { ease: EASE.sortie } })
      .from(q('[data-modal-carte]'), { y: 40, autoAlpha: 0, duration: 1 })
      .from(q('[data-pastille]'), { scale: 0, duration: 0.8, ease: EASE.ressort, stagger: 0.05 }, 0.3)
  }, { dependencies: [showThemeModal], scope: modalRef })

  const quitterEtape = (suite) => {
    const zone = scrutRef.current
    if (!zone || mouvementReduit()) { suite(); return }
    gsap.to(zone.children, { y: -30, autoAlpha: 0, duration: 0.45, ease: EASE.rideau, stagger: 0.04, onComplete: suite })
  }

  function submitIdentite(e) {
    e?.preventDefault()
    if (!prenom.trim()) { inputRef.current?.focus(); return }
    store.definirVisiteur({ prenom: prenom.trim() })
    quitterEtape(() => setEtape(2))
  }

  function choisirProfil(p) {
    setProfil(p)
    setTimeout(() => quitterEtape(() => setEtape(3)), 300)
  }

  function activerMicro() {
    store.definirVisiteur({ prenom: prenom.trim(), profession: profil, microActif: true })
    quitterEtape(() => navigate('/experience'))
  }

  function continuerSansMicro() {
    store.definirVisiteur({ prenom: prenom.trim(), profession: profil })
    quitterEtape(() => navigate('/experience'))
  }

  function fermerModal(themeId) {
    if (themeId) changerTheme(themeId)
    sessionStorage.setItem('devj-theme-session', '1')
    const fermer = () => setShowThemeModal(false)
    if (!modalRef.current || mouvementReduit()) { fermer(); return }
    gsap.to(modalRef.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: EASE.drame, onComplete: fermer })
  }

  const paroles = {
    1: "Bonjour ! Je suis AXIS, l'IA de Fréjus. Je vais t'accompagner pour créer une expérience personnalisée.",
    2: `Enchanté${prenom ? `, ${prenom.trim()}` : ''}. Dis-moi ce qui t'amène, j'adapterai mes réponses.`,
    3: 'Tu peux me parler à voix haute, ou continuer par écrit. Comme tu préfères.',
  }

  return (
    <div className={`ac-page ${isLight ? 'est-clair' : 'est-sombre'}`} ref={ref} style={variablesTheme(eff, isLight)}>
      <header className="ac-tete" data-tete>
        <span className="ac-logo">&lt;<span>/DevJ</span>&gt;</span>
        <ol className="ac-etapes" aria-label="Progression">
          {ETAPES.map((x, i) => (
            <li key={x.n} className={etape === i + 1 ? 'est-actif' : etape > i + 1 ? 'est-fait' : ''} aria-current={etape === i + 1 ? 'step' : undefined}>
              <em>{x.n}</em><span>{x.label}</span><i aria-hidden="true" />
            </li>
          ))}
        </ol>
        <button type="button" className="pf-lien ac-portfolio" onClick={() => navigate('/portfolio')}>Portfolio →</button>
      </header>

      <main className="ac-scene">
        <section className="ac-axis" aria-label="AXIS">
          <div className="ac-axis__avatar" data-avatar>
            <span className="ac-axis__fond" aria-hidden="true">AXIS</span>
            <AvatarAxis width={petit ? 116 : 360} height={petit ? 116 : 360} etat="idle" />
          </div>
          <div className="ac-bulle" data-bulle aria-live="polite">
            <span className="pf-label"><b>AXIS</b> En ligne</span>
            <p key={etape}>{paroles[etape]}</p>
          </div>
        </section>

        <section className="ac-dialogue" ref={scrutRef} key={etape}>
          {etape === 1 && (
            <>
              <span className="pf-label" data-entre><b>01</b> Identité</span>
              <h1 className="ac-question" data-question>Bonjour, je suis <em className="pf-it">AXIS</em></h1>
              <p className="ac-texte" data-entre>Je vais t'accompagner pour créer une expérience personnalisée. Commence par me dire comment t'appeler.</p>
              <form className="ac-champ" onSubmit={submitIdentite} data-entre>
                <label htmlFor="ac-prenom">Ton prénom</label>
                <div className="ac-champ__ligne">
                  <input
                    id="ac-prenom"
                    ref={inputRef}
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ton prénom ici…"
                    autoComplete="given-name"
                    maxLength={40}
                  />
                  <button type="submit" className="ac-envoi" aria-label="Continuer" disabled={!prenom.trim()}>
                    <ArrowRight size={22} aria-hidden="true" />
                  </button>
                </div>
              </form>
            </>
          )}

          {etape === 2 && (
            <>
              <span className="pf-label" data-entre><b>02</b> Profil</span>
              <h1 className="ac-question" data-question>Quel est ton <em className="pf-it">rôle</em> ?</h1>
              <p className="ac-texte" data-entre>Choisis la case qui te décrit le mieux.</p>
              <div className="ac-roles" role="radiogroup" aria-label="Ton rôle">
                {ROLES.map((r, i) => {
                  const Icon = r.icon
                  const choisi = profil === r.key
                  return (
                    <button key={r.key} type="button" role="radio" aria-checked={choisi} className={`ac-role${choisi ? ' est-choisi' : ''}`} onClick={() => choisirProfil(r.key)} data-entre>
                      <span className="ac-role__num">{String(i + 1).padStart(2, '0')}</span>
                      <Icon size={22} aria-hidden="true" className="ac-role__icone" />
                      <span className="ac-role__titre">{r.titre}</span>
                      <span className="ac-role__sous">{r.sous}</span>
                      <ArrowRight size={18} aria-hidden="true" className="ac-role__fleche" />
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {etape === 3 && (
            <>
              <span className="pf-label" data-entre><b>03</b> Micro</span>
              <h1 className="ac-question" data-question>Active ton <em className="pf-it">micro</em></h1>
              <p className="ac-texte" data-entre>Tu peux activer le micro pour parler à AXIS, ou continuer par écrit.</p>
              <div className="ac-micro" data-entre>
                <button type="button" className="ac-micro__bouton" onClick={activerMicro} aria-label="Activer le microphone">
                  <span className="ac-micro__onde" aria-hidden="true" />
                  <span className="ac-micro__onde" aria-hidden="true" />
                  <Mic size={34} aria-hidden="true" />
                </button>
                <div className="ac-micro__actions">
                  <button type="button" className="pf-btn pf-btn--a" onClick={activerMicro}><span>Activer le microphone</span></button>
                  <button type="button" className="ac-sans-micro" onClick={continuerSansMicro}>
                    <PenLine size={14} aria-hidden="true" /> Continuer sans micro
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {showThemeModal && (
        <div className="ac-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="ac-modal-titre">
          <div className="ac-modal__carte" data-modal-carte>
            <span className="pf-label"><b>00</b> Bienvenue sur DevJ</span>
            <h2 id="ac-modal-titre" className="ac-modal__titre">Choisis ton <em className="pf-it">ambiance</em></h2>
            <p className="ac-texte">Personnalise ton expérience avant d'explorer. Tu pourras la changer à tout moment dans les paramètres.</p>

            <div className="ac-modal__mode" role="radiogroup" aria-label="Mode d'affichage">
              <button type="button" role="radio" aria-checked={!isLight} className={!isLight ? 'est-actif' : ''} onClick={() => setMode('dark')}>Sombre</button>
              <button type="button" role="radio" aria-checked={isLight} className={isLight ? 'est-actif' : ''} onClick={() => setMode('light')}>Clair</button>
            </div>

            <div className="ac-modal__couleurs">
              {themes.filter((t) => !(isLight && t.id === 'blanc')).map((t) => (
                <button key={t.id} type="button" className={theme.id === t.id ? 'est-actif' : ''} onClick={() => fermerModal(t.id)} style={{ '--c': isLight ? (t.accentClair || t.accent) : t.accent }}>
                  <i data-pastille aria-hidden="true" />
                  <span>{t.nom || t.label}</span>
                </button>
              ))}
            </div>

            <button type="button" className="ac-modal__passer" onClick={() => fermerModal(null)}>Passer — garder l'ambiance actuelle</button>
          </div>
        </div>
      )}
    </div>
  )
}
