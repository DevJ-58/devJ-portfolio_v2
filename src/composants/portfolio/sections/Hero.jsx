import { useRef } from 'react'
import { usePortfolio } from '../moteur/contexte'
import { useAnimations, animerBandeau } from '../moteur/animer'
import { gsap, SplitText, EASE } from '../moteur/gsap'

const SOMMAIRE = [
  { num: '01', label: 'Portrait', cible: 'about' },
  { num: '02', label: 'Parcours', cible: 'academic' },
  { num: '03', label: 'Projets', cible: 'projects' },
  { num: '04', label: 'Contact', cible: 'contact' },
]

const chiffres = (nbProjets) => [
  { valeur: nbProjets, suffixe: '', label: 'Projets réalisés' },
  { valeur: 2, suffixe: '+', label: "Années d'expérience" },
  { valeur: 100, suffixe: '%', label: 'Satisfaction client' },
]

// Ouverture : le nom monte lettre par lettre, le portrait se dévoile, puis
// le reste arrive en cascade. Au défilement (bureau), la scène reste en
// place pendant que « À propos » glisse par-dessus : le nom s'écarte et le
// portrait recule.
export default function Hero({ pret, nbProjets = 6 }) {
  const CHIFFRES = chiffres(nbProjets)
  const { naviguer } = usePortfolio()
  const ref = useRef(null)

  useAnimations(ref, ({ bureau }) => {
    const q = gsap.utils.selector(ref)
    const l1 = SplitText.create(q('[data-l1]'), { linesClass: 'pf-ligne', wordsClass: 'pf-mot', charsClass: 'pf-car', type: 'lines,chars', mask: 'lines' })
    const l2 = SplitText.create(q('[data-l2]'), { linesClass: 'pf-ligne', wordsClass: 'pf-mot', charsClass: 'pf-car', type: 'lines,chars', mask: 'lines' })
    const bandeau = animerBandeau(q('[data-bandeau]')[0], { vitesse: 55, declencheurEl: ref.current })

    // Intro (jouée quand le préchargeur a fini)
    const intro = gsap.timeline({ paused: true, defaults: { ease: EASE.sortie } })
    intro
      .from(q('[data-meta] > *'), { y: -24, autoAlpha: 0, duration: 0.9, stagger: 0.08 })
      .from(l1.chars, { yPercent: 110, duration: 1.5, stagger: 0.045 }, 0.1)
      .from(l2.chars, { yPercent: -110, duration: 1.5, stagger: 0.04 }, 0.3)
      .fromTo(q('[data-portrait]'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: EASE.rideau }, 0.2)
      .from(q('[data-portrait] img'), { scale: 1.4, duration: 2.2 }, 0.2)
      .from(q('[data-bandeau-wrap]'), { autoAlpha: 0, duration: 1.6 }, 0.6)
      .from(q('[data-bas] > *'), { y: 40, autoAlpha: 0, duration: 1.1, stagger: 0.1 }, 0.9)
      .from(q('[data-sommaire] > *'), { x: -24, autoAlpha: 0, duration: 0.9, stagger: 0.06 }, 1)
      .from(q('[data-defiler]'), { autoAlpha: 0, y: 20, duration: 0.8 }, 1.4)
    q('[data-compteur]').forEach((el, i) => {
      const fin = Number(el.dataset.valeur); const suf = el.dataset.suffixe || ''
      const o = { v: 0 }
      intro.to(o, { v: fin, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) + suf } }, 1.1 + i * 0.12)
    })
    if (pret) intro.play()
    else gsap.set(ref.current, { autoAlpha: 0 })

    // Indicateur « défiler » : trait qui coule en boucle
    gsap.fromTo(q('[data-defiler] i'), { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, duration: 1.2, ease: EASE.drame, repeat: -1, yoyo: true })

    if (bureau) {
      // Sortie : la scène reste épinglée, « À propos » la recouvre
      gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top top', end: '+=100%', scrub: true, pin: true, pinSpacing: false },
        defaults: { ease: 'none' },
      })
        .to(q('[data-l1]'), { xPercent: -22 }, 0)
        .to(q('[data-l2]'), { xPercent: 18 }, 0)
        .fromTo(q('[data-portrait]'), { scale: 1, yPercent: 0, filter: 'brightness(1)' }, { scale: 0.84, yPercent: 6, filter: 'brightness(0.55)' }, 0)
        .to(q('[data-bas], [data-sommaire], [data-meta]'), { autoAlpha: 0, y: -40 }, 0)
        .to(q('[data-scene]'), { scale: 0.94 }, 0)
    } else {
      gsap.to(q('[data-portrait] img'), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } })
    }
    return () => { bandeau?.kill() }
  }, [pret])

  return (
    <section id="pf-hero" className="pf-hero" ref={ref}>
      <div className="pf-hero__scene" data-scene>
        <div className="pf-hero__bandeau" data-bandeau-wrap aria-hidden="true">
          <div className="pf-bandeau__piste" data-bandeau>
            {Array.from({ length: 4 }).map((_, i) => <span key={i}>&lt;/DevJ&gt;</span>)}
          </div>
        </div>

        <div className="pf-hero__meta" data-meta>
          <span className="pf-hero__meta-gauche"><i className="pf-losange" />Vol. I · N°01</span>
          <span className="pf-hero__meta-centre">Côte d'Ivoire · {new Date().getFullYear()}</span>
        </div>

        <nav className="pf-hero__sommaire" data-sommaire aria-label="Sommaire">
          <span className="pf-label">Sommaire</span>
          {SOMMAIRE.map(({ num, label, cible }) => (
            <button key={num} type="button" onClick={() => naviguer(cible)}>
              <em>{num}</em>{label}
            </button>
          ))}
        </nav>

        <figure className="pf-hero__portrait" data-portrait>
          <img src="/asset/2026010323251463.png" alt="Portrait de Fréjus Kouadio" fetchPriority="high" />
        </figure>

        <h1 className="pf-hero__nom">
          <span className="pf-hero__l1" data-l1>Fréjus</span>
          <span className="pf-hero__l2" data-l2>Kouadio</span>
        </h1>

        <div className="pf-hero__bas" data-bas>
          <p className="pf-hero__citation">
            “Développeur logiciel &amp; UI/UX designer — je transforme des idées complexes en interfaces fluides et mémorables.”
          </p>
          <ul className="pf-hero__tags" aria-label="Technologies principales">
            {['React', 'JavaScript', 'PHP', 'Laravel', 'Figma'].map((t) => <li key={t}>{t}</li>)}
          </ul>
          <div className="pf-hero__actions">
            <a className="pf-btn" href="mailto:devfred58@gmail.com" data-magnetique><span>Me contacter</span></a>
            <a className="pf-lien" href="https://wa.me/2250767998373" target="_blank" rel="noopener noreferrer">WhatsApp →</a>
          </div>
          <dl className="pf-hero__chiffres">
            {CHIFFRES.map(({ valeur, suffixe, label }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd data-compteur data-valeur={valeur} data-suffixe={suffixe}>{valeur}{suffixe}</dd>
              </div>
            ))}
          </dl>
        </div>

        <button type="button" className="pf-hero__defiler" data-defiler onClick={() => naviguer('about')}>
          Défiler <i aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
