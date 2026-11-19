import { useRef } from 'react'
import { useAnimations } from '../moteur/animer'
import { gsap, ScrollTrigger, SplitText } from '../moteur/gsap'

const FAITS = [
  ['Yamoussoukro, CI', 'Localisation'],
  ['2ème / 3', 'Cursus'],
  ['Ouvert', 'Disponibilité'],
]

// Entrée : la section glisse par-dessus le portrait, coins arrondis qui
// s'aplatissent. Manifeste : chaque mot s'éclaire au rythme du scroll
// (épinglé sur bureau).
export default function APropos() {
  const ref = useRef(null)

  useAnimations(ref, ({ bureau }) => {
    const q = gsap.utils.selector(ref)
    gsap.fromTo(ref.current,
      { borderTopLeftRadius: 48, borderTopRightRadius: 48 },
      { borderTopLeftRadius: 0, borderTopRightRadius: 0, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top top', scrub: true } })

    const manifeste = q('[data-manifeste]')[0]
    const scene = q('[data-scene]')[0]
    // L'épinglage est créé une seule fois ; le texte, lui, peut être
    // redécoupé (polices, redimensionnement) sans toucher à l'épinglage.
    if (bureau) ScrollTrigger.create({ trigger: scene, start: 'top 12%', end: '+=130%', pin: true })
    SplitText.create(manifeste, {
      type: 'words', autoSplit: true, aria: 'auto',
      onSplit: (self) => gsap.fromTo(self.words, { opacity: 0.12 }, {
        opacity: 1, ease: 'none', stagger: 0.12,
        scrollTrigger: bureau
          ? { trigger: scene, start: 'top 12%', end: '+=130%', scrub: true }
          : { trigger: manifeste, start: 'top 80%', end: 'bottom 35%', scrub: true },
      }),
    })
  })

  return (
    <section id="pf-about" className="pf-section pf-apropos" ref={ref}>
      <header className="pf-entete">
        <span className="pf-label" data-a="fondu"><b>01</b> À propos</span>
        <span className="pf-entete__note" data-a="fondu" data-delai="0.1">Manifeste — P.01</span>
      </header>

      <div className="pf-apropos__scene" data-scene>
        <p className="pf-manifeste" data-manifeste>
          Concevoir des interfaces qui se ressentent <em className="pf-it">avant</em> de se comprendre.
        </p>
      </div>

      <div className="pf-apropos__grille">
        <figure className="pf-apropos__photo" data-a="image">
          <img src="/asset/2026010323253284.png" alt="Fréjus Kouadio au travail" loading="lazy" />
          <figcaption>Fréjus Kouadio — Yamoussoukro</figcaption>
        </figure>

        <div className="pf-apropos__texte">
          <p className="pf-corps pf-corps--grand" data-a="lignes">
            Fréjus Kouadio — développeur logiciel et UI/UX designer basé à Yamoussoukro. En 2ème année de Licence Génie Logiciel, spécialisation progressive vers l'intelligence artificielle.
          </p>
          <dl className="pf-faits" data-a="cascade">
            {FAITS.map(([v, l]) => (
              <div key={l}><dt>{l}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <span className="pf-trait" data-a="trait" aria-hidden="true" />
          <div className="pf-actions" data-a="fondu">
            <a className="pf-btn" href="/asset/cv_frejus.pdf" download="cv_frejus.pdf" data-magnetique><span>Télécharger le CV</span></a>
            <a className="pf-lien" href="mailto:devfred58@gmail.com">devfred58@gmail.com</a>
          </div>
        </div>
      </div>
    </section>
  )
}
