import { useEffect, useRef, useState } from 'react'
import { Settings, Sun, Moon, Check } from 'lucide-react'
import utiliserTheme from '@/store/utiliserTheme'
import themes from '@/donnees/themes'
import './parametres.css'

// Réglages d'interface : mode clair/sombre et couleur d'accent.
//
// variante="flottant" (défaut) : bouton rond fixé en haut à droite ; la
//   fenêtre se ferme au clic à l'extérieur, avec Échap ou en recliquant.
// variante="integre" : seulement le contenu (utilisé dans le menu du portfolio).
export default function PanneauParametres({ variante = 'flottant' }) {
  const [ouvert, setOuvert] = useState(false)
  const racineRef = useRef(null)
  const { theme, mode, setMode, changerTheme, getThemeEffectif } = utiliserTheme()
  const eff = getThemeEffectif ? getThemeEffectif() : theme
  const isLight = mode === 'light'

  // Fermeture au clic extérieur et à la touche Échap
  useEffect(() => {
    if (!ouvert) return
    const dehors = (e) => { if (racineRef.current && !racineRef.current.contains(e.target)) setOuvert(false) }
    const echap = (e) => { if (e.key === 'Escape') setOuvert(false) }
    document.addEventListener('pointerdown', dehors, true)
    document.addEventListener('keydown', echap)
    return () => {
      document.removeEventListener('pointerdown', dehors, true)
      document.removeEventListener('keydown', echap)
    }
  }, [ouvert])

  const vars = {
    '--pp-a': eff.accent,
    '--pp-a-rgb': eff.accentRgb,
    '--pp-av': eff.accentVif || eff.accent,
    '--pp-fond': isLight ? 'rgba(255,255,255,0.94)' : 'rgba(10,11,14,0.94)',
    '--pp-texte': isLight ? '#0f172a' : '#f2f0ec',
    '--pp-doux': isLight ? '#526075' : 'rgba(242,240,236,0.62)',
    '--pp-bord': isLight ? 'rgba(15,23,42,0.1)' : 'rgba(242,240,236,0.1)',
    '--pp-case': isLight ? 'rgba(15,23,42,0.04)' : 'rgba(242,240,236,0.04)',
  }

  const listeThemes = Object.values(themes).filter((t) => !(isLight && t.id === 'blanc'))

  const contenu = (
    <div className="pp-contenu">
      <div className="pp-bloc">
        <span className="pp-titre">Ambiance</span>
        <div className="pp-mode" role="radiogroup" aria-label="Mode d'affichage">
          <span className={`pp-mode__indic${isLight ? ' est-clair' : ''}`} aria-hidden="true" />
          <button type="button" role="radio" aria-checked={!isLight} className={!isLight ? 'est-actif' : ''} onClick={() => setMode('dark')}>
            <Moon size={14} aria-hidden="true" /> Sombre
          </button>
          <button type="button" role="radio" aria-checked={isLight} className={isLight ? 'est-actif' : ''} onClick={() => setMode('light')}>
            <Sun size={14} aria-hidden="true" /> Clair
          </button>
        </div>
      </div>

      <div className="pp-bloc">
        <span className="pp-titre">Couleur <em>{theme.nom || theme.label}</em></span>
        <div className="pp-couleurs" role="radiogroup" aria-label="Couleur d'accent">
          {listeThemes.map((t) => {
            const actif = theme.id === t.id
            const pastille = isLight ? (t.accentClair || t.accent) : t.accent
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={actif}
                aria-label={t.nom}
                title={t.nom}
                className={actif ? 'est-actif' : ''}
                style={{ '--c': pastille }}
                onClick={() => changerTheme(t.id)}
              >
                {actif && <Check size={13} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  if (variante === 'integre') {
    return <div className={`pp pp--integre${isLight ? ' est-clair' : ''}`} style={vars}>{contenu}</div>
  }

  return (
    <div className={`pp pp--flottant${isLight ? ' est-clair' : ''}${ouvert ? ' est-ouvert' : ''}`} style={vars} ref={racineRef}>
      <button
        type="button"
        className="pp-bouton"
        aria-label={ouvert ? 'Fermer les paramètres' : 'Ouvrir les paramètres'}
        aria-expanded={ouvert}
        onClick={() => setOuvert((o) => !o)}
      >
        <span className="pp-bouton__anneau" aria-hidden="true" />
        <Settings size={16} aria-hidden="true" />
      </button>
      {ouvert && (
        <div className="pp-fenetre" role="dialog" aria-label="Paramètres d'affichage">
          <div className="pp-fenetre__tete">
            <span>Paramètres</span>
            <small>Échap pour fermer</small>
          </div>
          {contenu}
        </div>
      )}
    </div>
  )
}
