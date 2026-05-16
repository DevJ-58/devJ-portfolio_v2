import { useEffect, useCallback } from 'react'
import utiliserStore from '@/store/utiliserStore'
import { interrogerAxis, obtenirMessageAccueil, detecterSection } from '@/services/serviceIA'
import { useVoix } from './utiliserVoix'

// Hook principal renommé pour utiliser AXIS au lieu de l'ancien nom devJAI
export function utiliserAxis() {
  const {
    visiteur, devjai,
    ajouterMessage, definirMessageCourant,
    definirAxisParle, definirAxisCharge,
    definirSectionActive,
  } = utiliserStore()

  const { arreterParole, estEnEcoute, transcription, demarrerEcoute, arreterEcoute } =
    useVoix()

  // ── Message de bienvenue au chargement de la page ─────
  useEffect(() => {
    async function lancerAccueil() {
      const message = obtenirMessageAccueil(visiteur.prenom, visiteur.profession)
      ajouterMessage('assistant', message)
      definirMessageCourant(message)
      definirAxisParle(false)
    }
    if (visiteur.prenom) lancerAccueil()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Envoi d'un message à Groq ─────────────────────────
  const envoyerMessage = useCallback(async (texteUtilisateur) => {
    if (!texteUtilisateur.trim()) return

    ajouterMessage('user', texteUtilisateur)
    definirAxisCharge(true)
    arreterParole()

    try {
      const reponse = await interrogerAxis({
        prenomVisiteur:        visiteur.prenom,
        profilVisiteur:        visiteur.profession,
        historiqueConversation: devjai.historiqueConversation,
        messageUtilisateur:    texteUtilisateur,
      })

      ajouterMessage('assistant', reponse)
      definirMessageCourant(reponse)

      // Navigation automatique selon le contenu de la réponse
      const sectionDetectee = detecterSection(reponse)
      if (sectionDetectee) definirSectionActive(sectionDetectee)

      definirAxisParle(false)

    } catch (erreur) {
      console.error('Erreur AXIS :', erreur)
      const messageErreur = "Je rencontre une difficulté technique. Pourriez-vous reformuler votre question ?"
      ajouterMessage('assistant', messageErreur)
      definirMessageCourant(messageErreur)
    } finally {
      try { definirAxisCharge(false) } catch { /* ignore */ }
    }
  }, [visiteur, devjai.historiqueConversation]) // eslint-disable-line

  // ── Envoi automatique quand le visiteur a parlé ────────
  useEffect(() => {
    if (transcription) envoyerMessage(transcription)
  }, [transcription]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    envoyerMessage,
    estEnEcoute,
    demarrerEcoute,
    arreterEcoute,
    estEnTrain:      devjai.estEnTrain,
    estEnChargement: devjai.estEnChargement,
    messageCourant:  devjai.messageCourant,
    historique:      devjai.historiqueConversation,
  }
}