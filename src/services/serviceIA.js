import OpenAI from 'openai'
import donneePortfolio from '@/donnees/portfolio.json'

// Groq est compatible avec le SDK OpenAI — même interface, endpoint différent
const clientGroq = new OpenAI({
  apiKey:  import.meta.env.VITE_GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true, // acceptable en dev — prévoir un proxy en prod
})

const MODELE = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant'

// ── Construction du prompt système ───────────────────────────────────────────
function construirePromptSysteme(prenomVisiteur, profilVisiteur) {
  const config = donneePortfolio.devjai_config
  const profil = config.visitor_profiles[profilVisiteur] || config.visitor_profiles.curious

  // Projets formatés en texte clair — pas de JSON
  const projetsTexte = donneePortfolio.projects.map(p =>
    `Projet ${p.number} : ${p.name} — ${p.category}. ${p.description} Technologies : ${(p.technologies || []).join(', ')}. Lien : ${p.links?.live || 'non publié'}.`
  ).join('\n')

  const servicesTexte = donneePortfolio.services.map(s =>
    `${s.name} : ${s.price}, délai ${s.delivery}.`
  ).join('\n')

  return `
Tu es devJAI, l'assistant IA du portfolio de Frejus Kouadio, développeur frontend basé à Yamoussoukro en Côte d'Ivoire.

LISTE EXACTE ET COMPLÈTE DES 6 PROJETS DE FREJUS — NE JAMAIS INVENTER D'AUTRES PROJETS :
${projetsTexte}

SERVICES :
${servicesTexte}

CONTACT : Email devfred58@gmail.com — WhatsApp +225 0767998373 — GitHub github.com/devj-58

VISITEUR : ${prenomVisiteur} — Profil : ${profil.label}

RÈGLES ABSOLUES :
- Tu ne parles QUE des projets listés ci-dessus. Eliko est une agence de voyage, pas une application médicale.
- Jamais de markdown, jamais d'astérisques, jamais de tirets de liste.
- Prose naturelle, 2 à 3 phrases maximum.
- Si on te demande les projets, cite-les par leur vrai nom et leur vraie catégorie.
- Tu ne réponds qu'aux questions sur le portfolio de Frejus.
`.trim()
}

// ── Détection automatique de la section à afficher ───────────────────────────
export function detecterSection(texteReponse) {
  const map = [
    { mots: ['projet', 'réalisation', 'travaux', 'eliko', 'santeai', 'uiya', 'gsb', 'zikmu'], section: 'projects' },
    { mots: ['compétence', 'skill', 'technologie', 'stack', 'react', 'javascript', 'php'], section: 'skills' },
    { mots: ['service', 'tarif', 'prix', 'offre', 'devis', 'vitrine', 'ecommerce'], section: 'services' },
    { mots: ['contact', 'joindre', 'email', 'whatsapp', 'téléphone', 'appeler'], section: 'contact' },
    { mots: ['méthode', 'process', 'étape', 'comment travaille', 'workflow'], section: 'methodology' },
    { mots: ['qui', 'présente', 'frejus', 'about', 'à propos', 'parcours', 'formation'], section: 'about' },
    { mots: ['accueil', 'début', 'portfolio', 'hero'], section: 'hero' },
  ]
  const texte = texteReponse.toLowerCase()
  for (const { mots, section } of map) {
    if (mots.some(m => texte.includes(m))) return section
  }
  return null
}

// ── Appel principal à l'API Groq ─────────────────────────────────────────────
export async function interrogerDevJAI({
  prenomVisiteur,
  profilVisiteur,
  historiqueConversation,
  messageUtilisateur,
}) {
  const promptSysteme = construirePromptSysteme(prenomVisiteur, profilVisiteur)

  // Reformater l'historique : notre prop "contenu" → prop "content" attendu par l'API
  const messagesFormates = historiqueConversation.map((msg) => ({
    role:    msg.role,
    content: msg.contenu,
  }))

  const reponse = await clientGroq.chat.completions.create({
    model: MODELE,
    messages: [
      { role: 'system', content: promptSysteme },
      ...messagesFormates,
      { role: 'user',   content: messageUtilisateur },
    ],
    temperature: 0.1,
    max_tokens:  800,
  })

  let reponseFinale = reponse.choices[0].message.content

  // Vérification anti-hallucination sur Eliko
  if (
    reponseFinale.toLowerCase().includes('eliko') &&
    (reponseFinale.toLowerCase().includes('médical') ||
     reponseFinale.toLowerCase().includes('santé') ||
     reponseFinale.toLowerCase().includes('gestion médicale'))
  ) {
    reponseFinale = reponseFinale
      .replace(/application de gestion médicale/gi, 'agence de voyage')
      .replace(/gestion médicale/gi, 'agence de voyage')
      .replace(/médical/gi, 'voyage')
  }

  return reponseFinale
}

// ── Message d'accueil initial (instantané, pas d'appel API) ──────────────────
export function obtenirMessageAccueil(prenomVisiteur, profilVisiteur) {
  const config   = donneePortfolio.devjai_config
  const template = config.greeting_templates[profilVisiteur] || config.greeting_templates.curious
  return template.replace('{name}', prenomVisiteur)
}