// Liste unique des projets de Fréjus, utilisée par défaut par le portfolio,
// la page /projets, l'import de l'admin et les connaissances d'AXIS.
// (Si des projets existent dans Firestore, ce sont eux qui s'affichent :
// l'admin permet d'importer ceux qui manquent.)
// type : 'frontend' | 'fullstack' | 'ia' | 'impact'
// Projets sans image : le portfolio affiche la couleur de leur catégorie ;
// une capture peut être téléversée depuis l'admin.
// Les 6 premiers (avec image) forment la constellation du portfolio.
export const PROJETS = [
  {
    titre: 'KLB Restaurant', categorie: 'Site vitrine', type: 'frontend', annee: '2026', status: 'SUR GITHUB',
    tags: ['React', 'TypeScript', 'GSAP', 'Lenis'],
    desc: "Site vitrine du restaurant-cafétéria KLB à Morofé, Yamoussoukro : carte des plats, ambiance et animations soignées.",
    img: '/asset/projets/klb-restaurant.webp', lien: 'https://github.com/DevJ-58/klb-restaurant',
  },
  {
    titre: 'SanteAI', categorie: 'Télémédecine & IA', type: 'ia', annee: '2024', status: 'EN LIGNE',
    tags: ['React', 'Google AI', 'Python'],
    desc: "Plateforme de télémédecine avec IA intégrée, consultations vidéo et gestion de dossiers médicaux.",
    img: '/asset/santeAI.jpg', lien: 'https://devpost.com/software/santeai',
  },
  {
    titre: 'TechPulse', categorie: 'Plateforme de club tech', type: 'fullstack', annee: '2026', status: 'EN LIGNE',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Plateforme du club technique : équipe, candidatures en ligne, tests de sélection, annonces, réunions et espace d'administration.",
    img: '/asset/projets/techpulse.webp', lien: 'https://tech-pulse-nine.vercel.app',
  },
  {
    titre: 'Habitia Immobilier', categorie: 'Agence immobilière', type: 'fullstack', annee: '2026', status: 'SUR GITHUB',
    tags: ['PHP', 'MySQL', 'JavaScript'],
    desc: "Catalogue de biens immobiliers en vente et en location, contact et panneau d'administration (biens, messages, comptes).",
    img: '/asset/projets/habitia.webp', lien: 'https://github.com/DevJ-58/Habitia-immo',
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
  {
    titre: 'GARO', categorie: 'Essayage capillaire 3D', type: 'ia', annee: '2026', status: 'EN LIGNE',
    tags: ['Three.js', 'MediaPipe', 'GSAP'],
    desc: "Scan du visage dans le navigateur, création d'un avatar 3D et essayage de chaque coiffure du salon avant de s'asseoir.",
    img: '', lien: 'https://garo-six.vercel.app',
  },
  {
    titre: 'djaimomo', categorie: 'Application mobile (PWA)', type: 'fullstack', annee: '2026', status: 'EN LIGNE',
    tags: ['React', 'TypeScript', 'Supabase'],
    desc: "Application web progressive de simulation et de suivi d'enregistrements, avec espaces agent et administrateur, indicateurs et exports PDF.",
    img: '', lien: 'https://djaimomo.vercel.app',
  },
  {
    titre: 'Boutique UIYA', categorie: 'Gestion de stock', type: 'fullstack', annee: '2026', status: 'SUR GITHUB',
    tags: ['PHP', 'JavaScript', 'WebSocket'],
    desc: "Gestion de stock de la boutique de l'université : inventaire, scanner de codes-barres, authentification et statistiques.",
    img: '/asset/projets/boutique-uiya.webp', lien: 'https://github.com/DevJ-58/App_ib2',
  },
  {
    titre: 'ZikmuCI', categorie: 'Culture ivoirienne', type: 'impact', annee: '2023', status: 'EN LIGNE',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    desc: "Plateforme musicale ivoirienne célébrant le Coupé-Décalé, Zouglou et l'Afrobeat.",
    img: '/asset/zikmu.jpg', lien: 'https://zikmu-ci.vercel.app',
  },
  {
    titre: 'Terasse', categorie: 'Sensibilisation environnement', type: 'impact', annee: '2023', status: 'EN LIGNE',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Site de sensibilisation au changement climatique en Côte d'Ivoire.",
    img: '/asset/terasse.jpg', lien: 'https://terasse-three.vercel.app',
  },
  {
    titre: 'GSB — Gestion de Stock', categorie: 'Application de gestion', type: 'fullstack', annee: '2023', status: 'PRIVÉ',
    tags: ['PHP', 'Laravel', 'MySQL'],
    desc: "Application full-stack de gestion d'inventaire avec alertes automatiques et rapports exportables.",
    img: '/asset/GSB.jpg', lien: null,
  },
  {
    titre: 'SIGE', categorie: 'Gestion des étudiants', type: 'fullstack', annee: '2026', status: 'SUR GITHUB',
    tags: ['PHP', 'MySQL', 'JavaScript'],
    desc: "Système de gestion des étudiants de l'UIYA : inscriptions, dossiers et relevés de notes.",
    img: '', lien: 'https://github.com/DevJ-58/Sam_app',
  },
  {
    titre: 'Restaurant UIYA', categorie: 'Gestion de restaurant', type: 'fullstack', annee: '2026', status: 'SUR GITHUB',
    tags: ['PHP', 'JavaScript', 'CSS'],
    desc: "Espace gestionnaire du restaurant universitaire : tableau de bord, comptes étudiants, thèmes et langues.",
    img: '', lien: 'https://github.com/DevJ-58/Restau_project',
  },
  {
    titre: 'DevPeek', categorie: 'Outil pour développeurs', type: 'fullstack', annee: '2026', status: 'SUR GITHUB',
    tags: ['Node.js', 'JavaScript', 'PWA'],
    desc: "Prévisualiser son serveur de développement local sur son vrai téléphone en un scan de QR code, sans retaper d'adresse IP.",
    img: '', lien: 'https://github.com/DevJ-58/devpeek',
  },
  {
    titre: 'Action ou Vérité', categorie: 'Jeu en ligne', type: 'frontend', annee: '2026', status: 'EN LIGNE',
    tags: ['React', 'JavaScript'],
    desc: "Jeu d'action ou vérité avec comptes utilisateurs et invitation d'amis, en présentiel comme à distance.",
    img: '', lien: 'https://action-verite-delta.vercel.app',
  },
  {
    titre: 'Team Innovation', categorie: "Portfolio d'équipe", type: 'frontend', annee: '2026', status: 'EN LIGNE',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Site de présentation de l'équipe Team Innovation : membres, projets et réalisations.",
    img: '', lien: 'https://team-innovation.vercel.app',
  },
].map((p, i) => ({ ...p, num: String(i + 1).padStart(2, '0'), ordre: i }))
