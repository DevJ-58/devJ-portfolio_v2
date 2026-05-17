import { create } from 'zustand'
import themes from '@/donnees/themes'

const utiliserTheme = create((set) => ({
  themeActif: 'blanc',
  theme: themes.blanc,
  themes: Object.values(themes),
  changerTheme: (id) => set({
    themeActif: id,
    theme: themes[id]
  }),
}))

export default utiliserTheme
