import { useRef } from 'react'
import { useAnimations, animerBandeau } from '../moteur/animer'
import { gsap, EASE } from '../moteur/gsap'

// Entrée : rideau d'accent qui remonte et libère la section.
// Deux bandeaux géants de technologies défilent en sens opposés (vitesse
// liée au scroll). Puis le « signal » : par catégorie, des barres qui
// montent à leur niveau, un nœud, les noms et pourcentages comptés.
export default function Competences({ competences }) {
  const ref = useRef(null)
  const noms = competences.flatMap((c) => c.items.map(([n]) => n))

  useAnimations(ref, ({ bureau }) => {
    const q = gsap.utils.selector(ref)
    gsap.fromTo(q('[data-rideau]'), { yPercent: 0 }, {
      yPercent: -101, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top 25%', scrub: true },
    })
    const b1 = animerBandeau(q('[data-bandeau-1]')[0], { vitesse: 38, sens: 1, declencheurEl: ref.current })
    const b2 = animerBandeau(q('[data-bandeau-2]')[0], { vitesse: 44, sens: -1, declencheurEl: ref.current })

    q('[data-cat]').forEach((cat, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: cat, start: 'top 82%', toggleActions: 'play none none reverse' }, delay: bureau ? i * 0.08 : 0 })
      tl.fromTo(cat.querySelectorAll('[data-barre]'), { scaleY: 0, scaleX: 0 }, { scaleY: 1, scaleX: 1, duration: 1.4, ease: EASE.sortie, stagger: 0.06 })
        .fromTo(cat.querySelector('[data-noeud]'), { scale: 0 }, { scale: 1, duration: 0.9, ease: EASE.ressort }, 0.2)
        .from(cat.querySelectorAll('[data-nom]'), { y: 24, autoAlpha: 0, duration: 0.8, ease: EASE.sortie, stagger: 0.04 }, 0.3)
      cat.querySelectorAll('[data-pct]').forEach((el) => {
        const fin = Number(el.dataset.valeur); const o = { v: 0 }
        tl.to(o, { v: fin, duration: 1.4, ease: 'power2.out', onUpdate: () => { el.textContent = `${Math.round(o.v)}%` } }, 0.3)
      })
    })

    if (bureau) {
      gsap.to(q('[data-cristal]'), { rotate: 28, yPercent: -30, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      // Sortie : le signal se comprime en quittant l'écran
      gsap.to(q('[data-signal]'), { scaleY: 0.86, autoAlpha: 0.25, transformOrigin: 'bottom center', ease: 'none', scrollTrigger: { trigger: q('[data-signal]')[0], start: 'bottom 55%', end: 'bottom top', scrub: true } })
    }
    return () => { b1?.kill(); b2?.kill() }
  }, [competences])

  const bandeau = (variante) => (
    <>
      {[0, 1].map((k) => (
        <span key={k} className="pf-bandeau__groupe">
          {noms.map((n, i) => (
            <span key={`${k}-${i}`} className={variante === 2 && i % 2 ? 'est-plein' : variante === 1 && i % 2 === 0 ? 'est-plein' : ''}>
              {n}<i aria-hidden="true">✦</i>
            </span>
          ))}
        </span>
      ))}
    </>
  )

  return (
    <section id="pf-skills" className="pf-section pf-competences" ref={ref}>
      <span className="pf-rideau" data-rideau aria-hidden="true" />

      <svg className="pf-competences__cristal" data-cristal viewBox="0 0 400 400" aria-hidden="true">
        <polygon points="60,150 200,70 200,110 100,168 100,210 60,187" className="f1" />
        <polygon points="200,70 260,105 260,145 200,110" className="f2" />
        <polygon points="60,187 100,210 260,300 260,340 100,250 60,227" className="f3" />
        <polygon points="200,110 260,145 260,220 220,242 220,200 200,190" className="f1" />
        <polygon points="260,145 320,180 320,255 260,220" className="f2" />
        <polygon points="220,242 260,265 260,300 220,278" className="f4" />
      </svg>

      <header className="pf-entete">
        <span className="pf-label" data-a="fondu"><b>03</b> Compétences</span>
        <span className="pf-entete__note" data-a="fondu" data-delai="0.1">{noms.length} technologies</span>
      </header>
      <h2 className="pf-titre-mega" data-a="chars">Signal <em className="pf-it">technique</em></h2>

      <div className="pf-competences__bandeaux" aria-hidden="true">
        <div className="pf-bandeau pf-bandeau--1"><div className="pf-bandeau__piste" data-bandeau-1>{bandeau(1)}</div></div>
        <div className="pf-bandeau pf-bandeau--2"><div className="pf-bandeau__piste" data-bandeau-2>{bandeau(2)}</div></div>
      </div>

      <div className="pf-signal" data-signal>
        {competences.map((g) => (
          <div key={g.cat} className="pf-signal__cat" data-cat tabIndex={0}>
            <div className="pf-signal__barres" aria-hidden="true">
              {g.items.map(([n, pct]) => (
                <span key={n} data-barre style={{ '--niveau': pct / 100 }} />
              ))}
            </div>
            <div className="pf-signal__noeud" data-noeud>
              <span>{g.cat}</span>
              <small>{g.items.length}</small>
            </div>
            <ul className="pf-signal__noms">
              {g.items.map(([n, pct]) => (
                <li key={n} data-nom>
                  <span>{n}</span>
                  <em data-pct data-valeur={pct}>{pct}%</em>
                  <i className="pf-signal__jauge" aria-hidden="true"><b data-barre style={{ '--niveau': pct / 100 }} /></i>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
