// Projets à écrire dans la base Firebase (collection projets_portfolio).
// Ce fichier n'est chargé que par l'espace admin : à la connexion, l'admin
// ajoute les projets manquants, met à jour ceux dont la version est plus
// ancienne et supprime les projets masqués. Le site public ne lit que la base.
// type : 'frontend' | 'fullstack' | 'ia' | 'impact'

export const VERSION_PROJETS = 2

export const PROJETS_INITIAUX = [
  // ── En ligne
  {
    titre: 'AXIS — Portfolio IA', categorie: 'Portfolio interactif', type: 'ia', annee: '2026', status: 'EN LIGNE',
    tags: ['React', 'Three.js', 'GSAP', 'Groq'],
    desc: "Ce portfolio : AXIS, un avatar 3D qui accueille, parle et guide chaque visiteur, avec un récit éditorial animé au défilement.",
    img: '/asset/projets/axis-portfolio.webp', lien: 'https://devj-portfolio-v2.vercel.app',
  },
  {
    titre: 'GARO', categorie: 'Essayage capillaire 3D', type: 'ia', annee: '2026', status: 'EN LIGNE',
    tags: ['Three.js', 'MediaPipe', 'GSAP'],
    desc: "Scan du visage dans le navigateur, avatar 3D et essayage de chaque coiffure du salon avant de s'asseoir.",
    img: '/asset/projets/garo.webp', lien: 'https://garo-six.vercel.app',
  },
  {
    titre: 'KLB Restaurant', categorie: 'Site vitrine', type: 'frontend', annee: '2026', status: 'EN LIGNE',
    tags: ['React', 'TypeScript', 'GSAP', 'Lenis'],
    desc: "Site du restaurant-cafétéria KLB à Morofé, Yamoussoukro : la carte, l'ambiance, la commande et l'itinéraire.",
    img: '/asset/projets/klb-restaurant.webp', lien: 'https://klb-restaurant-9thl.vercel.app',
  },
  {
    titre: 'TechPulse', categorie: 'Plateforme de club tech', type: 'fullstack', annee: '2026', status: 'EN LIGNE',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Plateforme du club technique : candidatures en ligne, tests de sélection, annonces, réunions et espace d'administration.",
    img: '/asset/projets/techpulse.webp', lien: 'https://techpulseclub.vercel.app',
  },
  {
    titre: 'Lycée Lambert Dan Zoumanan', categorie: "Site d'établissement", type: 'impact', annee: '2026', status: 'EN LIGNE',
    tags: ['Next.js', 'TypeScript'],
    desc: "Site officiel du Lycée Moderne Lambert Dan Zoumanan de Logoualé (région du Tonkpi) : établissement, vie scolaire, admissions et espace élève.",
    img: '/asset/projets/lmdz.webp', lien: 'https://lmdz-logouale.vercel.app',
  },
  {
    titre: 'Team Innovation', categorie: "Portfolio d'équipe", type: 'frontend', annee: '2026', status: 'EN LIGNE',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Site de l'équipe Team Innovation : membres, hackathons, projets et réalisations.",
    img: '/asset/projets/team-innovation.webp', lien: 'https://team-innovation.vercel.app',
  },
  {
    titre: 'Technovore', categorie: 'Entraînement hackathon', type: 'frontend', annee: '2026', status: 'EN LIGNE',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Plateforme de présélection au hackathon : 60 questions chronométrées par thème (IA, réseaux, microservices…) pour s'entraîner et se mesurer.",
    img: '/asset/projets/technovore.webp', lien: 'https://devjtest-hackaton-esatic.vercel.app',
  },
  {
    titre: 'ZikmuCI', categorie: 'Culture ivoirienne', type: 'impact', annee: '2023', status: 'EN LIGNE',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    desc: "Plateforme musicale ivoirienne célébrant le Coupé-Décalé, Zouglou et l'Afrobeat.",
    img: '/asset/projets/zikmuci.webp', lien: 'https://zikmu-ci.vercel.app',
  },
  {
    titre: 'Invitation surprise', categorie: 'Page événementielle', type: 'frontend', annee: '2026', status: 'EN LIGNE',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Page d'invitation à effet surprise qui accueille les membres sélectionnés et les fait rejoindre une communauté privée.",
    img: '/asset/projets/invitation-surprise.webp', lien: 'https://freinds-checksmypoint.vercel.app',
  },
  {
    titre: 'Terasse', categorie: 'Sensibilisation environnement', type: 'impact', annee: '2023', status: 'EN LIGNE',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Site de sensibilisation au changement climatique en Côte d'Ivoire.",
    img: '/asset/terasse.jpg', lien: 'https://github.com/DevJ-58/Terasse',
  },
  {
    titre: 'SanteAI', categorie: 'Télémédecine & IA', type: 'ia', annee: '2024', status: 'EN LIGNE',
    tags: ['React', 'Google AI', 'Python'],
    desc: "Plateforme de télémédecine avec IA intégrée, consultations vidéo et gestion de dossiers médicaux.",
    img: '/asset/santeAI.jpg', lien: 'https://devpost.com/software/santeai',
  },
  {
    titre: 'Bibliothèque UIYA', categorie: 'Application éducative', type: 'fullstack', annee: '2024', status: 'EN PRODUCTION',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Système complet de gestion de bibliothèque déployé pour l'Université Internationale de Yamoussoukro.",
    img: '/asset/uiya.PNG', lien: 'https://bibliotheque.igl-uiya.com/',
  },
  {
    titre: 'Eliko Voyage', categorie: 'Agence de voyage', type: 'frontend', annee: '2024', status: 'EN LIGNE',
    tags: ['HTML/CSS', 'JavaScript', 'React'],
    desc: "Interface moderne pour agence de voyage permettant la réservation en ligne et la gestion de séjours personnalisés.",
    img: '/asset/eliko.PNG', lien: 'https://devj-58.github.io/eliko_voyage/',
  },
  // ── Sur GitHub
  {
    titre: 'Habitia Immobilier', categorie: 'Agence immobilière', type: 'fullstack', annee: '2026', status: 'SUR GITHUB',
    tags: ['PHP', 'MySQL', 'JavaScript'],
    desc: "Catalogue de biens immobiliers en vente et en location, contact et panneau d'administration (biens, messages, comptes).",
    img: '/asset/projets/habitia.webp', lien: 'https://github.com/DevJ-58/Habitia-immo',
  },
  {
    titre: 'Boutique UIYA', categorie: 'Gestion de stock', type: 'fullstack', annee: '2026', status: 'SUR GITHUB',
    tags: ['PHP', 'JavaScript', 'WebSocket'],
    desc: "Gestion de stock de la boutique de l'université : inventaire, scanner de codes-barres, authentification et statistiques.",
    img: '/asset/projets/boutique-uiya.webp', lien: 'https://github.com/DevJ-58/App_ib2',
  },
  {
    titre: 'SIGE', categorie: 'Gestion des étudiants', type: 'fullstack', annee: '2026', status: 'SUR GITHUB',
    tags: ['PHP', 'MySQL', 'JavaScript'],
    desc: "Système de gestion des étudiants de l'UIYA : inscriptions, dossiers et relevés de notes.",
    img: '/asset/projets/sige.webp', lien: 'https://github.com/DevJ-58/Sam_app',
  },
  {
    titre: 'Restaurant UIYA', categorie: 'Gestion de restaurant', type: 'fullstack', annee: '2026', status: 'SUR GITHUB',
    tags: ['PHP', 'JavaScript', 'CSS'],
    desc: "Espace gestionnaire du restaurant universitaire : tableau de bord, comptes étudiants, thèmes et langues.",
    img: '/asset/projets/restaurant-uiya.webp', lien: 'https://github.com/DevJ-58/Restau_project',
  },
  {
    titre: 'DevPeek', categorie: 'Outil pour développeurs', type: 'fullstack', annee: '2026', status: 'SUR GITHUB',
    tags: ['Node.js', 'JavaScript', 'PWA'],
    desc: "Prévisualiser son serveur de développement local sur son vrai téléphone en un scan de QR code, sans retaper d'adresse IP.",
    img: '/asset/projets/devpeek.webp', lien: 'https://github.com/DevJ-58/devpeek',
  },
  {
    titre: 'Action ou Vérité', categorie: 'Jeu en ligne', type: 'frontend', annee: '2026', status: 'SUR GITHUB',
    tags: ['React', 'JavaScript'],
    desc: "Jeu d'action ou vérité avec comptes utilisateurs et invitation d'amis, en présentiel comme à distance.",
    img: '/asset/projets/action-verite.webp', lien: 'https://github.com/DevJ-58/action-verite',
  },
  {
    titre: 'GSB — Gestion de Stock', categorie: 'Application de gestion', type: 'fullstack', annee: '2023', status: 'PRIVÉ',
    tags: ['PHP', 'Laravel', 'MySQL'],
    desc: "Application full-stack de gestion d'inventaire avec alertes automatiques et rapports exportables.",
    img: '/asset/GSB.jpg', lien: null,
  },
].map((p, i) => ({ ...p, num: String(i + 1).padStart(2, '0'), ordre: i, version: VERSION_PROJETS }))

// Projets à retirer de la base
export const PROJETS_MASQUES = ['djaimomo']
