import { useEffect, useRef, useState } from 'react'
import { usePortfolio } from '../moteur/contexte'
import { useAnimations } from '../moteur/animer'
import { gsap, SplitText, EASE, mouvementReduit } from '../moteur/gsap'
import { etapes } from '../donnees'

// Bureau : section épinglée, le défilement fait avancer les 5 étapes (rail
// de progression) ; un clic sur une étape y amène le défilement.
// Mobile : onglets, flèches et balayage au doigt.
export default function Methode() {
  const { allerA } = usePortfolio()
  const ref = useRef(null)
  const panneauRef = useRef(null)
  const railRef = useRef(null)
  const stRef = useRef(null)
  const etapeRef = useRef(0)
  const [etape, setEtape] = useState(0)
  const n = etapes.length

  useAnimations(ref, ({ bureau }) => {
    const q = gsap.utils.selector(ref)
    if (!bureau) return
    const st = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current, start: 'top top', end: () => `+=${n * 70}%`, pin: true, scrub: true, anticipatePin: 1,
        onUpdate: (self) => {
          if (railRef.current) railRef.current.style.transform = `scaleY(${self.progress})`
          const i = Math.min(n - 1, Math.floor(self.progress * n))
          if (i !== etapeRef.current) { etapeRef.current = i; setEtape(i) }
        },
      },
    }).to(q('[data-chiffre-fond]'), { yPercent: -18, ease: 'none' })
    stRef.current = st.scrollTrigger
    return () => { stRef.current = null }
  })

  // Nouvelle étape : le titre se réécrit, le reste arrive en cascade
  const premier = useRef(true)
  useEffect(() => {
    if (premier.current) { premier.current = false; return }
    const p = panneauRef.current
    if (!p || mouvementReduit()) return
    const split = SplitText.create(p.querySelector('[data-titre]'), { linesClass: 'pf-ligne', wordsClass: 'pf-mot', charsClass: 'pf-car', type: 'lines,words,chars', mask: 'lines' })
    const tl = gsap.timeline()
    tl.fromTo(split.chars, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: EASE.sortie, stagger: 0.018 })
      .fromTo(p.querySelectorAll('[data-change]'), { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: EASE.doux, stagger: 0.06 }, 0.1)
      .fromTo(p.querySelector('[data-chiffre]'), { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: EASE.sortie }, 0)
    return () => { tl.progress(1).kill(); split.revert() }
  }, [etape])

  const choisir = (i) => {
    const j = (i + n) % n
    const st = stRef.current
    if (st && st.end > st.start) {
      allerA(st.start + ((j + 0.5) / n) * (st.end - st.start))
    } else {
      etapeRef.current = j
      setEtape(j)
    }
  }

  // Balayage au doigt (mobile)
  const toucheRef = useRef(null)
  const surDebut = (e) => { toucheRef.current = e.touches?.[0]?.clientX ?? null }
  const surFin = (e) => {
    const x0 = toucheRef.current
    const x1 = e.changedTouches?.[0]?.clientX
    if (x0 == null || x1 == null) return
    if (Math.abs(x1 - x0) > 50) choisir(etape + (x1 < x0 ? 1 : -1))
  }

  const e = etapes[etape]

  return (
    <section id="pf-methodology" className="pf-section pf-methode" ref={ref}>
      <span className="pf-methode__chiffre-fond" data-chiffre-fond aria-hidden="true">{e.n}</span>

      <div className="pf-methode__grille">
        <div className="pf-methode__col">
          <span className="pf-label" data-a="fondu"><b>07</b> Méthode</span>
          <h2 className="pf-titre-mega pf-methode__titre" data-a="chars">Ma <em className="pf-it">méthode</em></h2>
          <div className="pf-methode__etapes" role="tablist" aria-label="Étapes de la méthode">
            <span className="pf-methode__rail" aria-hidden="true"><i ref={railRef} /></span>
            {etapes.map((x, i) => (
              <button
                key={x.n}
                type="button"
                role="tab"
                aria-selected={i === etape}
                className={i === etape ? 'est-actif' : i < etape ? 'est-passe' : ''}
                onClick={() => choisir(i)}
              >
                <em>{x.n}</em>{x.titre}
              </button>
            ))}
          </div>
        </div>

        <article
          className="pf-methode__panneau"
          ref={panneauRef}
          role="tabpanel"
          onTouchStart={surDebut}
          onTouchEnd={surFin}
        >
          <span className="pf-methode__chiffre" data-chiffre aria-hidden="true">{e.n}</span>
          <span className="pf-label" data-change>Chapitre {e.n} · {e.duree}</span>
          <h3 className="pf-methode__nom" data-titre key={`t-${etape}`}>{e.titre}</h3>
          <p className="pf-corps pf-corps--it" data-change>{e.desc}</p>
          <ul className="pf-methode__livrables" data-change>
            {e.livrables.map((l) => <li key={l}>{l}</li>)}
          </ul>
          <ul className="pf-methode__tags" data-change>
            {e.tags.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </article>
      </div>

      <footer className="pf-methode__pied">
        <span className="pf-entete__note">P. {String(etape + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        <div className="pf-methode__nav">
          <button type="button" className="pf-rond" aria-label="Étape précédente" onClick={() => choisir(etape - 1)} data-magnetique>←</button>
          <button type="button" className="pf-btn pf-btn--a" onClick={() => choisir(etape + 1)} data-magnetique>
            <span>Suivant · {etapes[(etape + 1) % n].titre} →</span>
          </button>
        </div>
      </footer>
    </section>
  )
}
