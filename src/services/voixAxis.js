// Voix d'AXIS. Ordre d'essai :
//   1. la voix ElevenLabs, via la fonction serveur /api/voix (la clé reste côté serveur)
//   2. la synthèse vocale du navigateur
//   3. en silence : la bouche suit le texte le temps qu'il faudrait pour le dire
// La bouche de l'avatar est pilotée par definirAxisParle (texte) et
// signalerPositionVoix (position de la voix dans ce texte).
import utiliserStore from '@/store/utiliserStore'
import { dureeParole } from '@/composants/ui/axis/visemes'
import { signalerPositionVoix } from '@/composants/ui/axis/canalParole'

const MAX_CARACTERES = 1000
const cache = new Map() // texte → { url, alignement } ; évite de repayer une phrase déjà dite
let elevenDisponible = true // passe à false si le serveur n'a pas de voix configurée
let arretCourant = null

export function nettoyerPourVoix(texte) {
  return String(texte || '')
    .replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/[-*•]\s/g, '')
    .replace(/\n{2,}/g, '. ').replace(/\n/g, ', ').replace(/\s{2,}/g, ' ').trim()
}

function base64VersUrl(b64) {
  const bin = atob(b64)
  const octets = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i)
  return URL.createObjectURL(new Blob([octets], { type: 'audio/mpeg' }))
}

async function obtenirAudio(texte, signal) {
  if (cache.has(texte)) return cache.get(texte)
  const r = await fetch('/api/voix', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texte }), signal,
  })
  // Fonction absente (serveur local Vite), voix non configurée ou crédits épuisés :
  // on n'insiste plus pendant cette visite
  if ([403, 404, 405, 502, 503].includes(r.status)) elevenDisponible = false
  if (!r.ok) throw new Error(`voix ${r.status}`)
  const type = r.headers.get('content-type') || ''
  if (!type.includes('json')) { elevenDisponible = false; throw new Error('voix indisponible') }
  const d = await r.json()
  if (!d.audio) throw new Error('voix vide')
  const entree = { url: base64VersUrl(d.audio), alignement: d.alignement }
  cache.set(texte, entree)
  if (cache.size > 30) {
    const [premier] = cache.keys()
    URL.revokeObjectURL(cache.get(premier).url)
    cache.delete(premier)
  }
  return entree
}

// ── Voix du navigateur (secours)
function choisirVoixNavigateur(synthese) {
  const voix = synthese.getVoices()
  const priorite = [
    (v) => v.lang.startsWith('fr') && /thomas|nicolas|paul/i.test(v.name),
    (v) => v.lang === 'fr-FR' && v.name.includes('Google'),
    (v) => v.lang === 'fr-FR' && !/amelie|marie|alice|stephanie/i.test(v.name),
    (v) => v.lang.startsWith('fr'),
  ]
  for (const test of priorite) { const v = voix.find(test); if (v) return v }
  return null
}

/**
 * Fait parler AXIS. Renvoie une fonction qui coupe la parole.
 * options : vocal (false = bouche en silence), surDebut(), surFin()
 */
export function parlerAxis(texteBrut, { vocal = true, surDebut, surFin } = {}) {
  arretCourant?.()
  const { definirAxisParle } = utiliserStore.getState()
  const texte = nettoyerPourVoix(texteBrut)
  let actif = true
  let fini = false
  const nettoyages = []
  const plusTard = (fn, ms) => { const t = setTimeout(fn, ms); nettoyages.push(() => clearTimeout(t)) }

  const terminer = () => {
    if (fini) return
    fini = true
    definirAxisParle(false)
    surFin?.()
  }
  const commencer = (texteBouche) => {
    definirAxisParle(true, texteBouche)
    surDebut?.()
  }
  const enSilence = () => {
    if (!actif) return
    commencer(texte)
    plusTard(() => { if (actif) terminer() }, dureeParole(texte) * 1000)
  }

  const arreter = () => {
    if (!actif) return
    actif = false
    nettoyages.forEach((fn) => fn())
    if (arretCourant === arreter) arretCourant = null
    if (!fini) { fini = true; definirAxisParle(false) }
  }
  arretCourant = arreter

  if (!texte) { terminer(); return arreter }
  if (!vocal || typeof window === 'undefined') { enSilence(); return arreter }

  // ── 2. Voix du navigateur, découpée en phrases
  const voixNavigateur = () => {
    const synthese = window.speechSynthesis
    if (!actif) return
    if (!synthese) { enSilence(); return }
    synthese.cancel()
    nettoyages.push(() => synthese.cancel())
    const voixTexte = texte.replace(/Fréjus/gi, 'Fréjusse').replace(/Frejus/gi, 'Fréjusse')
    const segments = voixTexte.split(/(?<=[.!?])\s+/).filter((x) => x.trim())
    let curseur = 0
    const debuts = segments.map((seg) => { const pos = voixTexte.indexOf(seg, curseur); curseur = (pos >= 0 ? pos : curseur) + seg.length; return pos >= 0 ? pos : curseur - seg.length })
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    let idx = 0
    let entendu = false

    const parlerSegment = (voixChoisie) => {
      if (!actif) return
      if (idx >= segments.length) { terminer(); return }
      const seg = new SpeechSynthesisUtterance(segments[idx])
      if (voixChoisie) seg.voice = voixChoisie
      seg.lang = 'fr-FR'; seg.pitch = 0.82; seg.rate = isIOS ? 0.88 : 0.92; seg.volume = 1
      const debut = debuts[idx], fin = debut + segments[idx].length
      seg.onstart = () => { if (!actif) return; entendu = true; signalerPositionVoix(debut, fin) }
      seg.onboundary = (ev) => { if (actif && ev.charIndex != null) signalerPositionVoix(debut + ev.charIndex, fin) }
      seg.onend = () => { if (!actif) return; idx += 1; plusTard(() => parlerSegment(voixChoisie), isIOS ? 200 : 120) }
      seg.onerror = (e) => {
        if (!actif) return
        console.warn('[voix]', e.error)
        if (!entendu) { entendu = true; synthese.cancel(); definirAxisParle(false); enSilence(); return }
        idx += 1; plusTard(() => parlerSegment(voixChoisie), 200)
      }
      synthese.speak(seg)
    }

    const demarrer = () => {
      if (!actif) return
      commencer(voixTexte)
      if (!isIOS && !('ontouchstart' in window)) {
        const keepAlive = setInterval(() => { synthese.pause(); synthese.resume() }, 10000)
        nettoyages.push(() => clearInterval(keepAlive))
      }
      parlerSegment(choisirVoixNavigateur(synthese))
      // Si la voix ne démarre jamais, la bouche parle en silence
      plusTard(() => { if (actif && !entendu) { synthese.cancel(); definirAxisParle(false); enSilence() } }, 2500)
    }

    let demarre = false
    const go = () => { if (demarre || !actif) return; demarre = true; synthese.onvoiceschanged = null; demarrer() }
    nettoyages.push(() => { synthese.onvoiceschanged = null })
    // Petit délai après cancel() : Chrome ignore parfois une parole lancée aussitôt
    plusTard(() => {
      if (synthese.getVoices().length > 0) go()
      else { synthese.onvoiceschanged = go; plusTard(go, 1000) }
    }, 80)
  }

  // ── 1. Voix ElevenLabs
  if (!elevenDisponible || texte.length > MAX_CARACTERES) { voixNavigateur(); return arreter }

  const controleur = new AbortController()
  nettoyages.push(() => controleur.abort())
  plusTard(() => controleur.abort(), 12000) // réseau trop lent : on passe à la voix du navigateur

  obtenirAudio(texte, controleur.signal)
    .then(({ url, alignement }) => {
      if (!actif) return
      const audio = new Audio(url)
      const lettres = alignement?.caracteres
      const debutsLettres = alignement?.debuts
      const texteBouche = lettres?.length ? lettres.join('') : texte
      let suivi = null
      nettoyages.push(() => { audio.pause(); audio.src = ''; if (suivi) clearInterval(suivi) })

      audio.onended = () => { if (!actif) return; if (suivi) clearInterval(suivi); terminer() }
      audio.onerror = () => { if (!actif) return; if (suivi) clearInterval(suivi); definirAxisParle(false); voixNavigateur() }

      audio.play().then(() => {
        if (!actif) return
        commencer(texteBouche)
        if (!debutsLettres?.length) return
        // La bouche suit la voix mot par mot, d'après les temps de chaque lettre
        let i = 0, motSignale = -1
        const n = debutsLettres.length
        suivi = setInterval(() => {
          const t = audio.currentTime
          while (i < n - 1 && debutsLettres[i + 1] <= t) i++
          let debutMot = i
          while (debutMot > 0 && texteBouche[debutMot - 1] !== ' ') debutMot--
          if (debutMot === motSignale) return
          motSignale = debutMot
          // limite : fin du mot suivant, pour que la bouche ne prenne pas d'avance
          let fin = texteBouche.indexOf(' ', i)
          fin = fin < 0 ? n : texteBouche.indexOf(' ', fin + 1)
          signalerPositionVoix(debutMot, fin < 0 ? n : fin)
        }, 50)
      }).catch(() => {
        // Lecture refusée (aucune interaction encore sur la page) : la bouche parle en silence
        if (actif) enSilence()
      })
    })
    .catch(() => { if (actif) voixNavigateur() })

  return arreter
}

// Coupe toute parole en cours (en quittant une page, par exemple)
export function faireTaireAxis() {
  arretCourant?.()
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
}
