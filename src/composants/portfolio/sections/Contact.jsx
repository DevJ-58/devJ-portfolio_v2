import { useRef } from 'react'
import { useAnimations, animerBandeau } from '../moteur/animer'
import { gsap, EASE } from '../moteur/gsap'
import { contacts, reseaux } from '../donnees'

// Climax : « Travaillons ensemble. » en très grand, canaux de contact qui
// roulent au survol, appel à l'action magnétique, bandeau « disponible ».
// Pied de page : le monogramme monte pendant qu'on arrive en bas.
export default function Contact({ children }) {
  const ref = useRef(null)
  const piedRef = useRef(null)

  useAnimations(ref, () => {
    const q = gsap.utils.selector(ref)
    const b = animerBandeau(q('[data-bandeau]')[0], { vitesse: 28, declencheurEl: q('[data-bandeau-wrap]')[0] })
    q('[data-canal]').forEach((c, i) => {
      gsap.from(c, { yPercent: 40, autoAlpha: 0, duration: 1.1, ease: EASE.sortie, delay: i * 0.06, scrollTrigger: { trigger: c, start: 'top 90%', toggleActions: 'play none none reverse' } })
      gsap.fromTo(c.querySelector('[data-trait]'), { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 1.4, ease: EASE.rideau, scrollTrigger: { trigger: c, start: 'top 90%', toggleActions: 'play none none reverse' } })
    })
    const pied = piedRef.current
    if (pied) {
      gsap.fromTo(pied.querySelector('[data-monogramme]'), { yPercent: 55, scale: 0.9 }, {
        yPercent: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: pied, start: 'top bottom', end: 'bottom bottom', scrub: true },
      })
    }
    return () => { b?.kill() }
  })

  return (
    <div ref={ref}>
      <section id="pf-contact" className="pf-section pf-contact">
        <span className="pf-label" data-a="fondu"><b>08</b> Contact</span>
        <h2 className="pf-titre-giga" data-a="chars">Travaillons <em className="pf-it">ensemble.</em></h2>

        <div className="pf-contact__grille">
          <div>
            <p className="pf-corps pf-corps--grand pf-corps--it" data-a="lignes">
              Un projet en tête ? Que ce soit une refonte, une application sur mesure ou une collaboration ponctuelle — je suis disponible pour des missions freelance, des collaborations et des opportunités à temps plein.
            </p>
            <span className="pf-pastille pf-pastille--grande" data-a="fondu"><i />Disponible pour de nouveaux projets</span>
            <div className="pf-contact__cta" data-a="fondu">
              <a className="pf-btn pf-btn--a pf-btn--geant" href="mailto:devfred58@gmail.com" data-magnetique>
                <span>Démarrer un projet →</span>
              </a>
              <p className="pf-entete__note">Ou écrivez sur WhatsApp pour une réponse rapide</p>
            </div>
          </div>

          <ul className="pf-contact__canaux">
            {contacts.map(({ label, val, href, desc }, i) => (
              <li key={label} data-canal>
                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" data-curseur="Écrire">
                  <span className="pf-contact__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pf-contact__label">
                    <span className="pf-roule"><span>{label}</span><span aria-hidden="true">{label}</span></span>
                  </span>
                  <span className="pf-contact__val">{val}<small>{desc}</small></span>
                  <span className="pf-contact__fleche" aria-hidden="true">↗</span>
                </a>
                <span className="pf-contact__trait" data-trait aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>

        {children}
      </section>

      <div className="pf-bandeau pf-bandeau--contact" data-bandeau-wrap aria-hidden="true">
        <div className="pf-bandeau__piste" data-bandeau>
          {[0, 1].map((k) => (
            <span key={k} className="pf-bandeau__groupe">
              {['Disponible', 'Freelance', 'Collaborations', 'Temps plein', 'Yamoussoukro', 'Partout'].map((m) => (
                <span key={`${k}-${m}`}>{m}<i>✦</i></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <footer className="pf-pied" ref={piedRef}>
        <div className="pf-pied__haut">
          <span className="pf-entete__note">Fréjus Kouadio · Développeur logiciel</span>
          <ul>
            {reseaux.map(({ label, href }) => (
              <li key={label}><a className="pf-lien" href={href} target="_blank" rel="noopener noreferrer">{label}</a></li>
            ))}
          </ul>
          <span className="pf-entete__note">© {new Date().getFullYear()} · Yamoussoukro, CI</span>
        </div>
        <div className="pf-pied__monogramme" data-monogramme aria-hidden="true">&lt;/DevJ&gt;</div>
      </footer>
    </div>
  )
}
