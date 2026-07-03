import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import utiliserTheme from '@/store/utiliserTheme'
import usePortfolioData from '@/hooks/usePortfolioData'
import ProjectsScene from '@/composants/ui/projets3d/ProjectsScene'
import { genererPositions } from '@/composants/ui/projets3d/scenePositions'
import ProjectsVerticalRail from '@/composants/ui/projets3d/ProjectsVerticalRail'
import ProjectDetailOverlay from '@/composants/ui/projets3d/ProjectDetailOverlay'

const PROJETS_PAR_DEFAUT = [
  {
    num: '01', titre: 'Eliko Voyage',
    categorie: 'Agence de voyage',
    type: 'frontend',
    tags: ['HTML/CSS', 'JavaScript', 'React'],
    desc: "Interface moderne pour agence de voyage permettant la réservation en ligne et la gestion de séjours personnalisés.",
    img: '/asset/eliko.PNG',
    lien: 'https://devj-58.github.io/eliko_voyage/',
    annee: '2024',
    status: 'EN LIGNE',
  },
  {
    num: '02', titre: 'SanteAI',
    categorie: 'Télémédecine & IA',
    type: 'ia',
    tags: ['React', 'Google AI', 'Python'],
    desc: "Plateforme de télémédecine avec IA intégrée, consultations vidéo et gestion de dossiers médicaux.",
    img: '/asset/santeAI.jpg',
    lien: 'https://devpost.com/software/santeai',
    annee: '2024',
    status: 'EN LIGNE',
  },
  {
    num: '03', titre: 'Bibliothèque UIYA',
    categorie: 'Application éducative',
    type: 'fullstack',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Système complet de gestion de bibliothèque déployé pour l'Université Internationale de Yamoussoukro.",
    img: '/asset/uiya.PNG',
    lien: 'https://bibliotheque.igl-uiya.com/',
    annee: '2024',
    status: 'EN PRODUCTION',
  },
  {
    num: '04', titre: 'GSB — Gestion de Stock',
    categorie: 'Application de gestion',
    type: 'fullstack',
    tags: ['PHP', 'Laravel', 'MySQL'],
    desc: "Application full-stack de gestion d'inventaire avec alertes automatiques et rapports exportables.",
    img: '/asset/GSB.jpg',
    lien: null,
    annee: '2023',
    status: 'PRIVÉ',
  },
  {
    num: '05', titre: 'ZikmuCI',
    categorie: 'Culture ivoirienne',
    type: 'impact',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    desc: "Plateforme musicale ivoirienne célébrant le Coupé-Décalé, Zouglou et l'Afrobeat.",
    img: '/asset/zikmu.jpg',
    lien: 'https://devj-58.github.io/ZikmuCi/index.html',
    annee: '2023',
    status: 'EN LIGNE',
  },
  {
    num: '06', titre: 'Terasse',
    categorie: 'Sensibilisation environnement',
    type: 'impact',
    tags: ['HTML', 'CSS', 'JavaScript'],
    desc: "Site de sensibilisation au changement climatique en Côte d'Ivoire.",
    img: '/asset/terasse.jpg',
    lien: 'https://terasse-ivoire.vercel.app',
    annee: '2023',
    status: 'EN LIGNE',
  },
]

const CATEGORIES = {
  frontend:  { label: 'Frontend',      icon: 'layout', color: '#5DCAA5', textDark: true },
  fullstack: { label: 'Fullstack',     icon: 'server', color: '#378ADD', textDark: false },
  ia:        { label: 'IA & Data',     icon: 'cpu',    color: '#D4537E', textDark: false },
  impact:    { label: 'Impact social', icon: 'heart',  color: '#EF9F27', textDark: true },
}

export default function ProjetsFull() {
  const { theme } = utiliserTheme()
  const a = theme.accent
  const aRgb = theme.accentRgb
  const navigate = useNavigate()
  const [filtre, setFiltre] = useState('TOUS')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [projetSelectionne, setProjetSelectionne] = useState(null)
  const [projetApercuIndex, setProjetApercuIndex] = useState(0)

  // Remplacer les projets codés par le hook public avec fallback silencieux
  const { projets: projetsData } = usePortfolioData(PROJETS_PAR_DEFAUT, [])

  const fermerDetail = () => setProjetSelectionne(null)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    const handleEsc = (e) => {
      if (e.key === 'Escape' && projetSelectionne) {
        fermerDetail()
      }
    }

    window.addEventListener('resize', h)
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('resize', h)
      window.removeEventListener('keydown', handleEsc)
    }
  }, [projetSelectionne])

  const projetsFiltres = filtre === 'TOUS'
    ? projetsData
    : projetsData.filter(p => p.type === filtre)

  const previewIndex = projetsFiltres.length > 0
    ? Math.min(projetApercuIndex, projetsFiltres.length - 1)
    : 0

  const positions = useMemo(() => genererPositions(projetsFiltres.length), [projetsFiltres.length])
  const previewTarget = projetSelectionne ? null : positions[previewIndex] || null

  const handleSelectProjet = (projet) => {
    setProjetSelectionne(projet)
  }

  const handleNaviguerApercu = (index) => {
    setProjetApercuIndex(index)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      color: '#F5F5F0',
      fontFamily: 'Inter, sans-serif',
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;1,9..144,400&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .filtres-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,5,5,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: isMobile ? '14px 20px' : '16px 60px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate('/experience', { state: { skipGreeting: true } })}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Space Mono, monospace',
            fontSize: 9, letterSpacing: '0.2em',
            cursor: 'pointer', transition: 'color 0.2s',
            padding: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = a}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          ← RETOUR
        </button>
        <div style={{
          fontFamily: 'Fraunces, serif', fontWeight: 800,
          fontSize: 14, color: '#F5F5F0', letterSpacing: '0.06em',
        }}>
          &lt;<span style={{ color: a }}>/DevJ</span>&gt;
        </div>
        <div style={{
          fontFamily: 'Space Mono, monospace', fontSize: 9,
          color: `rgba(${aRgb},0.5)`, letterSpacing: '0.2em',
        }}>
          {projetsFiltres.length} PROJETS
        </div>
      </nav>

      {/* HEADER */}
      <div style={{
        padding: isMobile ? '40px 20px 28px' : '80px 60px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontFamily: 'Fraunces, serif',
          fontSize: isMobile ? 80 : 200,
          display: isMobile ? 'none' : 'block',
          fontWeight: 800, color: 'rgba(255,255,255,0.012)',
          letterSpacing: '-0.05em', whiteSpace: 'nowrap',
          pointerEvents: 'none', userSelect: 'none',
        }}>WORK</div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
            color: `rgba(${aRgb},0.5)`, letterSpacing: isMobile ? '0.2em' : '0.35em',
            marginBottom: isMobile ? 10 : 16,
          }}>// PORTFOLIO COMPLET</div>

          <h1 style={{
            fontFamily: 'Fraunces, serif', fontWeight: 800,
            fontSize: isMobile ? 36 : 72,
            lineHeight: 1, margin: isMobile ? '0 0 14px' : '0 0 20px',
            letterSpacing: '-0.03em',
          }}>
            Tous mes<br />
            <span style={{ color: a }}>Projets</span>
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 300,
            fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.4)',
            maxWidth: isMobile ? '100%' : 500, lineHeight: 1.8, margin: 0,
          }}>
            6 projets réalisés entre 2023 et 2024 — du frontend au fullstack, de la culture ivoirienne à la télémédecine.
          </p>
        </div>
      </div>

      {/* FILTRES — système par catégories visuelles */}
      <div style={{ padding: isMobile ? '0 20px 28px' : '0 60px 48px' }}>
        <div className="filtres-scroll" style={{ display: 'flex', gap: 10, overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? 6 : 0, WebkitOverflowScrolling: isMobile ? 'touch' : 'auto', msOverflowStyle: isMobile ? 'none' : undefined, scrollbarWidth: isMobile ? 'none' : undefined, flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
          <button onClick={() => setFiltre('TOUS')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: isMobile ? '6px 14px' : '8px 18px',
            background: filtre === 'TOUS' ? a : 'rgba(255,255,255,0.04)',
            border: filtre === 'TOUS' ? `1px solid ${a}` : '1px solid rgba(255,255,255,0.08)',
            color: filtre === 'TOUS' ? '#050505' : 'rgba(255,255,255,0.5)',
            fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
            letterSpacing: '0.15em', borderRadius: isMobile ? 20 : 6,
            cursor: 'pointer', fontWeight: filtre === 'TOUS' ? 700 : 400,
            transition: 'all 0.2s', flexShrink: isMobile ? 0 : undefined,
          }}>TOUS</button>

          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const active = filtre === key
            return (
              <button key={key} onClick={() => setFiltre(key)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: isMobile ? '6px 14px' : '8px 18px',
                background: active ? cat.color : 'rgba(255,255,255,0.04)',
                border: active ? `1px solid ${cat.color}` : '1px solid rgba(255,255,255,0.08)',
                color: active ? (cat.textDark ? '#050505' : '#fff') : 'rgba(255,255,255,0.5)',
                fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
                letterSpacing: '0.15em', borderRadius: isMobile ? 20 : 6,
                cursor: 'pointer', fontWeight: active ? 700 : 400,
                transition: 'all 0.2s', flexShrink: isMobile ? 0 : undefined,
              }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, boxShadow: active ? '0 0 0 1px rgba(255,255,255,0.12)' : 'none' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: active ? (cat.textDark ? '#050505' : '#fff') : 'rgba(255,255,255,0.75)' }}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* GRILLE PROJETS */}
      <div style={{ padding: isMobile ? '0 20px 60px' : '0 60px 100px' }}>
        <div style={{
          height: isMobile ? '56vh' : '70vh',
          width: '100%',
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <ProjectsScene
            projets={projetsFiltres}
            categories={CATEGORIES}
            filtreActif={filtre}
            projetSelectionne={projetSelectionne}
            onSelectProjet={handleSelectProjet}
            isMobile={isMobile}
            positions={positions}
            previewTarget={previewTarget}
          />
          <div style={{
            position: 'absolute',
            left: 24,
            bottom: isMobile ? 76 : 24,
            right: isMobile ? 16 : 116,
            zIndex: 15,
            pointerEvents: 'none',
          }}>
            {previewTarget && (
              <div style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 8,
                letterSpacing: '0.24em',
                color: CATEGORIES[projetsFiltres[previewIndex]?.type]?.color || a,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {projetsFiltres[previewIndex]?.titre} · {CATEGORIES[projetsFiltres[previewIndex]?.type]?.label || ''} — EN APERÇU
              </div>
            )}
          </div>
          <ProjectsVerticalRail
            projets={projetsFiltres}
            projetApercuIndex={projetApercuIndex}
            onNaviguerApercu={handleNaviguerApercu}
            categories={CATEGORIES}
            isMobile={isMobile}
          />
        </div>
      </div>

      {projetSelectionne && (
        <ProjectDetailOverlay
          projet={projetSelectionne}
          categoryColor={CATEGORIES[projetSelectionne.type]?.color || a}
          onClose={fermerDetail}
        />
      )}

      {/* FOOTER MINIMAL */}
      <div style={{
        borderTop: `1px solid rgba(${aRgb},0.08)`,
        padding: isMobile ? '24px 20px' : '40px 60px',
        display: 'flex', justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? 12 : 16,
      }}>
        <div style={{
          fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
          color: `rgba(${aRgb},0.35)`, letterSpacing: '0.2em',
        }}>
          {new Date().getFullYear()} · FRÉJUS KOUADIO
        </div>
        <button
          onClick={() => navigate('/portfolio', { state: { skipGreeting: true } })}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: `rgba(${aRgb},0.08)`,
            border: `1px solid rgba(${aRgb},0.2)`,
            color: a, padding: isMobile ? '12px 20px' : '10px 24px',
            fontFamily: 'Space Mono, monospace', fontSize: isMobile ? 8 : 9,
            letterSpacing: '0.18em', borderRadius: 8,
            cursor: 'pointer', transition: 'background 0.2s',
            width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start',
          }}
          onMouseEnter={e => e.currentTarget.style.background = `rgba(${aRgb},0.15)`}
          onMouseLeave={e => e.currentTarget.style.background = `rgba(${aRgb},0.08)`}
        >
          ← RETOUR AU PORTFOLIO
        </button>
      </div>
    </div>
  )
}