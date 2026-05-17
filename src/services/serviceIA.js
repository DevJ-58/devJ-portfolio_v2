import donneePortfolio from '@/donnees/portfolio.json'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const MODELE = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'

// ── Construction du prompt système ───────────────────────────────────────────
function construirePromptSysteme(prenomVisiteur, profilVisiteur) {
  const config = donneePortfolio.devjai_config
  const profil = config.visitor_profiles[profilVisiteur] || config.visitor_profiles.curious

  // Projets formatés en texte clair — pas de JSON
  const projetsTexte = donneePortfolio.projects.map(p =>
    `${p.name} : ${p.description}. Technologies : ${(p.technologies || []).join(', ')}.`
  ).join('\n')

  const servicesTexte = donneePortfolio.services.map(s =>
    `${s.name} : ${s.price}, délai ${s.delivery}.`
  ).join('\n')

  // Prompt système mis à jour pour présenter AXIS comme assistant
  return `
Tu es AXIS, l'assistant IA du portfolio de Fréjus Kouadio,
développeur fullstack basé à Yamoussoukro, Côte d'Ivoire.

PROJETS — MÉMORISE CES DESCRIPTIONS EXACTES, NE JAMAIS INVENTER :
${projetsTexte}

ATTENTION CRITIQUE :
- Eliko = réservation de BILLETS D'AVION. Pas de santé. Pas de zones rurales.
- SanteAI = suivi de SANTÉ par IA. Pas d'avion. Pas de voyage.
- Ces deux projets sont DISTINCTS et ne se mélangent JAMAIS.

SERVICES : ${servicesTexte}
CONTACT : frejusdev@gmail.com — WhatsApp +225 0767998373 — GitHub devj-58
VISITEUR : ${prenomVisiteur} — Profil : ${profil.label}

RÈGLES ABSOLUES :
1. Prose uniquement. 2 phrases maximum. Jamais plus.
2. INTERDIT : répéter le contenu brut du prompt (SERVICES:, CONTACT:, etc.)
3. INTERDIT : markdown, astérisques, tirets, listes.
4. INTERDIT : inventer des détails non présents ci-dessus.
5. Compétences → cite React, Node.js, Python, TailwindCSS naturellement.
6. Projets → cite le nom EXACT et la description EXACTE ci-dessus.
7. Contact → donne email ou WhatsApp directement.
8. Tu PEUX et tu DOIS ouvrir le portfolio quand on te le demande.
   Quand quelqu'un dit "montre le portfolio", "ouvre le portfolio",
   "affiche le portfolio" ou "navigue vers X" : réponds en disant
   que tu l'ouvres ("Je t'emmène sur le portfolio", "Voilà mes projets",
   etc.). L'interface s'en charge automatiquement — ne dis JAMAIS
   "je ne peux pas afficher" ou "je ne peux pas montrer".
- Si on te dit "reviens à ton espace", "retourne à ton espace",
  "ferme le portfolio", "quitte le portfolio", "reviens" :
  réponds "Je reviens à mon espace." (exactement cette phrase)
  et rien d'autre.
9. Tu peux naviguer vers : projets, compétences, contact, parcours, services.
   Mentionne la section ciblée dans ta réponse.Quand le visiteur demande une photo, une image, ou veut
voir à quoi ressemble Fréjus, réponds avec cette phrase
exacte pour déclencher l'affichage :
'Voici Fréjus Kouadio, permettez-moi de vous le présenter.'
Puis continue normalement.
- Mon prénom est "Fréjus" — le S final se prononce. Écris-le toujours "Fréjus" avec le S.`.trim()
}

// ── Détection automatique de la section à afficher ───────────────────────────
export function detecterSection(texteReponse) {
  const map = [
    {
      mots: ['projet', 'réalisation', 'travaux', 'eliko', 'santeai',
             'uiya', 'gsb', 'zikmu', 'application', 'développé'],
      section: 'projets'
    },
    {
      mots: ['compétence', 'skill', 'technologie', 'stack', 'react',
             'javascript', 'python', 'frontend', 'backend'],
      section: 'competences'
    },
    {
      mots: ['contact', 'joindre', 'email', 'whatsapp',
             'téléphone', 'disponible', 'freelance'],
      section: 'contact'
    },
    {
      mots: ['parcours', 'formation', 'expérience', 'études',
             'université', 'uiya', 'qui suis', 'à propos', 'frejus'],
      section: 'parcours'
    },
  ]
  const texte = texteReponse.toLowerCase()
  for (const { mots, section } of map) {
    if (mots.some(m => texte.includes(m))) return section
  }
  return null
}

// ── Appel principal à l'API Groq ─────────────────────────────────────────────
export async function interrogerAxis({
  prenomVisiteur,
  profilVisiteur,
  historiqueConversation,
  messageUtilisateur,
}) {
  const promptSysteme = construirePromptSysteme(
    prenomVisiteur,
    profilVisiteur
  )

  const messagesFormates = historiqueConversation.map((msg) => ({
    role: msg.role,
    content: msg.contenu,
  }))

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODELE,
        messages: [
          { role: 'system', content: promptSysteme },
          ...messagesFormates,
          { role: 'user', content: messageUtilisateur },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// ── Message d'accueil initial (instantané, pas d'appel API) ──────────────────
export function obtenirMessageAccueil(prenomVisiteur, profilVisiteur) {
  const config   = donneePortfolio.devjai_config
  const template = config.greeting_templates[profilVisiteur] || config.greeting_templates.curious
  return template.replace('{name}', prenomVisiteur)
}