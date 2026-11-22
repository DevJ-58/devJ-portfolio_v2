import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAnimations } from '../moteur/animer'
import { gsap, SplitText, EASE, mouvementReduit } from '../moteur/gsap'
import Ciel from './Ciel'

// Position (en % de la constellation) et taille relative de chaque étoile
const ETOILES = [
  { x: 16, y: 34, t: 1, z: 1 },
  { x: 41, y: 15, t: 0.62, z: 0.55 },
  { x: 50, y: 56, t: 0.82, z: 0.8 },
  { x: 75, y: 26, t: 0.58, z: 0.45 },
  { x: 84, y: 68, t: 0.5, z: 0.35 },
  { x: 27, y: 80, t: 0.46, z: 0.6 },
]
// Liaisons entre étoiles (indices)
const LIENS = [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4], [4, 2], [2, 5], [5, 0], [3, 2]]

function lienDe(p) { return p.lien || null }

// Scène nocturne : un panneau sombre qui s'ouvre en plein cadre au scroll,
// un ciel vivant, des étoiles-projets reliées par des lignes qui se tracent,
// et une fiche qui suit l'étoile survolée. Mobile : orbite verticale.
export default function Projets({ projets }) {
  const ref = useRef(null)
  const ficheRef = useRef(null)
  const navigate = useNavigate()
  const [actif, setActif] = useState(0)
  const items = projets.slice(0, 6)
  const courant = items[actif] || items[0]

  useAnimations(ref, ({ bureau, mobile }) => {
    const q = gsap.utils.selector(ref)
    const scene = q('[data-scene]')[0]

    // Ouverture / fermeture de la scène
    gsap.fromTo(scene,
      { clipPath: 'inset(9% 7% 0% 7% round 56px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top top', scrub: true } })
    gsap.fromTo(scene, { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, {
      clipPath: 'inset(0% 5% 8% 5% round 56px)', ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: ref.current, start: 'bottom 90%', end: 'bottom 20%', scrub: true },
    })

    if (bureau) {
      // Allumage : lignes qui poussent d'une étoile à l'autre, puis étoiles
      const tl = gsap.timeline({ scrollTrigger: { trigger: q('[data-constel]')[0], start: 'top 70%', toggleActions: 'play none none reverse' } })
      q('[data-lien]').forEach((l, i) => {
        const x1 = l.getAttribute('x1'), y1 = l.getAttribute('y1')
        tl.from(l, { attr: { x2: x1, y2: y1 }, duration: 1.1, ease: EASE.rideau }, 0.1 + i * 0.08)
      })
      tl.fromTo(q('[data-orbe]'), { scale: 0, autoAlpha: 0, filter: 'blur(14px)' }, { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 1.3, ease: EASE.sortie, stagger: { each: 0.12, from: 'start' } }, 0.2)
        .fromTo(q('[data-orbite]'), { rotate: -120 }, { rotate: 0, duration: 2.2, ease: EASE.sortie, stagger: 0.1 }, 0.2)
        .fromTo(q('[data-fiche] > *'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: EASE.sortie, stagger: 0.08 }, 0.5)

      // Impulsions lumineuses qui voyagent sur les liaisons
      q('[data-impulsion]').forEach((pt, i) => {
        const [a, b] = LIENS[(i * 3) % LIENS.length]
        gsap.fromTo(pt, { attr: { cx: ETOILES[a].x, cy: ETOILES[a].y }, autoAlpha: 0 }, {
          attr: { cx: ETOILES[b].x, cy: ETOILES[b].y }, autoAlpha: 1, duration: 3 + i, ease: 'sine.inOut',
          repeat: -1, repeatDelay: 1.5 + i * 0.7, delay: i * 1.3, yoyo: true,
        })
      })

      // Flottement et relief à la souris
      const orbes = q('[data-orbe-flotte]')
      orbes.forEach((o, i) => gsap.to(o, { y: i % 2 ? 9 : -9, duration: 3 + (i % 3), ease: 'sine.inOut', repeat: -1, yoyo: true }))
      const deplaceurs = q('[data-orbe]').map((o) => ({
        z: Number(o.dataset.z), x: gsap.quickTo(o, 'x', { duration: 1, ease: 'power3' }), y: gsap.quickTo(o, 'y', { duration: 1, ease: 'power3' }),
      }))
      const surSouris = (e) => {
        const r = scene.getBoundingClientRect()
        const dx = (e.clientX - r.left) / r.width - 0.5
        const dy = (e.clientY - r.top) / r.height - 0.5
        deplaceurs.forEach((d) => { d.x(dx * 46 * d.z); d.y(dy * 32 * d.z) })
      }
      scene.addEventListener('pointermove', surSouris)
      return () => scene.removeEventListener('pointermove', surSouris)
    }

    if (mobile) {
      gsap.fromTo(q('[data-fil-mobile]'), { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: q('[data-orbite-mobile]')[0], start: 'top 70%', end: 'bottom 70%', scrub: true } })
      q('[data-item-mobile]').forEach((it, i) => {
        gsap.fromTo(it.querySelector('[data-bulle]'), { scale: 0.4, autoAlpha: 0, rotate: i % 2 ? 20 : -20 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 1.1, ease: EASE.sortie, scrollTrigger: { trigger: it, start: 'top 85%', toggleActions: 'play none none reverse' } })
        gsap.from(it.querySelectorAll('[data-texte] > *'), { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: EASE.sortie, scrollTrigger: { trigger: it, start: 'top 80%', toggleActions: 'play none none reverse' } })
      })
    }
  }, [items.length])

  // Changement d'étoile : la fiche se réécrit
  const premierRendu = useRef(true)
  useEffect(() => {
    const fiche = ficheRef.current
    if (premierRendu.current) { premierRendu.current = false; return }
    if (!fiche || mouvementReduit()) return
    const titre = fiche.querySelector('[data-titre]')
    // fromTo : un survol rapide interrompt l'animation précédente, les
    // valeurs d'arrivée doivent rester fixes
    const split = SplitText.create(titre, { linesClass: 'pf-ligne', wordsClass: 'pf-mot', charsClass: 'pf-car', type: 'words,chars', mask: 'words' })
    const tl = gsap.timeline()
    tl.fromTo(split.chars, { yPercent: 105 }, { yPercent: 0, duration: 0.8, ease: EASE.sortie, stagger: 0.015 })
      .fromTo(fiche.querySelectorAll('[data-change]'), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: EASE.doux, stagger: 0.05 }, 0.08)
    return () => { tl.progress(1).kill(); split.revert() }
  }, [actif])

  const ouvrir = (p) => {
    const l = lienDe(p)
    if (l) window.open(l, '_blank', 'noopener')
    else navigate('/projets')
  }

  const actifs = new Set(LIENS.filter(([a, b]) => a === actif || b === actif).map((e) => e.join('-')))

  return (
    <section id="pf-projects" className="pf-projets" ref={ref}>
      <div className="pf-scene" data-scene>
        <Ciel />
        <div className="pf-scene__halo" aria-hidden="true" />

        <header className="pf-scene__entete">
          <div>
            <span className="pf-label" data-a="fondu"><b>04</b> Projets</span>
            <h2 className="pf-titre-mega" data-a="chars">Constellation <em className="pf-it">de travaux</em></h2>
          </div>
          <p className="pf-scene__note" data-a="fondu" data-delai="0.2">
            {String(projets.length).padStart(2, '0')} réalisations · chaque étoile est un projet livré
          </p>
        </header>

        {/* Bureau : constellation interactive */}
        <div className="pf-constel">
          <div className="pf-constel__ciel" data-constel>
            <svg className="pf-constel__liens" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {LIENS.filter(([a, b]) => items[a] && items[b]).map(([a, b]) => (
                <line
                  key={`${a}-${b}`} data-lien
                  className={actifs.has(`${a}-${b}`) ? 'est-actif' : ''}
                  x1={ETOILES[a].x} y1={ETOILES[a].y} x2={ETOILES[b].x} y2={ETOILES[b].y}
                />
              ))}
              {[0, 1, 2].map((i) => <circle key={i} data-impulsion r="0.45" cx={ETOILES[0].x} cy={ETOILES[0].y} opacity="0" />)}
            </svg>

            {items.map((p, i) => {
              const e = ETOILES[i]
              return (
                <button
                  key={p.num || i}
                  type="button"
                  className={`pf-orbe${actif === i ? ' est-actif' : ''}`}
                  style={{ left: `${e.x}%`, top: `${e.y}%`, '--t': e.t }}
                  data-orbe data-z={e.z}
                  data-curseur={lienDe(p) ? 'Visiter' : 'Explorer'}
                  onMouseEnter={() => setActif(i)}
                  onFocus={() => setActif(i)}
                  onClick={() => ouvrir(p)}
                  aria-label={`${p.titre} — ${lienDe(p) ? 'ouvrir le site' : 'voir les projets'}`}
                >
                  <span className="pf-orbe__flotte" data-orbe-flotte>
                    <svg className="pf-orbe__orbite" data-orbite viewBox="0 0 100 100" aria-hidden="true">
                      <circle cx="50" cy="50" r="48" />
                      <circle cx="50" cy="50" r="48" className="trace" />
                    </svg>
                    <span className="pf-orbe__image">
                      <img src={p.img} alt="" loading="lazy" onError={(ev) => { ev.currentTarget.style.visibility = 'hidden' }} />
                    </span>
                    <span className="pf-orbe__num">{p.num}</span>
                    <span className="pf-orbe__nom">{p.titre}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <aside className="pf-fiche" data-fiche ref={ficheRef} aria-live="polite">
            <span className="pf-fiche__index" data-change>
              <b>{courant?.num}</b> / {String(items.length).padStart(2, '0')}
            </span>
            <h3 className="pf-fiche__titre" data-titre key={`t-${actif}`}>{courant?.titre}</h3>
            <p className="pf-fiche__desc" data-change>{courant?.desc}</p>
            <ul className="pf-fiche__tags" data-change>
              {(courant?.tags || []).map((t) => <li key={t}>{t}</li>)}
            </ul>
            <button type="button" className="pf-btn pf-btn--nuit" data-change data-magnetique onClick={() => courant && ouvrir(courant)}>
              <span>{lienDe(courant || {}) ? 'Visiter le projet ↗' : 'Voir le détail →'}</span>
            </button>
          </aside>
        </div>

        {/* Mobile : orbite verticale */}
        <ol className="pf-orbite-mobile" data-orbite-mobile>
          <span className="pf-orbite-mobile__fil" data-fil-mobile aria-hidden="true" />
          {items.map((p, i) => (
            <li key={p.num || i} data-item-mobile className={i % 2 ? 'est-droite' : ''}>
              <button type="button" className="pf-orbite-mobile__bulle" data-bulle onClick={() => ouvrir(p)} aria-label={`Ouvrir ${p.titre}`}>
                <img src={p.img} alt="" loading="lazy" onError={(ev) => { ev.currentTarget.style.visibility = 'hidden' }} />
                <span>{p.num}</span>
              </button>
              <div className="pf-orbite-mobile__texte" data-texte>
                <h3>{p.titre}</h3>
                <p>{p.desc}</p>
                <ul>{(p.tags || []).slice(0, 3).map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            </li>
          ))}
        </ol>

        <footer className="pf-scene__pied">
          <span>{projets.length} projets réalisés · survolez une étoile pour l'explorer</span>
          <a className="pf-btn pf-btn--clair" href="/projets" data-magnetique onClick={(e) => { e.preventDefault(); navigate('/projets') }}>
            <span>Tout voir →</span>
          </a>
        </footer>
      </div>
    </section>
  )
}
