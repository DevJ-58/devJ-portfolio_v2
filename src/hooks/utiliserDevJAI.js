import { useEffect, useCallback, useRef } from 'react'
import utiliserStore from '@/store/utiliserStore'
import { interrogerAxis, obtenirMessageAccueil, detecterSection } from '@/services/serviceIA'
import { useVoix } from './utiliserVoix'
import { db } from '@/services/firebase'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'

// Hook principal renommé pour utiliser AXIS au lieu de l'ancien nom devJAI
export function useAxis() {
  const {
    visiteur, devjai,
    ajouterMessage, definirMessageCourant,
    definirAxisParle, definirAxisCharge,
    definirSectionActive,
  } = utiliserStore()
  // Référence à la session Firestore en cours
  const sessionIdRef = useRef(null)
  const sessionStartRef = useRef(null)

  const { arreterParole, estEnEcoute, transcription, demarrerEcoute, arreterEcoute } =
    useVoix()

  // ── Message de bienvenue au chargement de la page ─────
  useEffect(() => {
    async function lancerAccueil() {
      const message = obtenirMessageAccueil(visiteur.prenom, visiteur.profession)
      ajouterMessage('assistant', message)
      definirMessageCourant(message)
      definirAxisParle(false)

      // Créer la session dans Firestore au démarrage
      try {
        const docRef = await addDoc(collection(db, 'sessions_axis'), {
          created_at: serverTimestamp(),
          prenom_visiteur: visiteur.prenom,
          profil_visiteur: visiteur.profession,
          historique: [],
          nb_messages: 0,
          duree_secondes: 0,
          demande_contact: false,
          demande_cv: false,
          sections_visitees: [],
        })
        sessionIdRef.current = docRef.id
        sessionStartRef.current = Date.now()
      } catch (e) {
        console.warn('[Firebase] Erreur création session:', e)
      }
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

      // Mettre à jour la session Firestore après chaque échange
      if (sessionIdRef.current) {
        try {
          const duree = Math.floor((Date.now() - sessionStartRef.current) / 1000)
          const demandeContact = reponse.toLowerCase().includes('contact')
            || texteUtilisateur.toLowerCase().includes('contact')
            || texteUtilisateur.toLowerCase().includes('whatsapp')
          const demandeCv = reponse.toLowerCase().includes('cv')
            || texteUtilisateur.toLowerCase().includes('cv')

          await updateDoc(doc(db, 'sessions_axis', sessionIdRef.current), {
            historique: devjai.historiqueConversation,
            nb_messages: devjai.historiqueConversation.length + 2,
            duree_secondes: duree,
            demande_contact: demandeContact,
            demande_cv: demandeCv,
          })
        } catch (e) {
          console.warn('[Firebase] Erreur mise à jour session:', e)
        }
      }

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