import { useMemo, useRef, useState } from 'react'
import { useAnimations } from '../moteur/animer'
import { gsap, EASE } from '../moteur/gsap'

function couleurCase(count) {
  if (count === 0) return 'var(--case-vide)'
  if (count <= 2) return 'rgba(var(--a-rgb),0.3)'
  if (count <= 5) return 'rgba(var(--a-rgb),0.55)'
  if (count <= 10) return 'rgba(var(--a-rgb),0.8)'
  return 'var(--a)'
}

function semaines(contributions) {
  const out = []
  let cur = []
  contributions.forEach((day, i) => {
    const dow = new Date(day.date).getDay()
    if (i === 0) for (let p = 0; p < dow; p++) cur.push(null)
    cur.push(day)
    if (dow === 6 || i === contributions.length - 1) {
      while (cur.length < 7) cur.push(null)
      out.push(cur); cur = []
    }
  })
  return out
}

// Entrée : un balayage horizontal ouvre la section ; la grille des
// contributions s'allume en vague diagonale ; les statistiques comptent.
export default function GitHub({ donnees, chargement, erreur }) {
  const ref = useRef(null)
  const [infobulle, setInfobulle] = useState(null)
  const contributions = useMemo(() => donnees?.contributions ?? [], [donnees])
  const grille = useMemo(() => semaines(contributions), [contributions])

  const mois = useMemo(() => {
    const m = []
    grille.forEach((w, wi) => {
      const first = w.find(Boolean)
      if (!first) return
      const d = new Date(first.date)
      if (d.getDate() <= 7) m.push({ wi, label: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '') })
    })
    return m
  }, [grille])

  const stats = useMemo(() => {
    let maxStreak = 0, cur = 0
    contributions.forEach((d) => { if (d.count > 0) { cur++; maxStreak = Math.max(maxStreak, cur) } else cur = 0 })
    return [
      [donnees?.total?.lastYear ?? 0, 'Contributions'],
      [maxStreak, 'Jours consécutifs'],
      [contributions.filter((d) => d.count > 0).length, 'Jours actifs'],
      [Math.max(0, ...contributions.map((d) => d.count)), 'Meilleur jour'],
    ]
  }, [contributions, donnees])

  useAnimations(ref, ({ bureau }) => {
    const q = gsap.utils.selector(ref)
    gsap.fromTo(q('[data-volet] i'), { scaleX: 1 }, { scaleX: 0, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top 20%', scrub: true } })
    const cases = q('[data-case]')
    if (cases.length) {
      gsap.fromTo(cases, { scale: 0, autoAlpha: 0 }, {
        scale: 1, autoAlpha: 1, duration: 0.6, ease: EASE.ressort,
        stagger: { amount: 1.4, grid: 'auto', from: 'start' },
        scrollTrigger: { trigger: q('[data-grille]')[0], start: 'top 80%', toggleActions: 'play none none reverse' },
      })
    }
    if (bureau) {
      gsap.to(q('[data-contenu]'), { yPercent: -6, autoAlpha: 0.35, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'bottom 70%', end: 'bottom top', scrub: true } })
    }
  }, [grille.length])

  const CASE = 'var(--case)'

  return (
    <section id="pf-github" className="pf-section pf-github" ref={ref}>
      <span className="pf-volet" data-volet aria-hidden="true">{Array.from({ length: 6 }).map((_, i) => <i key={i} />)}</span>
      <div data-contenu>
        <header className="pf-github__entete">
          <div>
            <span className="pf-label" data-a="fondu"><b>05</b> Activité</span>
            <h2 className="pf-titre-mega" data-a="chars">Activité <em className="pf-it">GitHub</em></h2>
          </div>
          <a className="pf-lien pf-lien--a" href="https://github.com/DevJ-58" target="_blank" rel="noopener noreferrer" data-a="fondu" data-magnetique>
            @DevJ-58 ↗
          </a>
        </header>

        {chargement && <p className="pf-etat pf-etat--pulse">Connexion au réseau GitHub…</p>}
        {erreur && !chargement && <p className="pf-etat">Données GitHub momentanément indisponibles.</p>}

        {donnees && (
          <>
            <p className="pf-github__total" data-a="fondu">
              <b data-a="compteur" data-valeur={donnees.total?.lastYear ?? 0}>{donnees.total?.lastYear ?? '—'}</b> contributions sur la dernière année
            </p>
            <div className="pf-github__defile">
              <div className="pf-github__grille" data-grille>
                <div className="pf-github__mois" aria-hidden="true">
                  {mois.map(({ wi, label }) => (
                    <span key={`${wi}-${label}`} style={{ left: `calc(${wi} * (${CASE} + var(--espace)))` }}>{label}</span>
                  ))}
                </div>
                <div className="pf-github__jours" aria-hidden="true">
                  {['', 'Lun', '', 'Mer', '', 'Ven', ''].map((j, i) => <span key={i}>{j}</span>)}
                </div>
                <div className="pf-github__semaines" role="img" aria-label={`${donnees.total?.lastYear ?? 0} contributions sur la dernière année`}>
                  {grille.map((w, wi) => (
                    <div key={wi} className="pf-github__semaine">
                      {w.map((d, di) => d ? (
                        <span
                          key={di} data-case
                          className={d.count > 8 ? 'est-intense' : ''}
                          style={{ background: couleurCase(d.count) }}
                          onMouseEnter={(e) => {
                            if (!d.count) return
                            const r = e.currentTarget.getBoundingClientRect()
                            setInfobulle({ x: r.left + r.width / 2, y: r.top - 10, date: d.date, count: d.count })
                          }}
                          onMouseLeave={() => setInfobulle(null)}
                        />
                      ) : <span key={di} className="est-vide" />)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pf-github__legende" aria-hidden="true">
              <span>Moins</span>
              {[0, 2, 5, 9, 15].map((v) => <i key={v} style={{ background: couleurCase(v) }} />)}
              <span>Plus</span>
            </div>

            <dl className="pf-github__stats">
              {stats.map(([v, l], i) => (
                <div key={l} data-a="fondu" data-delai={i * 0.08}>
                  <dt>{l}</dt>
                  <dd data-a="compteur" data-valeur={v}>{v}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>

      {infobulle && (
        <div className="pf-infobulle" style={{ left: infobulle.x, top: infobulle.y }}>
          <small>{new Date(infobulle.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</small>
          <b>{infobulle.count}</b>
          <span>contribution{infobulle.count > 1 ? 's' : ''}</span>
        </div>
      )}
    </section>
  )
}
