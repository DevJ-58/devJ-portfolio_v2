import { useRef } from 'react'
import { useAnimations } from '../moteur/animer'
import { gsap, EASE } from '../moteur/gsap'
import { parcoursData } from '../donnees'

// Entrée : la section s'ouvre en cercle depuis le centre.
// Bureau : piste horizontale épinglée ; la vague se dessine avec la
// progression, chaque chiffre romain glisse en relief dans son panneau.
// Mobile : chapitres empilés le long d'un fil qui se trace.
export default function Parcours() {
  const ref = useRef(null)
  const progresRef = useRef(null)
  const chapitreRef = useRef(null)

  useAnimations(ref, ({ bureau, mobile }) => {
    const q = gsap.utils.selector(ref)
    gsap.fromTo(ref.current,
      { clipPath: 'circle(8% at 50% 60%)' },
      { clipPath: 'circle(150% at 50% 60%)', ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top top', scrub: true } })

    if (bureau) {
      const piste = q('[data-piste]')[0]
      const vague = q('[data-vague]')[0]
      const longueur = vague.getTotalLength()
      gsap.set(vague, { strokeDasharray: longueur, strokeDashoffset: longueur })
      const distance = () => piste.scrollWidth - ref.current.clientWidth

      const horiz = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: ref.current, start: 'top top', end: () => `+=${distance()}`,
          scrub: 1, pin: true, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => {
            if (progresRef.current) progresRef.current.style.transform = `scaleX(${self.progress})`
            const n = Math.min(parcoursData.length, Math.floor(self.progress * (parcoursData.length + 0.999)))
            if (chapitreRef.current) chapitreRef.current.textContent = n ? ['I', 'II', 'III'][n - 1] : '—'
          },
        },
      })
      horiz.to(piste, { x: () => -distance() }, 0).to(vague, { strokeDashoffset: 0 }, 0)

      q('[data-chapitre]').forEach((panneau) => {
        const chiffre = panneau.querySelector('[data-chiffre]')
        gsap.fromTo(chiffre, { xPercent: 35 }, {
          xPercent: -35, ease: 'none',
          scrollTrigger: { trigger: panneau, containerAnimation: horiz, start: 'left right', end: 'right left', scrub: true },
        })
        gsap.from(panneau.querySelectorAll('[data-revele]'), {
          yPercent: 60, autoAlpha: 0, stagger: 0.08, duration: 1, ease: EASE.sortie,
          scrollTrigger: { trigger: panneau, containerAnimation: horiz, start: 'left 70%', toggleActions: 'play none none reverse' },
        })
      })
    }

    if (mobile) {
      gsap.fromTo(q('[data-fil]'), { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: q('[data-liste]')[0], start: 'top 75%', end: 'bottom 60%', scrub: true } })
      q('[data-item]').forEach((it) => gsap.from(it, { x: 40, autoAlpha: 0, duration: 1, ease: EASE.sortie, scrollTrigger: { trigger: it, start: 'top 85%', toggleActions: 'play none none reverse' } }))
    }
  })

  return (
    <section id="pf-academic" className="pf-parcours" ref={ref}>
      {/* Bureau : piste horizontale */}
      <div className="pf-parcours__piste" data-piste>
        <svg className="pf-parcours__vague" viewBox="0 0 3000 400" preserveAspectRatio="none" aria-hidden="true">
          <path data-vague d="M -20 260 C 300 110, 520 380, 820 230 S 1360 60, 1660 220 S 2200 380, 2500 200 S 2860 120, 3020 210" />
        </svg>

        <div className="pf-parcours__intro">
          <span className="pf-label" data-a="fondu"><b>02</b> Parcours</span>
          <h2 className="pf-titre-mega" data-a="chars">Trois <em className="pf-it">chapitres</em></h2>
          <p className="pf-corps" data-a="fondu" data-delai="0.2">De Yamoussoukro au génie logiciel : un parcours qui se lit comme un récit, chapitre après chapitre.</p>
          <span className="pf-parcours__indice" data-a="fondu" data-delai="0.3">Défilez <i aria-hidden="true">→</i></span>
        </div>

        {parcoursData.map((e) => (
          <article key={e.chap} className={`pf-parcours__chapitre${e.active ? ' est-actif' : ''}`} data-chapitre>
            <span className="pf-parcours__chiffre" data-chiffre aria-hidden="true">{e.chap}</span>
            <div className="pf-parcours__carte">
              <span className="pf-label" data-revele>Ch. {e.chap} · {e.periode}</span>
              <h3 data-revele>{e.titre}</h3>
              <p data-revele>{e.detail}</p>
              {e.active && <span className="pf-pastille" data-revele><i />En cours</span>}
            </div>
          </article>
        ))}
      </div>

      <div className="pf-parcours__hud" aria-hidden="true">
        <span>Chapitre <b ref={chapitreRef}>—</b> / III</span>
        <span className="pf-parcours__barre"><i ref={progresRef} /></span>
      </div>

      {/* Mobile : liste verticale */}
      <div className="pf-parcours__mobile">
        <span className="pf-label" data-a="fondu"><b>02</b> Parcours</span>
        <h2 className="pf-titre-mega" data-a="chars">Trois <em className="pf-it">chapitres</em></h2>
        <ol className="pf-parcours__liste" data-liste>
          <span className="pf-parcours__fil" data-fil aria-hidden="true" />
          {parcoursData.map((e) => (
            <li key={e.chap} data-item className={e.active ? 'est-actif' : ''}>
              <span className="pf-parcours__puce" aria-hidden="true">{e.chap}</span>
              <span className="pf-label">{e.periode}</span>
              <h3>{e.titre}</h3>
              <p>{e.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
