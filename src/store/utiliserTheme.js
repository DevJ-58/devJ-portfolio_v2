import { create } from 'zustand'
import themes from '@/donnees/themes'

const utiliserTheme = create((set) => ({
  themeActif: 'vert',
  theme: themes.vert,
  changerTheme: (id) => set({
    themeActif: id,
    theme: themes[id]
  }),
}))

export default utiliserTheme
