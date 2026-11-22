import { PROJETS } from '@/donnees/projets'
// Contenus du portfolio. Projets et compétences : valeurs par défaut,
// remplacées par celles de Firebase quand elles existent (usePortfolioData).

export const SECTIONS = [
  { id: 'hero', label: 'Portrait', court: 'Intro', desc: "Qui est Fréjus Kouadio, en un regard." },
  { id: 'about', label: 'À propos', court: 'About', desc: 'Le manifeste : concevoir des interfaces qui se ressentent.' },
  { id: 'academic', label: 'Parcours', court: 'Academic', desc: 'Trois chapitres, du BEPC au génie logiciel.' },
  { id: 'skills', label: 'Compétences', court: 'Skills', desc: 'Le signal technique : front, back, IA et outils.' },
  { id: 'projects', label: 'Projets', court: 'Projects', desc: 'La constellation de travaux livrés.' },
  { id: 'github', label: 'GitHub', court: 'GitHub', desc: "Une année d'activité, jour après jour." },
  { id: 'services', label: 'Services', court: 'Services', desc: 'Offres, tarifs et délais.' },
  { id: 'methodology', label: 'Méthode', court: 'Methodology', desc: "Cinq étapes, de l'audit au déploiement." },
  { id: 'contact', label: 'Contact', court: 'Contact', desc: 'Travaillons ensemble.' },
]

export const parcoursData = [
  { chap: 'I', periode: '2020—2021', titre: 'BEPC', detail: "Brevet d'Études du Premier Cycle. Bons résultats généraux.", active: false },
  { chap: 'II', periode: '2023—2024', titre: 'Bac série D', detail: "Baccalauréat scientifique — ouverture vers l'ingénierie.", active: false },
  { chap: 'III', periode: '2024—en cours', titre: 'Génie Logiciel', detail: "Licence à l'UIYA, 2ème année. Cap sur l'IA.", active: true },
]

export const projetsParDefaut = PROJETS

export const competencesParDefaut = [
  { cat: 'Frontend', items: [['HTML5', 95], ['CSS3', 90], ['JavaScript', 85], ['React', 80], ['TypeScript', 75], ['Bootstrap', 90], ['GSAP', 75]] },
  { cat: 'Backend', items: [['PHP', 85], ['Laravel', 80]] },
  { cat: 'IA & ML', items: [['Python', 70], ['TensorFlow', 65], ['NLP', 60]] },
  { cat: 'Outils', items: [['Git & GitHub', 90], ['Figma', 85], ['Canva', 88], ['Docker', 60]] },
]

export const services = [
  { titre: 'Site Vitrine', prix: '300 000 FCFA', delai: '1 à 2 semaines',
    features: ['Design moderne responsive', "Jusqu'à 5 pages", 'Formulaire de contact', 'SEO de base', 'Hébergement 1 an', 'Support 24/7'] },
  { titre: 'Site E-commerce', prix: '500 000 FCFA', delai: '3 à 4 semaines', badge: 'Populaire',
    features: ['Boutique en ligne complète', 'Gestion produits illimitée', 'Paiement sécurisé', 'Dashboard admin', 'Formation incluse', 'Support prioritaire'] },
  { titre: 'Sur Mesure', prix: 'Sur Devis', delai: 'À définir',
    features: ['Solution 100% personnalisée', 'Fonctionnalités avancées', 'Intégrations sur mesure', 'Support prioritaire', 'Évolutivité garantie', 'Maintenance incluse'] },
]

export const etapes = [
  {
    n: '01', titre: 'Analyse & Audit', duree: '~1 semaine',
    desc: "Avant d'écrire la moindre ligne de code, je prends le temps de comprendre en profondeur votre activité, vos objectifs et vos utilisateurs. Cette phase pose les fondations de tout le projet : elle évite les allers-retours coûteux plus tard et garantit que chaque décision technique sert un objectif métier clair.",
    tags: ['Benchmark', 'Personas', 'Roadmap'],
    livrables: ['Audit concurrentiel détaillé', 'Cahier des charges fonctionnel', "Architecture de l'information"],
  },
  {
    n: '02', titre: 'Conception & UI', duree: '~2 semaines',
    desc: "La phase créative où l'idée prend forme visuellement. Je conçois des maquettes qui traduisent votre identité de marque en une expérience cohérente et intuitive, testées et validées avec vous avant tout développement — pour que la version finale ne soit jamais une surprise.",
    tags: ['Wireframes', 'Design system', 'Prototype'],
    livrables: ['Wireframes basse-fidélité', 'Maquettes haute-fidélité', 'Design system réutilisable'],
  },
  {
    n: '03', titre: 'Développement', duree: '~4 semaines',
    desc: "L'implémentation technique, où la rigueur fait toute la différence. J'écris un code propre, documenté et scalable, en suivant les meilleures pratiques du secteur — pensé pour évoluer avec votre projet, pas pour être réécrit dans six mois.",
    tags: ['Frontend', 'Backend', 'CI/CD'],
    livrables: ['Intégration frontend responsive', 'API et logique backend', 'Suite de tests unitaires'],
  },
  {
    n: '04', titre: 'Tests & Validation', duree: '~1 semaine',
    desc: "Chaque fonctionnalité est passée au crible sur différents navigateurs, appareils et scénarios d'usage réels. Cette étape garantit un produit fiable, accessible et performant dès le premier jour de mise en ligne, pas après les premiers retours utilisateurs.",
    tags: ['QA', 'Tests E2E', 'Accessibilité'],
    livrables: ['Tests cross-browser complets', "Audit d'accessibilité (WCAG)", 'Optimisation des performances et SEO'],
  },
  {
    n: '05', titre: 'Déploiement', duree: 'continu',
    desc: "La mise en ligne n'est pas la fin, c'est le début d'une relation continue. Je m'assure d'un déploiement sans accroc, forme les équipes concernées à l'outil livré, et reste disponible pour le suivi post-lancement.",
    tags: ['Déploiement', 'Monitoring', 'Support'],
    livrables: ['Mise en production sécurisée', "Formation à l'utilisation", 'Documentation technique complète'],
  },
]

export const contacts = [
  { label: 'Email', val: 'devfred58@gmail.com', href: 'mailto:devfred58@gmail.com', desc: 'Réponse sous 24h' },
  { label: 'Téléphone', val: '+225 0767998373', href: 'tel:+2250767998373', desc: 'Lun–Sam, 8h–18h' },
  { label: 'WhatsApp', val: 'Envoyer un message', href: 'https://wa.me/2250767998373', desc: 'Chat rapide' },
  { label: 'LinkedIn', val: 'Voir le profil', href: 'https://www.linkedin.com/in/frejus-kouadio-316238329', desc: 'Réseau professionnel' },
]

export const reseaux = [
  { label: 'GitHub', href: 'https://github.com/devj-58' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/frejus-kouadio-316238329' },
  { label: 'WhatsApp', href: 'https://wa.me/2250767998373' },
]

// Normalisation des données Firebase (formats hérités variés)
export function normaliserCompetences(raw) {
  if (!Array.isArray(raw)) return []
  const versPaire = (item) => {
    if (Array.isArray(item)) return item
    if (item && typeof item === 'object') {
      const nom = item.nom ?? item.name ?? item.label ?? item.titre ?? Object.values(item)[0]
      const pct = item.pct ?? item.value ?? item.score ?? item.niveau ?? Object.values(item)[1] ?? 0
      return [nom ?? '', pct ?? 0]
    }
    return [String(item ?? ''), 0]
  }
  return raw.map((cat = {}) => {
    const r = cat.items
    const items = Array.isArray(r) ? r.map(versPaire) : r && typeof r === 'object' ? Object.values(r).map(versPaire) : []
    return { ...cat, items: items.map(([n, p]) => [String(n), Number(p) || 0]) }
  })
}

export function normaliserProjets(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map((p = {}, i) => ({
    ...p,
    num: p.num || String(i + 1).padStart(2, '0'),
    tags: Array.isArray(p.tags) ? p.tags : p.tags && typeof p.tags === 'object' ? Object.values(p.tags) : [],
  }))
}
