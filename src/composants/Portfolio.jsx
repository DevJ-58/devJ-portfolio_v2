import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserTheme from '@/store/utiliserTheme'
import usePortfolioData from '@/hooks/usePortfolioData'
import { ScrollTrigger } from '@/composants/portfolio/moteur/gsap'
import { ContextePortfolio, variablesTheme } from '@/composants/portfolio/moteur/contexte'
import useDefilement from '@/composants/portfolio/moteur/useDefilement'
import { projetsParDefaut, competencesParDefaut, normaliserProjets, normaliserCompetences } from '@/composants/portfolio/donnees'
import NavPortfolio from '@/composants/portfolio/chrome/NavPortfolio'
import Curseur from '@/composants/portfolio/chrome/Curseur'
import AxisBouton from '@/composants/portfolio/AxisBouton'
import Hero from '@/composants/portfolio/sections/Hero'
import APropos from '@/composants/portfolio/sections/APropos'
import Parcours from '@/composants/portfolio/sections/Parcours'
import Competences from '@/composants/portfolio/sections/Competences'
import Projets from '@/composants/portfolio/sections/Projets'
import GitHub from '@/composants/portfolio/sections/GitHub'
import Services from '@/composants/portfolio/sections/Services'
import Methode from '@/composants/portfolio/sections/Methode'
import Contact from '@/composants/portfolio/sections/Contact'
import '@/composants/portfolio/portfolio.css'

// Portfolio éditorial animé. Utilisé en superposition dans /experience
// (AXIS y navigue via ref.naviguerVers) et en page autonome /portfolio.
// pret : faux tant que le préchargeur couvre la page ; l'intro du hero
// attend ce signal.
const Portfolio = forwardRef(function Portfolio({ accesDirecte = false, pret = true }, ref) {
  const wrapRef = useRef(null)
  const contenuRef = useRef(null)
  const navigate = useNavigate()
  const { theme, mode, getThemeEffectif } = utiliserTheme()
  const eff = getThemeEffectif ? getThemeEffectif() : theme
  const isLight = mode === 'light'
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [scroller, setScroller] = useState(null)

  const [github, setGithub] = useState({ donnees: null, chargement: true, erreur: false })
  const { projets, competences } = usePortfolioData(projetsParDefaut, competencesParDefaut)
  const projetsAffiches = useMemo(() => normaliserProjets(projets), [projets])
  const competencesAffichees = useMemo(() => normaliserCompetences(competences), [competences])

  // Le conteneur de défilement est déclaré avant que les sections ne créent
  // leurs déclencheurs (les effets des enfants s'exécutent avant le parent).
  useLayoutEffect(() => {
    ScrollTrigger.defaults({ scroller: wrapRef.current })
    setScroller(wrapRef.current)
    return () => ScrollTrigger.defaults({ scroller: window })
  }, [])

  const { lenisRef, allerA } = useDefilement(wrapRef, contenuRef)

  const naviguer = useCallback((section) => {
    const el = document.getElementById(`pf-${section}`)
    if (el) allerA(el)
    return !!el
  }, [allerA])

  // Navigation demandée par AXIS juste à l'ouverture : on attend que les
  // polices soient chargées et les positions calculées (sections épinglées),
  // sinon le recalcul ramènerait le défilement en haut.
  const navPrete = useRef(false)
  const navEnAttente = useRef(null)
  useEffect(() => {
    if (!scroller) return
    let annule = false
    const liberer = () => {
      if (annule) return
      ScrollTrigger.refresh()
      navPrete.current = true
      const s = navEnAttente.current
      navEnAttente.current = null
      if (s) requestAnimationFrame(() => naviguer(s))
    }
    const t = setTimeout(() => (document.fonts?.ready ?? Promise.resolve()).then(() => setTimeout(liberer, 250)), 350)
    return () => { annule = true; clearTimeout(t) }
  }, [scroller, naviguer])

  useImperativeHandle(ref, () => ({
    naviguerVers(section) {
      if (!navPrete.current) { navEnAttente.current = section; return }
      if (naviguer(section)) return
      // Section pas encore rendue : nouvel essai pendant 3 s
      let essais = 0
      const t = setInterval(() => { essais++; if (naviguer(section) || essais > 30) clearInterval(t) }, 100)
    },
  }), [naviguer])

  useEffect(() => {
    const surResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', surResize)
    return () => window.removeEventListener('resize', surResize)
  }, [])

  useEffect(() => {
    let actif = true
    fetch('https://github-contributions-api.jogruber.de/v4/DevJ-58?y=last')
      .then((r) => { if (!r.ok) throw new Error('github'); return r.json() })
      .then((d) => { if (actif) setGithub({ donnees: d, chargement: false, erreur: false }) })
      .catch(() => { if (actif) setGithub({ donnees: null, chargement: false, erreur: true }) })
    return () => { actif = false }
  }, [])

  // Le contenu change de hauteur quand les données arrivent
  useEffect(() => {
    if (!scroller) return
    const t = setTimeout(() => ScrollTrigger.refresh(), 150)
    return () => clearTimeout(t)
  }, [scroller, projetsAffiches.length, competencesAffichees.length, github.donnees])

  const contexte = useMemo(() => ({ wrapRef, contenuRef, lenisRef, allerA, naviguer, isMobile, accesDirecte }), [lenisRef, allerA, naviguer, isMobile, accesDirecte])

  return (
    <div
      id="pf-wrap"
      ref={wrapRef}
      className={`pf-wrap ${isLight ? 'est-clair' : 'est-sombre'}`}
      style={variablesTheme(eff, isLight)}
    >
      <ContextePortfolio.Provider value={contexte}>
        <div className="pf-contenu" ref={contenuRef}>
          {scroller && (
            <>
              <NavPortfolio />
              <Hero pret={pret} />
              <APropos />
              <Parcours />
              <Competences competences={competencesAffichees} />
              <Projets projets={projetsAffiches} />
              <GitHub {...github} />
              <Services />
              <Methode />
              <Contact>
                {/* Bouton AXIS flottant, sur bureau comme sur téléphone */}
                {accesDirecte && <AxisBouton isMobile={isMobile} navigate={navigate} />}
              </Contact>
            </>
          )}
        </div>
        {scroller && <Curseur />}
        <div className="pf-grain" aria-hidden="true" />
      </ContextePortfolio.Provider>
    </div>
  )
})

export default Portfolio
