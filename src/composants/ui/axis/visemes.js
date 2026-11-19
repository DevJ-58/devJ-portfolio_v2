// Transforme un texte en une suite de formes de bouche (visèmes) dans le temps.
// Sans dépendance à three : Experience.jsx l'utilise aussi pour connaître la
// durée de parole quand la voix est coupée.

const SEC_PAR_LETTRE = 0.072
const SEC_ESPACE = 0.05
const SEC_FIN_PHRASE = 0.42
const SEC_PAUSE = 0.22

// Forme de bouche associée à un caractère
function viseme(c) {
  c = c.toLowerCase()
  if ('aàâ'.includes(c)) return { jaw: 0.9, wide: 0.12 }
  if ('eéèêë'.includes(c)) return { jaw: 0.5, wide: 0.55 }
  if ('iîïy'.includes(c)) return { jaw: 0.28, wide: 0.85 }
  if ('oô'.includes(c)) return { jaw: 0.62, round: 0.75 }
  if ('uùû'.includes(c)) return { jaw: 0.25, round: 0.95 }
  if ('mbp'.includes(c)) return { press: 1 }
  if ('fv'.includes(c)) return { jaw: 0.1, press: 0.4 }
  if (c === ' ') return { jaw: 0.06 }
  if (/[.,!?;:…]/.test(c)) return {}
  return { jaw: 0.32, wide: 0.1 }
}

// Retourne { ev, dur } : ev = [{ t, i, v?, word?, emph?, end?, pause? }]
// t en secondes, i = position du caractère dans le texte.
export function construireTimeline(texte) {
  const ev = []
  let t = 0, ci = 0
  for (const mot of String(texte || '').split(/(\s+)/)) {
    if (!mot) continue
    if (/^\s+$/.test(mot)) {
      ev.push({ t, i: ci, v: viseme(' ') })
      t += SEC_ESPACE
      ci += mot.length
      continue
    }
    const propre = mot.replace(/[^a-zA-Zàâéèêëîïôùûüç]/g, '')
    ev.push({ t, i: ci, word: true, emph: propre.length >= 6 })
    for (let k = 0; k < mot.length; k++) {
      const c = mot[k]
      if (/[.!?]/.test(c)) { ev.push({ t, i: ci + k, v: {}, end: c }); t += SEC_FIN_PHRASE }
      else if (/[,;:]/.test(c)) { ev.push({ t, i: ci + k, v: {}, pause: true }); t += SEC_PAUSE }
      else { ev.push({ t, i: ci + k, v: viseme(c) }); t += SEC_PAR_LETTRE }
    }
    ci += mot.length
  }
  return { ev, dur: t + 0.3 }
}

// Durée estimée (en secondes) pour « dire » le texte sans voix
export function dureeParole(texte) {
  return construireTimeline(texte).dur
}
