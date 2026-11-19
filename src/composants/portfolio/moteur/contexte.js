// Contexte partagé par toutes les sections du portfolio : conteneur de
// défilement, instance Lenis, navigation, thème et état mobile.
import { createContext, useContext } from 'react'

export const ContextePortfolio = createContext(null)

export function usePortfolio() {
  const ctx = useContext(ContextePortfolio)
  if (!ctx) throw new Error('usePortfolio doit être utilisé dans <Portfolio>')
  return ctx
}

// Variables CSS du thème, posées sur #pf-wrap. Les sections n'utilisent que
// ces variables : le mode clair/sombre et les 8 thèmes suivent sans code.
export function variablesTheme(eff, isLight) {
  const a = eff.accent
  const aRgb = eff.accentRgb
  const av = eff.accentVif || a
  const avRgb = eff.accentVifRgb || aRgb
  return {
    '--a': a,
    '--a-rgb': aRgb,
    '--av': av,
    '--av-rgb': avRgb,
    // texte en accent atténué, lisible dans les deux modes
    '--a-doux': `rgba(${aRgb},${isLight ? 0.86 : 0.6})`,
    '--fond': eff.fond,
    '--fond-2': eff.fondSecondaire || eff.fond,
    '--texte': eff.texte,
    '--t1': eff.textHigh,
    '--t2': eff.textMedium,
    '--t3': eff.textMuted,
    '--t4': eff.textFaint,
    '--bord': eff.borderStrong,
    '--bord-2': eff.borderMedium,
    '--bord-3': eff.borderLight,
    '--carte': eff.cardBg,
    '--verre': eff.glassOverlay,
    '--nav': eff.navOverlay,
    '--ombre': eff.shadow,
    // « encre » : boutons pleins contrastés
    '--encre': isLight ? '#111318' : '#f2f0ec',
    '--sur-encre': isLight ? '#f7f7f4' : '#0a0a0a',
    '--sur-a': isLight ? '#ffffff' : '#050505',
    // scène nocturne des projets : toujours sombre
    '--nuit': isLight ? '#0b0f17' : '#050608',
    '--nuit-2': isLight ? '#121826' : '#0b0d12',
  }
}
