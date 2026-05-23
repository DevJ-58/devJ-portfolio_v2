import { useEffect, useCallback, useRef } from 'react'
import utiliserStore from '@/store/utiliserStore'
import { interrogerAxis, obtenirMessageAccueil, detecterSection } from '@/services/serviceIA'
import { useVoix } from './utiliserVoix'
// Écriture Firestore via REST HTTP — évite le blocage WebChannel
const FIREBASE_PROJECT = import.meta.env.VITE_FIREBASE_PROJECT_ID
const FIREBASE_KEY = import.meta.env.VITE_FIREBASE_API_KEY
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`

async function creerSessionREST(data) {
  try {
    const res = await fetch(`${FIRESTORE_BASE}/sessions_axis?key=${FIREBASE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          prenom_visiteur:  { stringValue: data.prenom_visiteur },
          profil_visiteur:  { stringValue: data.profil_visiteur },
          nb_messages:      { integerValue: 0 },
          duree_secondes:   { integerValue: 0 },
          demande_contact:  { booleanValue: false },
          demande_cv:       { booleanValue: false },
          historique:       { arrayValue: { values: [] } },
          created_at:       { stringValue: new Date().toISOString() },
        }
      })
    })
    const json = await res.json()
    const parts = json.name?.split('/')
    return parts?.[parts.length - 1] || null
  } catch (e) {
    console.warn('[Firebase REST] Erreur création session:', e)
    return null
  }
}

async function mettreAJourSessionREST(sessionId, data) {
  if (!sessionId) return
  try {
    const valeursHistorique = (data.historique || []).map(msg => ({
      mapValue: {
        fields: {
          role:    { stringValue: msg.role || '' },
          contenu: { stringValue: msg.contenu || '' },
        }
      }
    }))

    await fetch(
      `${FIRESTORE_BASE}/sessions_axis/${sessionId}?key=${FIREBASE_KEY}&updateMask.fieldPaths=nb_messages&updateMask.fieldPaths=duree_secondes&updateMask.fieldPaths=demande_contact&updateMask.fieldPaths=demande_cv&updateMask.fieldPaths=historique`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            nb_messages:     { integerValue: data.nb_messages },
            duree_secondes:  { integerValue: data.duree_secondes },
            demande_contact: { booleanValue: data.demande_contact },
            demande_cv:      { booleanValue: data.demande_cv },
            historique:      { arrayValue: { values: valeursHistorique } },
          }
        })
      }
    )
  } catch (e) {
    console.warn('[Firebase REST] Erreur mise à jour session:', e)
  }
}

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

      // Créer la session via REST — contourne le blocage WebChannel
      try {
        const sessionId = await creerSessionREST({
          prenom_visiteur: visiteur.prenom,
          profil_visiteur: visiteur.profession,
        })
        sessionIdRef.current = sessionId
        sessionStartRef.current = Date.now()
      } catch (e) {
        console.warn('[Firebase REST] Erreur création session:', e)
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

      // Mettre à jour la session via REST
      if (sessionIdRef.current) {
        try {
          const duree = Math.floor((Date.now() - sessionStartRef.current) / 1000)
          const demandeContact = reponse.toLowerCase().includes('contact')
            || texteUtilisateur.toLowerCase().includes('contact')
            || texteUtilisateur.toLowerCase().includes('whatsapp')
          const demandeCv = reponse.toLowerCase().includes('cv')
            || texteUtilisateur.toLowerCase().includes('cv')

          await mettreAJourSessionREST(sessionIdRef.current, {
            nb_messages: devjai.historiqueConversation.length + 2,
            duree_secondes: duree,
            demande_contact: demandeContact,
            demande_cv: demandeCv,
            historique: devjai.historiqueConversation,
          })
        } catch (e) {
          console.warn('[Firebase REST] Erreur mise à jour session:', e)
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