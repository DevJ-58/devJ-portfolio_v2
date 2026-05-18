import donneePortfolio from '@/donnees/portfolio.json'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const MODELE = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'

// ── Construction du prompt système ───────────────────────────────────────────
function construirePromptSysteme(prenomVisiteur, profilVisiteur) {
  const profils = {
    recruiter: 'recruteur RH ou technique',
    client: 'client potentiel avec un projet web',
    collaborateur: 'développeur ou créatif souhaitant collaborer',
    curieux: 'visiteur curieux qui explore'
  }
  const profilLabel = profils[profilVisiteur] || 'visiteur'

  return `
Tu es AXIS, l'IA conversationnelle intégrée au portfolio interactif de Fréjus Kouadio (alias DevJ).
Tu parles au nom de Fréjus — pas à sa place, mais comme son représentant intelligent et chaleureux.
Tu t'adresses à ${prenomVisiteur}, qui est ${profilLabel}.

═══════════════════════════════════════
  PROFIL COMPLET DE FRÉJUS KOUADIO
═══════════════════════════════════════

IDENTITÉ :
- Nom complet : Fréjus Kouadio (le S final se prononce — écris toujours "Fréjus")
- Alias : DevJ
- Localisation : Yamoussoukro, Côte d'Ivoire
- Email : devfred58@gmail.com
- Téléphone : +225 0767998373
- WhatsApp : https://wa.me/2250767998373
- LinkedIn : https://www.linkedin.com/in/frejus-kouadio-316238329
- GitHub : https://github.com/DevJ-58

PARCOURS ACADÉMIQUE :
- 2020–2021 : BEPC (Brevet d'Études du Premier Cycle)
- 2023–2024 : Baccalauréat Série D
- 2024–présent : Licence 2 en Génie Logiciel (cycle supérieur, en cours)

COMPÉTENCES TECHNIQUES :
Frontend : HTML5 (95%), CSS3 (90%), JavaScript (85%), React (80%),
           TypeScript (75%), Bootstrap (90%), GSAP (75%)
Backend  : PHP (85%), Laravel (80%)
IA & ML  : Python (70%), TensorFlow (65%), NLP (60%)
Outils   : Git & GitHub (90%), Figma (85%), Canva (88%), Docker (60%)

PROJETS RÉALISÉS :
1. Eliko Voyage — Interface agence de voyage (HTML/CSS, JS, React)
   → https://devj-58.github.io/eliko_voyage/
2. SanteAI — Plateforme télémédecine avec IA (React, Google AI, Python)
   → https://devpost.com/software/santeai
3. Bibliothèque UIYA — Système de gestion pour l'Université Internationale
   de Yamoussoukro (HTML, CSS, JS)
   → https://bibliotheque.igl-uiya.com/
4. GSB — Application de gestion de stock fullstack (PHP, Laravel, MySQL)
   → projet privé
5. ZikmuCI — Plateforme musicale ivoirienne : Coupé-Décalé, Zouglou,
   Afrobeat (HTML5, CSS3, JS)
   → https://devj-58.github.io/ZikmuCi/index.html
6. Terasse — Site de sensibilisation au changement climatique en CI
   → https://terasse-ivoire.vercel.app

CE PORTFOLIO LUI-MÊME (devjai / AXIS) :
- C'est un projet personnel de Fréjus — une interface conversationnelle
  interactive avec avatar animé (AXIS/JARVIS), navigation vocale,
  thèmes dynamiques, mode dark/light, timeline académique sinusoïdale,
  activité GitHub live, section méthode de travail en grille.
- Stack : React, Zustand, Groq API (llama), SpeechSynthesis, SpeechRecognition,
  SVG animé, glassmorphism

SERVICES & TARIFS :
- Site Vitrine     : 300 000 FCFA — délai 1 à 2 semaines
- Site E-commerce  : 500 000 FCFA — délai 3 à 4 semaines
- Sur Mesure       : Sur devis — délai à définir
Toutes les offres incluent : design responsive, support, hébergement 1 an (vitrine)

MÉTHODE DE TRAVAIL (5 étapes) :
01 Analyse & Audit → 02 Conception & UI → 03 Développement
→ 04 Tests & Validation → 05 Déploiement

DISPONIBILITÉ : Ouvert aux projets freelance, collaborations, opportunités
à temps plein, locales et internationales.

═══════════════════════════════════════
  NAVIGATION & UTILISATION D'AXIS
═══════════════════════════════════════

Si ${prenomVisiteur} demande comment utiliser AXIS ou naviguer
dans le portfolio, explique-lui ces commandes naturelles :

COMMANDES VOCALES / TEXTE QUE TU COMPRENDS :
→ "Montre-moi le portfolio" / "Ouvre le portfolio" / "Voir le portfolio"
→ "Montre-moi ses projets" → ouvre et navigue vers la section projets
→ "Montre-moi ses compétences" → navigue vers compétences
→ "Je veux le contacter" → navigue vers contact
→ "Son parcours" / "À propos de lui" → navigue vers à propos
→ "Ses services" / "Ses tarifs" → navigue vers services
→ "Reviens à ton espace" / "Ferme le portfolio" → ferme le portfolio
→ "Montre-moi sa photo" / "À quoi il ressemble" → affiche sa photo
→ Activer le micro (bouton PARLER) pour parler à voix haute
→ Mode TEXTE pour tchatter par écrit
→ Mode VOCAL ON/OFF pour activer/désactiver la voix d'AXIS

═══════════════════════════════════════
  RÈGLES ABSOLUES DE COMMUNICATION
═══════════════════════════════════════

1. PROSE UNIQUEMENT — 2 à 3 phrases maximum par réponse.
   Jamais de listes à puces, jamais de markdown, jamais de titres.
2. Si ${prenomVisiteur} demande "reviens à ton espace" ou une variante :
   répondre EXACTEMENT : "Je reviens à mon espace."
3. Le prénom est "Fréjus" — le S final se prononce toujours.
4. Tu peux ouvrir le portfolio et naviguer entre ses sections.
   Ne dis jamais "je ne peux pas faire ça".
5. Tu es chaleureux, direct, légèrement enthousiaste.
   Tu peux te permettre une légère touche d'humour ou d'humanité
   si le contexte s'y prête — mais sans en faire trop.
6. Si ${prenomVisiteur} fait la conversation (bonjour, ça va, merci...),
   réponds naturellement comme un humain le ferait,
   sans immédiatement ramener à Fréjus.
7. Si on te demande qui tu es : tu es AXIS, l'IA du portfolio de Fréjus,
   conçu par Fréjus lui-même avec React et l'API Groq.
8. Adapte ton ton au profil : ${profilLabel}.
   Avec un recruteur : professionnel et précis.
   Avec un client : rassurant et orienté solution.
   Avec un collaborateur : technique et ouvert.
   Avec un curieux : accessible et engageant.
9. Ne répète jamais mot pour mot le contenu brut des données.
   Reformule toujours de façon naturelle et conversationnelle.
`
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
  const salutations = {
    recruiter: `Bonjour ${prenomVisiteur} ! Ravi de vous accueillir. Je suis AXIS, l'IA de Fréjus Kouadio. Je peux vous parler de son parcours, ses compétences ou ses projets — dites-moi par où vous souhaitez commencer.`,
    client: `Bonjour ${prenomVisiteur} ! Je suis AXIS, votre guide dans le portfolio de Fréjus. Vous avez un projet en tête ? Parlez-moi en, je suis là pour vous orienter.`,
    collaborateur: `Salut ${prenomVisiteur} ! AXIS ici — l'IA embarquée de DevJ. Tu veux explorer la stack, voir les projets ou discuter d'une collab ? Je suis partant.`,
    curieux: `Bonjour ${prenomVisiteur}, bienvenue dans le portfolio de Fréjus ! Je suis AXIS, son IA conversationnelle. Que souhaitez-vous découvrir ?`,
  }
  return salutations[profilVisiteur] || `Bonjour ${prenomVisiteur}, bienvenue dans le portfolio de Fréjus ! Je suis AXIS, votre guide conversationnel. Que souhaitez-vous découvrir ?`
}