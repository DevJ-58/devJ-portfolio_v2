import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import utiliserTheme from '@/store/utiliserTheme'

const Portfolio = forwardRef(function Portfolio({ onClose }, ref) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [servicesOuverts, setServicesOuverts] = useState({})
  const wrapRef = useRef(null)
  const { theme } = utiliserTheme()
  const a = theme.accent
  const aRgb = theme.accentRgb

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const onScroll = () => setShowScrollTop(wrap.scrollTop > 200)
    wrap.addEventListener('scroll', onScroll)
    return () => wrap.removeEventListener('scroll', onScroll)
  }, [])

  const toggleService = (titre) => {
    setServicesOuverts((prev) => ({ ...prev, [titre]: !prev[titre] }))
  }

  // Exposer la fonction naviguerVers au parent
  useImperativeHandle(ref, () => ({
    naviguerVers(section) {
      console.log('[naviguerVers] appelé:', section)
      
      const doScroll = () => {
        const wrap = document.getElementById('pf-wrap')
        const el = document.getElementById(`pf-${section}`)
        if (!wrap || !el) {
          console.warn('[naviguerVers] manquant — wrap:', !!wrap, 'el:', !!el)
          return false
        }
        const top = el.offsetTop
        console.log('[naviguerVers] scrollTop avant:', wrap.scrollTop, '→ offsetTop:', top)
        wrap.scrollTop = top
        console.log('[naviguerVers] scrollTop après:', wrap.scrollTop)
        el.style.outline = `2px solid rgba(${aRgb},0.7)`
        el.style.outlineOffset = '12px'
        setTimeout(() => { el.style.outline = 'none' }, 2500)
        return true
      }
      
      // Premier essai immédiat
      if (!doScroll()) {
        // Si raté, réessayer toutes les 100ms jusqu'à 3 secondes
        let tries = 0
        const retry = setInterval(() => {
          tries++
          if (doScroll() || tries > 30) clearInterval(retry)
        }, 100)
      }
    }
  }))

  const projets = [
    {
      num: '01', titre: 'Eliko Voyage', tags: ['HTML/CSS', 'JavaScript', 'React'],
      desc: "Interface moderne pour agence de voyage permettant la réservation en ligne et la gestion de séjours personnalisés.",
      img: '/asset/eliko.PNG', lien: 'https://devj-58.github.io/eliko_voyage/'
    },
    {
      num: '02', titre: 'SanteAI', tags: ['React', 'Google AI', 'Python'],
      desc: "Plateforme de télémédecine avec IA intégrée, consultations vidéo et gestion de dossiers médicaux.",
      img: '/asset/santeAI.jpg', lien: 'https://devpost.com/software/santeai'
    },
    {
      num: '03', titre: 'Bibliothèque UIYA', tags: ['HTML', 'CSS', 'JavaScript'],
      desc: "Système complet de gestion de bibliothèque déployé pour l'Université Internationale de Yamoussoukro.",
      img: '/asset/uiya.PNG', lien: 'https://bibliotheque.igl-uiya.com/'
    },
    {
      num: '04', titre: 'GSB — Gestion de Stock', tags: ['PHP', 'Laravel', 'MySQL'],
      desc: "Application full-stack de gestion d'inventaire avec alertes automatiques et rapports exportables.",
      img: '/asset/GSB.jpg', lien: null
    },
    {
      num: '05', titre: 'ZikmuCI', tags: ['HTML5', 'CSS3', 'JavaScript'],
      desc: "Plateforme musicale ivoirienne célébrant le Coupé-Décalé, Zouglou et l'Afrobeat.",
      img: '/asset/zikmu.jpg', lien: 'https://devj-58.github.io/ZikmuCi/index.html'
    },
    {
      num: '06', titre: 'Terasse', tags: ['HTML', 'CSS', 'JavaScript'],
      desc: "Site de sensibilisation au changement climatique en Côte d'Ivoire.",
      img: '/asset/terasse.jpg', lien: 'https://terasse-ivoire.vercel.app'
    },
  ]

  const competences = [
    { cat: 'Frontend', items: [['HTML5',95],['CSS3',90],['JavaScript',85],['React',80],['TypeScript',75],['Bootstrap',90],['GSAP',75]] },
    { cat: 'Backend', items: [['PHP',85],['Laravel',80]] },
    { cat: 'IA & ML', items: [['Python',70],['TensorFlow',65],['NLP',60]] },
    { cat: 'Outils', items: [['Git & GitHub',90],['Figma',85],['Canva',88],['Docker',60]] },
  ]

  const services = [
    { titre: 'Site Vitrine', prix: '300 000 FCFA', delai: '1 à 2 semaines',
      features: ['Design moderne responsive','Jusqu\'à 5 pages','Formulaire de contact','SEO de base','Hébergement 1 an','Support 24/7'] },
    { titre: 'Site E-commerce', prix: '500 000 FCFA', delai: '3 à 4 semaines', badge: 'Populaire',
      features: ['Boutique en ligne complète','Gestion produits illimitée','Paiement sécurisé','Dashboard admin','Formation incluse','Support prioritaire'] },
    { titre: 'Sur Mesure', prix: 'Sur Devis', delai: 'À définir',
      features: ['Solution 100% personnalisée','Fonctionnalités avancées','Intégrations sur mesure','Support prioritaire','Évolutivité garantie','Maintenance incluse'] },
  ]

  const etapes = [
    { n:'01', titre:'Analyse & Audit', desc:'Compréhension des besoins, définition des objectifs et cartographie complète du projet.' },
    { n:'02', titre:'Conception & UI', desc:'Design des maquettes, prototypage interactif et création de l\'identité visuelle.' },
    { n:'03', titre:'Développement', desc:'Codage propre et optimisé avec architecture scalable et maintenable.' },
    { n:'04', titre:'Tests & Validation', desc:'Tests multi-navigateurs, validation performance, accessibilité et SEO.' },
    { n:'05', titre:'Déploiement', desc:'Mise en ligne sécurisée, formation et documentation complète.' },
  ]

  const s = {
    wrap: { fontFamily: 'DM Sans, sans-serif', background: '#050505', color: '#F5F5F0', overflowY: 'auto', height: '100%', scrollBehavior: 'smooth' },
    nav: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.85)', WebkitBackdropFilter: 'blur(24px)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { color: '#F5F5F0', fontSize: 15, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'Syne, sans-serif' },
    closeBtn: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '8px 16px', cursor: 'pointer', fontSize: 9, letterSpacing: '0.2em', borderRadius: 6, fontFamily: 'Space Mono, monospace' },
    section: { padding: '100px 80px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    secNum: { color: `rgba(${aRgb},0.35)`, fontSize: 10, letterSpacing: '0.35em', fontFamily: 'Space Mono, monospace' },
    secTitle: { fontSize: 36, fontWeight: 700, color: '#F5F5F0', margin: '0 0 56px', fontFamily: 'Syne, sans-serif' },
    accent: { color: a },
    tag: { background: `rgba(${aRgb},0.08)`, border: `1px solid rgba(${aRgb},0.2)`, color: a, padding: '6px 16px', fontSize: 9, letterSpacing: '0.2em', borderRadius: 3, display: 'inline-block' },
    card: { border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: 24, marginBottom: 20, borderRadius: 12, WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' },
    barWrap: { background: 'rgba(255,255,255,0.06)', height: 2, borderRadius: 2, margin: '8px 0 12px', width: '100%' },
  }

  const navStyle = { ...s.nav, padding: isMobile ? '12px 20px' : s.nav.padding }
  const sectionStyle = { ...s.section, padding: isMobile ? '64px 24px' : s.section.padding }
  const heroSectionStyle = { ...sectionStyle, minHeight: '85vh', display: 'flex', alignItems: 'center', gap: isMobile ? 40 : 80, flexDirection: isMobile ? 'column' : 'row' }
  const heroTextStyle = { flex: 1, width: '100%' }
  const heroImageStyle = { display: isMobile ? 'none' : 'block', maxHeight: 420, maxWidth: '100%', objectFit: 'contain', filter: `drop-shadow(0 0 60px rgba(${aRgb},0.12))` }
  const heroStatsStyle = { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }
  const heroButtonsStyle = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, width: isMobile ? '100%' : 'auto' }
  const aboutStyle = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 48, alignItems: 'flex-start' }
  const aboutImgStyle = { width: isMobile ? '100%' : 220, maxHeight: isMobile ? 240 : undefined, objectFit: 'cover', objectPosition: 'top', borderRadius: 16, filter: `drop-shadow(0 0 30px rgba(${aRgb},0.1))` }
  const aboutGridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginTop: 24 }
  const skillsGridStyle = { display: 'block' }
  const projectsGridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }
  const projectImageStyle = { width: '100%', objectFit: 'cover', display: 'block', objectPosition: 'top center' }
  const servicesGridStyle = { display: 'flex', flexDirection: 'column', gap: 12 }
  const contactGridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }
  const navLinksStyle = { display: isMobile ? 'none' : 'flex', gap: 16, fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }

  return (
    <div style={s.wrap} id="pf-wrap">
      <style>{`
        /* Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400&display=swap');

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        #pf-wrap .pf-card { transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease; }
        #pf-wrap .pf-card:hover { transform: translateY(-4px); border-color: rgba(${aRgb},0.3); box-shadow: 0 8px 30px rgba(2,6,6,0.6); }
        #pf-wrap .pf-project-card { transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease; }
        #pf-wrap .pf-project-card:hover { transform: translateY(-3px); border-color: rgba(${aRgb},0.3); }
        #pf-wrap .pf-project-card img { transition: filter 400ms ease, transform 400ms ease; }
        #pf-wrap .pf-project-card:hover img { filter: brightness(0.95); }
        #pf-wrap .pf-project-link:hover { background: rgba(${aRgb},0.22); }
        #pf-wrap .pf-service-card { transition: border-color 300ms ease, transform 300ms ease; }
        #pf-wrap .pf-service-card:hover { transform: translateX(4px); border-color: rgba(${aRgb},0.35); }
        #pf-wrap .pf-skill-pill { transition: border-color 200ms, background 200ms; }
        #pf-wrap .pf-skill-pill:hover { border-color: rgba(${aRgb},0.3); background: rgba(${aRgb},0.05); }
        #pf-wrap nav span { color: rgba(255,255,255,0.35); cursor: pointer; }
        #pf-wrap nav span:hover { color: ${a}; transition: color 200ms; }
        #pf-wrap a.pf-btn:hover { background: ${a}; color: #050505; }
        #pf-wrap a.pf-ghost:hover { background: rgba(${aRgb},0.08); }
      `}</style>

      {/* NAV */}
      <nav style={navStyle}>
        <div style={s.logo}>&lt;<span style={{ color: a }}>/DevJ</span>&gt;</div>
        <div style={navLinksStyle}>
          {['about','skills','projects','services','methodology','contact'].map(id => (
            <span key={id} style={{ cursor:'pointer' }}
              onClick={() => document.getElementById(`pf-${id}`)?.scrollIntoView({ behavior:'smooth' })}>
              {id.toUpperCase()}
            </span>
          ))}
        </div>
        <button style={s.closeBtn} onClick={onClose}>✕ FERMER</button>
      </nav>

      {/* HERO */}
      <section id="pf-hero" style={heroSectionStyle}>
        <div style={heroTextStyle}>
          <div style={{ ...s.tag, display:'inline-block', marginBottom:16, fontSize:9, letterSpacing:'0.2em', color: a, border: `1px solid rgba(${aRgb},0.3)`, padding:'4px 12px' }}>
            DÉVELOPPEUR FRONTEND & IA
          </div>
          <h1 style={{ fontSize: isMobile ? 36 : 48, fontWeight:800, margin:'0 0 8px', lineHeight:1.1 }}>
            Frejus <span style={s.accent}>Kouadio</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, lineHeight:1.8, maxWidth:isMobile ? '100%' : 500, margin:'16px 0 32px' }}>
            Passionné par la création d'expériences web exceptionnelles et l'intelligence artificielle. De Yamoussoukro à l'international.
          </p>
          <div style={heroStatsStyle}>
            {[['6','Projets'],['2+','Années'],['100%','Satisfaction']].map(([v,l]) => (
              <div key={l} className="pf-card" style={s.card}>
                <div style={{ fontSize:22, color:a, fontWeight:700, fontFamily: 'Syne, sans-serif' }}>{v}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', letterSpacing:'0.2em', fontFamily: 'Space Mono, monospace' }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={heroButtonsStyle}>
            <a href="mailto:devfred58@gmail.com" style={{ background: a, color:'#000', padding:'10px 24px', fontSize:9, letterSpacing:'0.2em', textDecoration:'none', fontWeight:700, textAlign:'center' }}>ME CONTACTER</a>
            <a href="https://wa.me/2250767998373" target="_blank" rel="noopener" style={{ border:`1px solid rgba(${aRgb},0.4)`, color: a, padding:'10px 24px', fontSize:9, letterSpacing:'0.2em', textDecoration:'none', textAlign:'center' }}>WHATSAPP</a>
          </div>
        </div>
        <div style={{ flex:1, display:'flex', justifyContent:'center', width:isMobile ? '100%' : undefined }}>
          <img src="/asset/2026010323251463.png" alt="Frejus Kouadio"
            style={heroImageStyle} />
        </div>
      </section>

      {/* ABOUT */}
      <section id="pf-about" style={sectionStyle}>
        <div style={s.secNum}>01 // À PROPOS</div>
        <h2 style={s.secTitle}>À Propos de <span style={s.accent}>Moi</span></h2>
        <div style={aboutStyle}>
          <img src="/asset/2026010323253284.png" alt="DevJ"
            style={aboutImgStyle} />
          <div style={{ flex:1 }}>
            <p style={{ color:'rgba(255,255,255,0.7)', lineHeight:1.9, fontSize:13, marginBottom:16 }}>
              Développeur Frontend passionné, spécialisé en React et intelligence artificielle. Conception d'interfaces performantes, accessibles et esthétiques, avec un souci du détail et de la performance.
            </p>
            <p style={{ color:'rgba(255,255,255,0.5)', lineHeight:1.9, fontSize:12 }}>
              Actuellement en formation d'ingénieur en intelligence artificielle, basé à Yamoussoukro, Côte d'Ivoire. Disponible pour des projets locaux et internationaux.
            </p>
            <div style={aboutGridStyle}>
              {[['Email','devfred58@gmail.com'],['Téléphone','+225 0767998373'],['Localisation','Yamoussoukro, CI'],['Disponibilité','Ouverts aux projets']].map(([k,v]) => (
                <div key={k} className="pf-card" style={s.card}>
                  <div style={{ fontSize:8, color:`rgba(${aRgb},0.5)`, letterSpacing:'0.2em', marginBottom:4, fontFamily: 'Space Mono, monospace' }}>{k}</div>
                  <div style={{ fontSize:11, color:a, fontFamily: 'DM Sans, sans-serif' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="pf-skills" style={sectionStyle}>
        <div style={s.secNum}>02 // COMPÉTENCES</div>
        <h2 style={s.secTitle}>Compétences <span style={s.accent}>Techniques</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16 }}>
          {competences.map(cat => (
            <div key={cat.cat} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:28, WebkitBackdropFilter:'blur(12px)', backdropFilter:'blur(12px)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:14, color:'#F5F5F0' }}>{cat.cat}</div>
                <div style={{ fontFamily:'Space Mono, monospace', fontSize:9, color:`rgba(${aRgb},0.4)`, background:`rgba(${aRgb},0.06)`, border:`1px solid rgba(${aRgb},0.15)`, padding:'3px 8px', borderRadius:4 }}>{cat.items.length}</div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {cat.items.map(([nom, pct]) => {
                  const indicatorColor = pct >= 85 ? a : (pct >= 70 ? `rgba(${aRgb},0.5)` : `rgba(${aRgb},0.25)`)
                  return (
                    <div key={nom} className="pf-skill-pill" style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'8px 14px' }}>
                      <div style={{ width:6, height:6, borderRadius:6, background: indicatorColor, flexShrink:0 }} />
                      <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:13, color:'rgba(245,245,240,0.8)' }}>{nom}</div>
                      <div style={{ fontFamily:'Space Mono, monospace', fontSize:10, color:`rgba(${aRgb},0.55)`, marginLeft:'auto' }}>{pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="pf-projects" style={sectionStyle}>
        <div style={s.secNum}>03 // PROJETS</div>
        <h2 style={s.secTitle}>Mes Projets <span style={s.accent}>Réalisés</span></h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {projets.map((p, idx) => {
            const isEven = idx % 2 === 0
            return (
              <div key={p.num}
                className="pf-project-card"
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : (isEven ? 'row' : 'row-reverse'),
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  minHeight: isMobile ? 'auto' : 280,
                  transition: 'border-color 0.3s, transform 0.3s',
                }}
              >
                {/* IMAGE */}
                <div style={{
                  width: isMobile ? '100%' : '48%',
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: isMobile ? 200 : 280,
                }}>
                  <img
                    src={p.img}
                    alt={p.titre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      display: 'block',
                      transition: 'transform 0.6s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    onError={e => {
                      e.currentTarget.parentElement.style.background = `rgba(${aRgb},0.04)`
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  {/* Overlay dégradé latéral */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: isEven
                      ? 'linear-gradient(to right, transparent 60%, rgba(5,5,5,0.6) 100%)'
                      : 'linear-gradient(to left, transparent 60%, rgba(5,5,5,0.6) 100%)',
                    pointerEvents: 'none',
                  }} />
                  {/* Numéro flottant */}
                  <div style={{
                    position: 'absolute', top: 16,
                    left: isEven ? 'auto' : 16,
                    right: isEven ? 16 : 'auto',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: 11,
                    color: `rgba(${aRgb},0.5)`,
                    letterSpacing: '0.2em',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 10px',
                    borderRadius: 4,
                  }}>{p.num}</div>
                </div>

                {/* CONTENU */}
                <div style={{
                  flex: 1,
                  padding: isMobile ? '24px 20px' : '36px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 16,
                }}>
                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {p.tags.map(t => (
                      <span key={t} style={{
                        background: `rgba(${aRgb},0.08)`,
                        border: `1px solid rgba(${aRgb},0.2)`,
                        color: a,
                        padding: '4px 12px',
                        fontSize: 9,
                        letterSpacing: '0.18em',
                        borderRadius: 4,
                        fontFamily: 'Space Mono, monospace',
                      }}>{t}</span>
                    ))}
                  </div>

                  {/* Titre */}
                  <h3 style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 800,
                    fontSize: isMobile ? 22 : 28,
                    color: '#F5F5F0',
                    margin: 0,
                    lineHeight: 1.2,
                  }}>{p.titre}</h3>

                  {/* Ligne accent */}
                  <div style={{
                    width: 40, height: 2,
                    background: `linear-gradient(90deg, ${a}, transparent)`,
                  }} />

                  {/* Description */}
                  <p style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 300,
                    fontSize: 13,
                    color: 'rgba(245,245,240,0.55)',
                    lineHeight: 1.75,
                    margin: 0,
                  }}>{p.desc}</p>

                  {/* Bouton */}
                  {p.lien && (
                    <div>
                      <a
                        href={p.lien}
                        target="_blank"
                        rel="noopener"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: `rgba(${aRgb},0.1)`,
                          border: `1px solid rgba(${aRgb},0.3)`,
                          color: a,
                          fontFamily: 'Space Mono, monospace',
                          fontSize: 9,
                          letterSpacing: '0.15em',
                          padding: '10px 20px',
                          borderRadius: 8,
                          textDecoration: 'none',
                          transition: 'background 0.2s, border-color 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = `rgba(${aRgb},0.2)`
                          e.currentTarget.style.borderColor = a
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = `rgba(${aRgb},0.1)`
                          e.currentTarget.style.borderColor = `rgba(${aRgb},0.3)`
                        }}
                      >
                        VOIR LE PROJET →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SERVICES */}
      <section id="pf-services" style={sectionStyle}>
        <div style={s.secNum}>04 // SERVICES</div>
        <h2 style={s.secTitle}>Mes <span style={s.accent}>Services</span></h2>
        <div style={servicesGridStyle}>
          {services.map((sv, idx) => {
            const isPopular = !!sv.badge
            const cardStyle = { display:'flex', alignItems:'stretch', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', WebkitBackdropFilter:'blur(16px)', backdropFilter:'blur(16px)', borderRadius:16, overflow:'hidden', transition:'border-color 300ms, transform 300ms', padding:0 }
            if (isPopular) { cardStyle.border = `1px solid rgba(${aRgb},0.25)`; cardStyle.background = `rgba(${aRgb},0.04)` }
            const leftStyle = { width:260, flexShrink:0, background:`rgba(${aRgb},0.05)`, borderRight:'1px solid rgba(255,255,255,0.06)', padding:'28px 32px', display:'flex', flexDirection:'column', justifyContent:'center' }
            const rightStyle = { flex:1, padding:'28px 36px', display:'flex', flexWrap:'wrap', alignContent:'center', gap:'10px 24px' }
            const badgeStyle = { background:a, color:'#050505', fontFamily:'Space Mono, monospace', fontSize:8, fontWeight:700, letterSpacing:'0.1em', padding:'4px 10px', borderRadius:4, display:'inline-block', marginBottom:16 }
            const priceStyle = { fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:28, color:a, marginBottom:6 }
            const titleStyle = { fontFamily:'Syne, sans-serif', fontWeight:600, fontSize:16, color:'#F5F5F0', marginBottom:8 }
            const delayStyle = { fontFamily:'Space Mono, monospace', fontSize:9, color:`rgba(${aRgb},0.45)`, display:'flex', alignItems:'center', gap:6 }
            return (
              <div key={sv.titre} className="pf-service-card pf-card" style={cardStyle}>
                {sv.badge && <div style={{ position:'absolute', top:16, right:16 }}>{/* visual badge preserved for accessibility */}</div>}
                <div style={leftStyle}>
                  {sv.badge && <div style={badgeStyle}>{sv.badge}</div>}
                  <div style={priceStyle}>{sv.prix}</div>
                  <div style={titleStyle}>{sv.titre}</div>
                  <div style={delayStyle}><span style={{ color:a }}>●</span><span>Délai : {sv.delai}</span></div>
                  <a href="mailto:devfred58@gmail.com" style={{ marginTop:24, background:`rgba(${aRgb},0.1)`, border:`1px solid rgba(${aRgb},0.3)`, color:a, fontFamily:'Space Mono, monospace', fontSize:9, letterSpacing:'0.18em', padding:'10px 20px', borderRadius:8, textDecoration:'none', display:'block', textAlign:'center' }}>COMMANDER</a>
                </div>
                <div style={rightStyle}>
                  {sv.features.map((f, i) => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:10, width: isMobile ? '100%' : 'calc(50% - 12px)', marginBottom:8 }}>
                      <div style={{ width:18, height:18, flexShrink:0, background:`rgba(${aRgb},0.1)`, border:`1px solid rgba(${aRgb},0.25)`, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:a }}>✓</div>
                      <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:300, fontSize:12, color:'rgba(245,245,240,0.65)' }}>{f}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* METHODOLOGY */}
      <section id="pf-methodology" style={sectionStyle}>
        <div style={s.secNum}>05 // MÉTHODE</div>
        <h2 style={s.secTitle}>Ma <span style={s.accent}>Méthode</span> de Travail</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {etapes.map((e, i) => (
            <div key={e.n} className="pf-card" style={{ ...s.card, display:'flex', gap:24, alignItems:'flex-start' }}>
              <div style={{ fontSize:28, color:`rgba(${aRgb},0.2)`, fontWeight:700, minWidth:44, fontFamily: 'Syne, sans-serif' }}>{e.n}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:6, color:a }}>{e.titre}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>{e.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="pf-contact" style={sectionStyle}>
        <div style={s.secNum}>06 // CONTACT</div>
        <h2 style={s.secTitle}>Travaillons <span style={s.accent}>Ensemble</span></h2>

        {/* Phrase d'accroche */}
        <div style={{
          maxWidth: 600, marginBottom: 48,
          padding: '24px 32px',
          background: `rgba(${aRgb},0.04)`,
          border: `1px solid rgba(${aRgb},0.12)`,
          borderLeft: `3px solid ${a}`,
          borderRadius: 12,
        }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: 0 }}>
            Vous avez un projet web, une idée à concrétiser ou vous cherchez un développeur fullstack passionné par l'IA ? Je suis disponible pour des missions freelance, des collaborations et des opportunités à temps plein.
          </p>
        </div>

        {/* Disponibilité */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 40,
          padding: '12px 20px',
          background: `rgba(${aRgb},0.06)`,
          border: `1px solid rgba(${aRgb},0.2)`,
          borderRadius: 50,
          width: 'fit-content',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: a, animation: 'pulse 1.4s infinite' }} />
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: a, letterSpacing: '0.2em' }}>
            DISPONIBLE POUR DE NOUVEAUX PROJETS
          </span>
        </div>

        {/* Liens de contact */}
        <div style={contactGridStyle}>
          {[
            { label: 'Email', val: 'devfred58@gmail.com', href: 'mailto:devfred58@gmail.com', desc: 'Réponse sous 24h' },
            { label: 'Téléphone', val: '+225 0767998373', href: 'tel:+2250767998373', desc: 'Lun–Sam, 8h–18h' },
            { label: 'WhatsApp', val: 'Envoyer un message', href: 'https://wa.me/2250767998373', desc: 'Chat rapide' },
            { label: 'LinkedIn', val: 'Voir le profil', href: 'https://www.linkedin.com/in/frejus-kouadio-316238329', desc: 'Réseau professionnel' },
          ].map(({ label, val, href, desc }) => (
            <a key={label} href={href} target="_blank" rel="noopener"
              className="pf-card"
              style={{ ...s.card, textDecoration: 'none', display: 'block', transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${aRgb},0.35)`; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 8, color: `rgba(${aRgb},0.5)`, letterSpacing: '0.2em', fontFamily: 'Space Mono, monospace' }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 8, color: `rgba(${aRgb},0.35)`, fontFamily: 'Space Mono, monospace' }}>{desc}</div>
              </div>
              <div style={{ fontSize: 13, color: a, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{val}</div>
            </a>
          ))}
        </div>

        {/* CTA principal */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <a href="mailto:devfred58@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              background: a, color: '#050505',
              padding: '16px 40px',
              fontFamily: 'Space Mono, monospace', fontSize: 11,
              letterSpacing: '0.2em', fontWeight: 700,
              textDecoration: 'none', borderRadius: 8,
              transition: 'opacity 0.2s, transform 0.2s',
              boxShadow: `0 0 30px rgba(${aRgb},0.3)`,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            DÉMARRER UN PROJET →
          </a>
          <p style={{ marginTop: 16, fontFamily: 'Space Mono, monospace', fontSize: 9, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.15em' }}>
            Ou envoyez un message sur WhatsApp pour une réponse rapide
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '40px 80px',
        borderTop: `1px solid rgba(${aRgb},0.08)`,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F5F5F0', letterSpacing: '0.06em' }}>
            &lt;<span style={{ color: a }}>/DevJ</span>&gt;
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: `rgba(${aRgb},0.45)`, letterSpacing: '0.15em' }}>
            FRÉJUS KOUADIO · DEV FULLSTACK & IA
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {['GitHub', 'LinkedIn', 'WhatsApp'].map((item, i) => {
            const hrefs = ['https://github.com/devj-58', 'https://www.linkedin.com/in/frejus-kouadio-316238329', 'https://wa.me/2250767998373']
            return (
              <a key={item} href={hrefs[i]} target="_blank" rel="noopener"
                style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: `rgba(${aRgb},0.4)`, letterSpacing: '0.12em', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = a}
                onMouseLeave={e => e.currentTarget.style.color = `rgba(${aRgb},0.4)`}
              >{item}</a>
            )
          })}
        </div>

        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: `rgba(${aRgb},0.3)`, letterSpacing: '0.12em' }}>
          © {new Date().getFullYear()} · YAMOUSSOUKRO, CI
        </div>
      </footer>

    </div>
  )
})

export default Portfolio
