import { useState, useRef, useCallback } from 'react'

export function useVoix() {
  const [estEnEcoute,  definirEcoute]     = useState(false)
  const [transcription, definirTranscription] = useState('')
  const refReconnaissance = useRef(null)
  const refSynthese       = useRef(window.speechSynthesis)

  // ── Démarrage de la reconnaissance vocale ──────────────
  const demarrerEcoute = useCallback(() => {
    const RecVocale = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!RecVocale) {
      console.warn('Reconnaissance vocale non supportée sur ce navigateur.')
      return
    }

    const reconnaissance = new RecVocale()
    reconnaissance.lang           = 'fr-FR'
    reconnaissance.continuous     = false
    reconnaissance.interimResults = false

    reconnaissance.onstart  = () => definirEcoute(true)
    reconnaissance.onend    = () => definirEcoute(false)
    reconnaissance.onerror  = () => definirEcoute(false)
    reconnaissance.onresult = (evenement) => {
      const texte = evenement.results[0][0].transcript
      definirTranscription(texte)
    }

    refReconnaissance.current = reconnaissance
    reconnaissance.start()
  }, [])

  const arreterEcoute = useCallback(() => {
    refReconnaissance.current?.stop()
    definirEcoute(false)
  }, [])

  // ── Synthèse vocale (devJAI parle) ──────────────────────
  const parler = useCallback((texte, surFin) => {
    if (!refSynthese.current) return
    refSynthese.current.cancel() // Arrête toute lecture en cours

    const utterance   = new SpeechSynthesisUtterance(texte)
    utterance.lang    = 'fr-FR'
    utterance.rate    = 0.95
    utterance.pitch   = 1
    utterance.volume  = 1

    // Cherche une voix française de qualité (Google ou Microsoft)
    const voixDisponibles = refSynthese.current.getVoices()
    const voixFrancaise = voixDisponibles.find(
      (v) => v.lang.startsWith('fr') &&
             (v.name.includes('Google') || v.name.includes('Microsoft'))
    )
    if (voixFrancaise) utterance.voice = voixFrancaise

    utterance.onend = () => { if (surFin) surFin() }
    refSynthese.current.speak(utterance)
  }, [])

  const arreterParole = useCallback(() => {
    refSynthese.current?.cancel()
  }, [])

  return {
    estEnEcoute,
    transcription,
    demarrerEcoute,
    arreterEcoute,
    parler,
    arreterParole,
  }
}