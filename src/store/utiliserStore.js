import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const utiliserStore = create(
  persist(
    (definir) => ({

  // ── Données du visiteur ──────────────────────────────────────────
  visiteur: {
    prenom:       '',
    profession:   '',   // 'recruteur' | 'client' | 'collaborateur' | 'curieux'
    microActif:   false,
    langue:       'fr',
  },
  definirVisiteur: (donnees) =>
    definir((etat) => ({ visiteur: { ...etat.visiteur, ...donnees } })),

  // ── État de AXIS (nom logique conservé pour les données internes)
  devjai: {
    estActif:          false,
    estEnTrain:        false,   // parle en ce moment
    estEcoutant:       false,   // écoute le micro
    estEnChargement:   false,   // attend la réponse de l'API
    messageCourant:    '',
    historiqueConversation: [],  // [{ role: 'user'|'assistant', contenu: string }]
  },
  definirAxisParle:    (valeur) => definir((e) => ({ devjai: { ...e.devjai, estEnTrain: valeur } })),
  definirAxisEcoute:   (valeur) => definir((e) => ({ devjai: { ...e.devjai, estEcoutant: valeur } })),
  definirAxisCharge:   (valeur) => definir((e) => ({ devjai: { ...e.devjai, estEnChargement: valeur } })),
  definirMessageCourant: (msg)    => definir((e) => ({ devjai: { ...e.devjai, messageCourant: msg } })),
  ajouterMessage: (role, contenu) =>
    definir((e) => ({
      devjai: {
        ...e.devjai,
        historiqueConversation: [
          ...e.devjai.historiqueConversation,
          { role, contenu }
        ],
      },
    })),

  // ── Navigation portfolio ──────────────────────────────────────────
  portfolio: {
    sectionActive:      'hero',
    estEnTransition:    false,
  },
  definirSectionActive: (section) =>
    definir((e) => ({ portfolio: { ...e.portfolio, sectionActive: section } })),
  definirEnTransition:  (valeur) =>
    definir((e) => ({ portfolio: { ...e.portfolio, estEnTransition: valeur } })),
    }),
    {
      name: 'devj-visiteur',
      partialize: (state) => ({ visiteur: state.visiteur }),
      // Ne persister que visiteur, pas les états temporaires
    }
  )
)

export default utiliserStore