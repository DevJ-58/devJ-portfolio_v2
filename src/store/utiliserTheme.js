import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import themes from '@/donnees/themes'

const themesArray = Object.values(themes)

const utiliserTheme = create(
  persist(
    (set, get) => ({
      themes: themesArray,
      theme: themes['vert'], // thème par défaut

      changerTheme: (id) => {
        const t = themes[id]
        if (!t) return
        set({ theme: t })
      },

      themeActuelId: () => get().theme.id,
    }),
    {
      name: 'devj-theme', // clé localStorage
      partialize: (state) => ({ theme: state.theme }), // persister uniquement le thème
    }
  )
)

export default utiliserTheme
