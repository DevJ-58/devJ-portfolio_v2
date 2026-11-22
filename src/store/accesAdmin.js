import { create } from 'zustand'

// Ouverture de l'espace admin : jamais persistée, jamais liée à une URL.
// Seuls le raccourci Ctrl + F-R-E-J-U-S (bureau) et 5 touches sur l'avatar
// AXIS (/experience) l'ouvrent.
const accesAdmin = create((definir) => ({
  ouvert: false,
  ouvrir: () => definir({ ouvert: true }),
  fermer: () => definir({ ouvert: false }),
}))

export default accesAdmin
