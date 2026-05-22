import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import themes from '@/donnees/themes'

const themesArray = Object.values(themes)

const utiliserTheme = create(
  persist(
    (set, get) => ({
      themes: themesArray,
      theme: themes['vert'], // thème par défaut
      mode: 'dark',

      setTheme: (t) => {
        if (!t) return
        set({ theme: t })
      },

      changerTheme: (id) => {
        const t = themes[id]
        if (!t) return
        set({ theme: t })
      },

      setMode: (m) => {
        if (!m) return
        set({ mode: m })
      },

      toggleMode: (target) => {
        set((state) => {
          const newMode = target || (state.mode === 'dark' ? 'light' : 'dark')
          return { mode: newMode }
        })
      },

      // Retourne un thème effectif enrichi selon le mode (dark / light)
      getThemeEffectif: () => {
        const { theme, mode } = get()
        const isLight = mode === 'light'

        const effective = {
          id: theme.id,
          label: theme.label,
          nom: theme.nom,
          accent: theme.accent,
          accentFonce: theme.accentFonce,
          accentRgb: theme.accentRgb,
          // fonds
          fond: isLight ? '#d8dce5' : theme.fond,
          fondPage: isLight ? '#cdd2dc' : theme.fondPage,
          fondSecondaire: isLight ? '#cdd2dc' : theme.fondSecondaire,
          // texte principal
          texte: isLight ? '#0f172a' : theme.texte,
          // grille (conserve le pattern du thème)
          grille: theme.grille,
          // couleurs utilitaires pour les niveaux de texte en mode light
          textHigh: isLight ? '#1e293b' : 'rgba(255,255,255,0.85)',
          textMedium: isLight ? '#334155' : 'rgba(255,255,255,0.7)',
          textMuted: isLight ? '#64748b' : 'rgba(255,255,255,0.5)',
          textFaint: isLight ? '#94a3b8' : 'rgba(255,255,255,0.35)',
          textUltraFaint: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.15)',
          // borders
          borderStrong: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.1)',
          borderMedium: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)',
          borderLight: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.04)',
          // cards / glass
          cardBg: isLight ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.03)',
          glassOverlay: isLight ? 'rgba(232,235,241,0.92)' : 'rgba(5,5,5,0.85)',
          navOverlay: isLight ? 'rgba(228,231,238,0.95)' : 'rgba(5,5,5,0.85)',
          // shadows
          shadow: isLight ? 'rgba(15,23,42,0.15)' : 'rgba(0,0,0,0.5)',
        }

        return { ...theme, ...effective }
      },

      themeActuelId: () => get().theme.id,
    }),
    {
      name: 'devj-theme', // clé localStorage
      partialize: (state) => ({ theme: state.theme, mode: state.mode }), // persister thème + mode
    }
  )
)

export default utiliserTheme
