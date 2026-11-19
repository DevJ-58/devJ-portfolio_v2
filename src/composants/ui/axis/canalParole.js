// Petit canal d'événements entre la synthèse vocale (Experience.jsx) et
// l'avatar : il transmet la position de la voix dans le texte, mot par mot.
// Volontairement hors du store Zustand, pour ne pas réafficher la page à
// chaque mot prononcé.

const abonnes = new Set()

// debut = position (en caractères) atteinte par la voix
// fin   = fin du segment en cours ; la bouche attend la voix à cette limite
export function signalerPositionVoix(debut, fin) {
  abonnes.forEach((fn) => fn({ debut, fin }))
}

export function ecouterPositionVoix(fn) {
  abonnes.add(fn)
  return () => abonnes.delete(fn)
}
