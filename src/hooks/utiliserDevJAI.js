import { useEffect, useCallback } from 'react'
import utiliserStore from '@/store/utiliserStore'
import { interrogerDevJAI, obtenirMessageAccueil, detecterSection } from '@/services/serviceIA'
import { useVoix } from './utiliserVoix'

export function useDevJAI() {
  const {
    visiteur, devjai,
    ajouterMessage, definirMessageCourant,
    definirDevJAIParle, definirDevJAICharge,
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
      definirDevJAIParle(false)
    }
    if (visiteur.prenom) lancerAccueil()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Envoi d'un message à Groq ─────────────────────────
  const envoyerMessage = useCallback(async (texteUtilisateur) => {
    if (!texteUtilisateur.trim()) return

    ajouterMessage('user', texteUtilisateur)
    definirDevJAICharge(true)
    arreterParole()

    try {
      const reponse = await interrogerDevJAI({
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

      definirDevJAIParle(false)

    } catch (erreur) {
      console.error('Erreur devJAI :', erreur)
      const messageErreur = "Je rencontre une difficulté technique. Pourriez-vous reformuler votre question ?"
      ajouterMessage('assistant', messageErreur)
      definirMessageCourant(messageErreur)
    } finally {
      try { definirDevJAICharge(false) } catch { /* ignore */ }
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