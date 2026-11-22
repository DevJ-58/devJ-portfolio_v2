import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserTheme from '@/store/utiliserTheme'
import usePortfolioData from '@/hooks/usePortfolioData'
import ProjectDetailOverlay from '@/composants/ui/projets3d/ProjectDetailOverlay'
import { gsap, EASE, MEDIA, useGSAP, mouvementReduit } from '@/composants/portfolio/moteur/gsap'
import { variablesTheme } from '@/composants/portfolio/moteur/contexte'
import '@/composants/portfolio/portfolio.css'

const CATEGORIES = {
  frontend: { label: 'Frontend', color: '#5DCAA5' },
  fullstack: { label: 'Fullstack', color: '#378ADD' },
  ia: { label: 'IA & Data', color: '#D4537E' },
  impact: { label: 'Impact social', color: '#EF9F27' },
}
const ESPACE = 14 // écart entre les tuiles (px)

// Calcule le nombre de colonnes et la largeur des tuiles (format 16/10)
// pour que tous les projets tiennent dans la zone, sans défilement.
function calculerGrille(n, largeur, hauteur) {
  let meilleur = { colonnes: 1, l: 0 }
  for (let colonnes = 1; colonnes <= Math.max(1, n); colonnes += 1) {
    const lignes = Math.ceil(n / colonnes)
    const parLargeur = (largeur - ESPACE * (colonnes - 1)) / colonnes
    const parHauteur = ((hauteur - ESPACE * (lignes - 1)) / lignes) * 1.6
    const l = Math.min(parLargeur, parHauteur)
    if (l > meilleur.l) meilleur = { colonnes, l }
  }
  return meilleur
}

// /projets : tous les projets d'un coup d'œil, sur un mur incliné en 3D qui
// suit la souris. Survol (ou toucher) : la tuile avance et la fiche s'affiche.
// Clic : fiche complète. Les filtres estompent les autres projets sans les
// déplacer. Les projets sont lus dans la base.
export default function ProjetsFull() {
  const { theme, getThemeEffectif } = utiliserTheme()
  const eff = getThemeEffectif ? getThemeEffectif() : theme
  // La galerie est sombre : on garde les couleurs du mode sombre
  const vars = { ...variablesTheme({ ...eff, accent: eff.accentVif || theme.accent, accentRgb: eff.accentVifRgb || theme.accentRgb, fond: '#050608', fondSecondaire: '#0a0c10', texte: '#f2f0ec', textHigh: 'rgba(255,255,255,0.88)', textMedium: 'rgba(255,255,255,0.74)', textMuted: 'rgba(255,255,255,0.62)', textFaint: 'rgba(255,255,255,0.5)', borderStrong: 'rgba(255,255,255,0.14)', borderMedium: 'rgba(255,255,255,0.09)', borderLight: 'rgba(255,255,255,0.06)', cardBg: 'rgba(255,255,255,0.03)', glassOverlay: 'rgba(8,10,14,0.85)', navOverlay: 'rgba(5,6,8,0.85)', shadow: 'rgba(0,0,0,0.5)' }, false) }
  const a = vars['--a']
  const navigate = useNavigate()
  const ref = useRef(null)
  const sceneRef = useRef(null)
  const planRef = useRef(null)
  const murRef = useRef(null)
  const filtresRef = useRef(null)
  const indicRef = useRef(null)
  const [filtre, setFiltre] = useState('TOUS')
  const [actif, setActif] = useState(0)
  const [survol, setSurvol] = useState(false)
  const [grille, setGrille] = useState({ colonnes: 5, l: 200 })
  const [projetSelectionne, setProjetSelectionne] = useState(null)
  const typePointeur = useRef('mouse')

  const { projets: projetsData, chargement } = usePortfolioData([])
  const projets = useMemo(() => projetsData.map((p, i) => ({
    ...p,
    num: String(i + 1).padStart(2, '0'),
    tags: Array.isArray(p.tags) ? p.tags : p.tags ? Object.values(p.tags) : [],
  })), [projetsData])
  const n = projets.length
  const courant = projets[Math.min(actif, Math.max(0, n - 1))]
  const visible = (p) => filtre === 'TOUS' || p.type === filtre
  const nbVisibles = projets.filter(visible).length

  useEffect(() => {
    window.scrollTo(0, 0)
    const echap = (e) => { if (e.key === 'Escape') setProjetSelectionne(null) }
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [])

  // Taille des tuiles : tout le mur tient dans la scène
  useLayoutEffect(() => {
    const zone = murRef.current
    if (!zone || !n) return
    const majGrille = () => {
      // Zone du mur (la fiche a sa propre place) ; marge pour l'inclinaison 3D
      const r = zone.getBoundingClientRect()
      setGrille(calculerGrille(n, r.width * 0.86, r.height * 0.84))
    }
    majGrille()
    const ro = new ResizeObserver(majGrille)
    ro.observe(zone)
    return () => ro.disconnect()
  }, [n])

  // Arrivée des tuiles depuis la profondeur, puis le mur suit la souris
  useGSAP(() => {
    if (!n || mouvementReduit()) return
    const q = gsap.utils.selector(ref)
    gsap.fromTo(q('[data-tuile]'), { z: -700, autoAlpha: 0, rotationX: -25 }, { z: 0, autoAlpha: 1, rotationX: 0, duration: 1.4, ease: EASE.sortie, stagger: { each: 0.035, from: 'center', grid: 'auto' }, clearProps: 'transform,opacity,visibility' })
    gsap.fromTo(q('[data-entete] > *'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: EASE.sortie, stagger: 0.08 })
    const mm = gsap.matchMedia()
    mm.add(MEDIA.bureau, () => {
      const plan = planRef.current
      const scene = sceneRef.current
      gsap.set(plan, { rotationX: 12, rotationY: -8 })
      const rx = gsap.quickTo(plan, 'rotationX', { duration: 1.2, ease: 'power3' })
      const ry = gsap.quickTo(plan, 'rotationY', { duration: 1.2, ease: 'power3' })
      const bouger = (e) => {
        const r = scene.getBoundingClientRect()
        const mx = (e.clientX - r.left) / r.width - 0.5
        const my = (e.clientY - r.top) / r.height - 0.5
        rx(12 - my * 10)
        ry(-8 + mx * 14)
      }
      const repos = () => { rx(12); ry(-8) }
      scene.addEventListener('pointermove', bouger)
      scene.addEventListener('pointerleave', repos)
      return () => { scene.removeEventListener('pointermove', bouger); scene.removeEventListener('pointerleave', repos) }
    })
    return () => mm.revert()
  }, { scope: ref, dependencies: [n], revertOnUpdate: true })

  // Indicateur des filtres qui glisse vers le filtre actif
  useGSAP(() => {
    const zone = filtresRef.current
    const indic = indicRef.current
    const bouton = zone?.querySelector('[aria-pressed="true"]')
    if (!bouton || !indic) return
    const couleur = filtre === 'TOUS' ? a : CATEGORIES[filtre]?.color || a
    gsap.to(indic, { x: bouton.offsetLeft, width: bouton.offsetWidth, backgroundColor: couleur, duration: mouvementReduit() ? 0 : 0.6, ease: EASE.sortie })
  }, { dependencies: [filtre, n] })

  // Un filtre change : la fiche montre le premier projet visible
  const choisirFiltre = (cle) => {
    setFiltre(cle)
    const i = projets.findIndex((p) => cle === 'TOUS' || p.type === cle)
    if (i >= 0) setActif(i)
  }

  const filtres = [['TOUS', 'Tous', a], ...Object.entries(CATEGORIES).map(([k, c]) => [k, c.label, c.color])]
  const catCourant = courant ? CATEGORIES[courant.type] : null
  const enLigne = courant && (courant.status === 'EN LIGNE' || courant.status === 'EN PRODUCTION')

  return (
    <div className="pj-page est-sombre" ref={ref} style={vars}>
      <div className="pj-ecran">
        <nav className="pj-nav">
          <button type="button" className="pf-lien" onClick={() => navigate('/experience', { state: { skipGreeting: true } })}>← Retour</button>
          <span className="pj-nav__logo">&lt;<span>/DevJ</span>&gt;</span>
          <button type="button" className="pf-lien" onClick={() => navigate('/portfolio', { state: { skipGreeting: true } })}>Portfolio →</button>
        </nav>

        <header className="pj-tete" data-entete>
          <div className="pj-tete__titre">
            <span className="pf-label"><b>{String(nbVisibles).padStart(2, '0')}</b> projets</span>
            <h1>Tous mes <em className="pf-it">projets</em></h1>
          </div>
          <div className="pj-filtres" ref={filtresRef} role="group" aria-label="Filtrer par catégorie">
            <span className="pj-filtres__indic" ref={indicRef} aria-hidden="true" />
            {filtres.map(([cle, label, couleur]) => (
              <button key={cle} type="button" aria-pressed={filtre === cle} className={filtre === cle ? 'est-actif' : ''} style={{ '--c': couleur }} onClick={() => choisirFiltre(cle)}>
                {cle !== 'TOUS' && <i aria-hidden="true" />}{label}
              </button>
            ))}
          </div>
        </header>

        <section className="pj-scene3d" ref={sceneRef} aria-label="Mur des projets">
          {chargement && n === 0 && <p className="pj-scene3d__vide">Chargement des projets…</p>}
          {!chargement && n === 0 && <p className="pj-scene3d__vide">Aucun projet pour l’instant.</p>}

          <div className="pj-mur" ref={murRef}>
            <div className="pj-mur__plan" ref={planRef} style={{ gridTemplateColumns: `repeat(${grille.colonnes}, ${grille.l}px)`, gap: ESPACE }}>
              {projets.map((p, i) => {
                const cat = CATEGORIES[p.type]
                const estVisible = visible(p)
                return (
                  <button
                    key={p.id || p.titre}
                    type="button"
                    data-tuile
                    className={`pj-tuile${i === actif ? ' est-actif' : ''}${survol && i !== actif ? ' est-retrait' : ''}${estVisible ? '' : ' est-masque'}`}
                    style={{ width: grille.l, '--c': cat?.color || a }}
                    tabIndex={estVisible ? 0 : -1}
                    aria-hidden={!estVisible}
                    aria-label={`${p.titre} — ${cat?.label || 'Projet'}`}
                    onPointerEnter={(e) => { if (e.pointerType === 'mouse') { setActif(i); setSurvol(true) } }}
                    onPointerLeave={(e) => { if (e.pointerType === 'mouse') setSurvol(false) }}
                    onFocus={() => { if (typePointeur.current !== 'touch') setActif(i) }}
                    onPointerDown={(e) => { typePointeur.current = e.pointerType }}
                    onKeyDown={() => { typePointeur.current = 'clavier' }}
                    onClick={() => {
                      // Toucher : un premier toucher choisit, le second ouvre
                      if (typePointeur.current === 'touch' && i !== actif) { setActif(i); return }
                      setProjetSelectionne(p)
                    }}
                  >
                    {p.img ? <img src={p.img} alt="" loading="lazy" draggable="false" /> : <span className="pj-tuile__sans-image">{p.titre}</span>}
                    <span className="pj-tuile__legende"><i aria-hidden="true" />{p.titre}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {courant && (
            <aside className="pj-fiche" style={{ '--c': catCourant?.color || a }} aria-live="polite">
              <div className="pj-fiche__tete">
                <span className="pj-fiche__num">{courant.num} <em>/ {String(n).padStart(2, '0')}</em></span>
                {enLigne && <span className="pj-fiche__ligne"><i aria-hidden="true" />En ligne</span>}
              </div>
              <div className="pj-fiche__corps" key={courant.num}>
                <span className="pj-fiche__cat"><i aria-hidden="true" />{catCourant?.label || 'Projet'} · {courant.categorie}</span>
                <h2 className="pj-fiche__titre">{courant.titre}</h2>
                <p className="pj-fiche__desc">{courant.desc}</p>
                <ul className="pj-fiche__tags">{courant.tags.slice(0, 4).map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              <div className="pj-fiche__actions">
                <button type="button" className="pf-lien" onClick={() => setProjetSelectionne(courant)}>Détails</button>
                {courant.lien && (
                  <a className="pf-btn pf-btn--a" href={courant.lien} target="_blank" rel="noopener noreferrer">
                    <span>{enLigne ? 'Voir le site' : 'Voir le code'} ↗</span>
                  </a>
                )}
              </div>
            </aside>
          )}
          <p className="pj-scene3d__aide" aria-hidden="true">Survolez une carte · cliquez pour ouvrir</p>
        </section>
      </div>

      {projetSelectionne && (
        <div className="pj-detail">
          <ProjectDetailOverlay
            projet={projetSelectionne}
            categoryColor={CATEGORIES[projetSelectionne.type]?.color || a}
            onClose={() => setProjetSelectionne(null)}
          />
        </div>
      )}
    </div>
  )
}
