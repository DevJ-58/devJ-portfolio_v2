import { useRef } from 'react'
import utiliserTheme from '@/store/utiliserTheme'
import devjlogImg from '@/assets/devjlog.png'
import { gsap, SplitText, useGSAP, EASE, mouvementReduit } from '@/composants/portfolio/moteur/gsap'
import { variablesTheme } from '@/composants/portfolio/moteur/contexte'
import '@/composants/portfolio/portfolio.css'

// Ressources réellement attendues avant d'ouvrir le portfolio
const RESSOURCES = ['/asset/2026010323251463.png', '/asset/2026010323253284.png', devjlogImg]
const DUREE_MIN = 2400 // ms : le temps de lire l'écran, même si tout est en cache
const DUREE_MAX = 6000 // ms : on ouvre quoi qu'il arrive
const CHAPITRES = ['Portrait', 'Parcours', 'Projets', 'Contact']
const ETAPES = ['Initialisation', 'Chargement des images', 'Composition typographique', 'Mise en page', 'Prêt']

// Préchargeur éditorial : « </DevJ> » se remplit au rythme du chargement
// réel (polices + images du portfolio), puis deux volets s'ouvrent sur le
// hero. onSortie : début de l'ouverture (l'intro du hero démarre) ;
// onTermine : préchargeur retiré.
export default function PreloaderEditorial({ onSortie, onTermine }) {
  const { theme, mode, getThemeEffectif } = utiliserTheme()
  const eff = getThemeEffectif ? getThemeEffectif() : theme
  const isLight = mode === 'light'
  const ref = useRef(null)

  useGSAP(() => {
    const q = gsap.utils.selector(ref)
    const reduit = mouvementReduit()
    const compteur = q('[data-compteur]')[0]
    const remplissage = q('[data-remplissage]')[0]
    const etape = q('[data-etape]')[0]
    const chapitres = q('[data-chapitre]')
    const barre = q('[data-barre]')[0]

    // Progression réelle
    let charges = 0
    const total = RESSOURCES.length + 1
    const plus = () => { charges = Math.min(total, charges + 1) }
    RESSOURCES.forEach((src) => { const img = new Image(); img.onload = plus; img.onerror = plus; img.src = src })
    ;(document.fonts?.ready ?? Promise.resolve()).then(plus)

    const split = SplitText.create(q('[data-logo-plein]')[0], { linesClass: 'pf-ligne', wordsClass: 'pf-mot', charsClass: 'pf-car', type: 'chars' })
    const splitVide = SplitText.create(q('[data-logo-vide]')[0], { linesClass: 'pf-ligne', wordsClass: 'pf-mot', charsClass: 'pf-car', type: 'chars' })
    if (!reduit) {
      gsap.timeline({ defaults: { ease: EASE.sortie } })
        .from([splitVide.chars, split.chars], { yPercent: 110, duration: 1.2, stagger: 0.05 })
        .from(q('[data-meta] > *, [data-pied] > *'), { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.06 }, 0.2)
    }

    const debut = performance.now()
    const affiche = { v: 0 }
    let fini = false

    const sortir = () => {
      fini = true
      gsap.ticker.remove(tic)
      onSortie?.()
      if (reduit) { onTermine?.(); return }
      gsap.timeline({ onComplete: () => onTermine?.() })
        .to(split.chars, { yPercent: -110, duration: 0.7, ease: EASE.rideau, stagger: 0.03 })
        .to(splitVide.chars, { yPercent: -110, duration: 0.7, ease: EASE.rideau, stagger: 0.03 }, 0)
        .to(q('[data-meta], [data-pied], [data-sous-titre]'), { autoAlpha: 0, duration: 0.4 }, 0)
        .to(q('[data-volet-haut]'), { yPercent: -100, duration: 1.15, ease: EASE.drame }, 0.35)
        .to(q('[data-volet-bas]'), { yPercent: 100, duration: 1.15, ease: EASE.drame }, 0.35)
    }

    const tic = () => {
      if (fini) return
      const t = performance.now() - debut
      // La progression affichée suit le chargement, jamais plus vite que DUREE_MIN
      let cible = Math.min(charges / total, t / DUREE_MIN)
      if (t > DUREE_MAX) cible = 1
      affiche.v += (cible - affiche.v) * (reduit ? 1 : 0.09)
      const p = Math.min(1, affiche.v)
      const pct = Math.round(p * 100)
      compteur.textContent = String(pct).padStart(3, '0')
      remplissage.style.clipPath = `inset(${100 - p * 100}% 0 0 0)`
      barre.style.transform = `scaleX(${p})`
      etape.textContent = ETAPES[Math.min(ETAPES.length - 1, Math.floor(p * (ETAPES.length - 1)))]
      chapitres.forEach((c, i) => c.classList.toggle('est-allume', p >= (i + 1) / (CHAPITRES.length + 0.5)))
      if (p > 0.995) sortir()
    }
    gsap.ticker.add(tic)
    return () => gsap.ticker.remove(tic)
  }, { scope: ref })

  return (
    <div className={`pf-pre ${isLight ? 'est-clair' : 'est-sombre'}`} ref={ref} style={variablesTheme(eff, isLight)} role="status" aria-label="Chargement du portfolio">
      <div className="pf-pre__volet pf-pre__volet--haut" data-volet-haut />
      <div className="pf-pre__volet pf-pre__volet--bas" data-volet-bas />

      <div className="pf-pre__contenu">
        <div className="pf-pre__meta" data-meta>
          <span><i className="pf-losange" />Vol. I · N°01</span>
          <span>Éd. <b data-compteur>000</b></span>
        </div>

        <div className="pf-pre__centre">
          <div className="pf-pre__logo" aria-hidden="true">
            <span className="pf-pre__logo-vide" data-logo-vide>&lt;/DevJ&gt;</span>
            <span className="pf-pre__logo-plein" data-remplissage>
              <span data-logo-plein>&lt;/DevJ&gt;</span>
            </span>
          </div>
          <p className="pf-pre__sous-titre" data-sous-titre>Développeur logiciel · UI/UX · IA</p>
        </div>

        <div className="pf-pre__pied" data-pied>
          <ul>
            {CHAPITRES.map((c, i) => <li key={c} data-chapitre><em>{String(i + 1).padStart(2, '0')}</em>{c}</li>)}
          </ul>
          <span className="pf-pre__etape" data-etape>{ETAPES[0]}</span>
          <span className="pf-pre__barre"><i data-barre /></span>
        </div>
      </div>
    </div>
  )
}
