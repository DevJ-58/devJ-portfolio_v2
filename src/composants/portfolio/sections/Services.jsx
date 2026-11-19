import { useEffect, useRef, useState } from 'react'
import { useAnimations } from '../moteur/animer'
import { gsap, ScrollTrigger, EASE } from '../moteur/gsap'
import { services } from '../donnees'

function decouperPrix(prix) {
  const parts = prix.split(' ')
  if (parts[parts.length - 1] !== 'FCFA') return { montant: null, texte: prix }
  const montant = Number(parts.slice(0, -1).join(''))
  return { montant: Number.isFinite(montant) ? montant : null, texte: parts.slice(0, -1).join(' ') }
}

// Trois lignes géantes : chacune se dévoile comme un rideau de gauche à
// droite, son prix est compté. Survol / ouverture : la ligne se remplit
// d'accent et déploie les inclusions. Sortie : les lignes glissent à gauche.
export default function Services() {
  const ref = useRef(null)
  const [ouvert, setOuvert] = useState(1)

  // La hauteur change quand une offre se déplie : les sections épinglées
  // suivantes recalculent leurs positions une fois l'animation finie.
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 650)
    return () => clearTimeout(t)
  }, [ouvert])

  useAnimations(ref, ({ bureau }) => {
    const q = gsap.utils.selector(ref)
    q('[data-ligne]').forEach((l, i) => {
      gsap.fromTo(l, { clipPath: 'inset(0% 100% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: EASE.rideau, delay: i * 0.12,
        scrollTrigger: { trigger: l, start: 'top 85%', toggleActions: 'play none none reverse' },
      })
      gsap.from(l.querySelector('[data-num]'), { xPercent: 40, autoAlpha: 0, duration: 1.6, ease: EASE.sortie, scrollTrigger: { trigger: l, start: 'top 80%', toggleActions: 'play none none reverse' } })
      if (bureau) {
        gsap.to(l, { xPercent: -8 - i * 3, autoAlpha: 0.3, ease: 'none', scrollTrigger: { trigger: l, start: 'top 22%', end: 'bottom -10%', scrub: true } })
      }
    })
  })

  return (
    <section id="pf-services" className="pf-section pf-services" ref={ref}>
      <header className="pf-entete">
        <span className="pf-label" data-a="fondu"><b>06</b> Services</span>
        <span className="pf-entete__note" data-a="fondu" data-delai="0.1">Tarifs indicatifs · devis gratuit</span>
      </header>
      <h2 className="pf-titre-mega" data-a="chars">Offres <em className="pf-it">&amp; tarifs</em></h2>

      <ol className="pf-services__liste">
        {services.map((sv, i) => {
          const { montant, texte } = decouperPrix(sv.prix)
          const estOuvert = ouvert === i
          return (
            <li key={sv.titre} className={`pf-service${estOuvert ? ' est-ouvert' : ''}${sv.badge ? ' est-populaire' : ''}`} data-ligne>
              <button
                type="button"
                className="pf-service__tete"
                aria-expanded={estOuvert}
                onClick={() => setOuvert(estOuvert ? -1 : i)}
                data-curseur={estOuvert ? 'Fermer' : 'Ouvrir'}
              >
                <span className="pf-service__num" data-num aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="pf-service__titre">
                  {sv.titre}
                  {sv.badge && <small className="pf-pastille"><i />{sv.badge}</small>}
                </span>
                <span className="pf-service__prix">
                  {montant != null
                    ? <b data-a="compteur" data-valeur={montant}>{texte}</b>
                    : <b>{texte}</b>}
                  {montant != null && <small>FCFA</small>}
                </span>
                <span className="pf-service__fleche" aria-hidden="true">↗</span>
              </button>
              <div className="pf-service__corps">
                <div>
                  <p className="pf-service__delai">Délai · {sv.delai}</p>
                  <ul>
                    {sv.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="pf-actions" data-a="fondu">
        <a className="pf-btn" href="mailto:devfred58@gmail.com" data-magnetique><span>Demander un devis</span></a>
        <span className="pf-entete__note">Réponse sous 24h</span>
      </div>
    </section>
  )
}
