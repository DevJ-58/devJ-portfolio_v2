import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'

const Portfolio = forwardRef(function Portfolio({ onClose }, ref) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [servicesOuverts, setServicesOuverts] = useState({})
  const wrapRef = useRef(null)

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
        el.style.outline = '2px solid rgba(16,185,129,0.7)'
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
    wrap: { fontFamily: 'Space Mono, monospace', background: '#050505', color: '#fff', overflowY: 'auto', height: '100%', scrollBehavior: 'smooth' },
    nav: { position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,5,5,0.95)', borderBottom: '1px solid rgba(16,185,129,0.15)', padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { color: '#10b981', fontSize: 16, fontWeight: 700, letterSpacing: '0.1em' },
    closeBtn: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '6px 14px', cursor: 'pointer', fontSize: 9, letterSpacing: '0.2em' },
    section: { padding: '80px 60px', borderBottom: '1px solid rgba(16,185,129,0.08)' },
    secNum: { color: 'rgba(16,185,129,0.3)', fontSize: 11, letterSpacing: '0.3em' },
    secTitle: { fontSize: 28, fontWeight: 700, color: '#fff', margin: '8px 0 40px', letterSpacing: '0.05em' },
    accent: { color: '#10b981' },
    tag: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', padding: '3px 10px', fontSize: 9, letterSpacing: '0.15em', marginRight: 6 },
    card: { border: '1px solid rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.02)', padding: 24, marginBottom: 20 },
    barWrap: { background: 'rgba(16,185,129,0.1)', height: 3, borderRadius: 2, margin: '6px 0 2px', width: '100%' },
  }

  const navStyle = { ...s.nav, padding: isMobile ? '0 12px' : s.nav.padding }
  const sectionStyle = { ...s.section, padding: isMobile ? '48px 16px' : s.section.padding }
  const heroSectionStyle = { ...sectionStyle, minHeight: '70vh', display: 'flex', alignItems: 'center', gap: isMobile ? 32 : 60, flexDirection: isMobile ? 'column' : 'row' }
  const heroTextStyle = { flex: 1, width: '100%' }
  const heroImageStyle = { display: isMobile ? 'none' : 'block', maxHeight: 400, maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 40px rgba(16,185,129,0.2))' }
  const heroStatsStyle = { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3,1fr)' : 'repeat(3,auto)', gap: 12, marginBottom: 32 }
  const heroButtonsStyle = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, width: isMobile ? '100%' : 'auto' }
  const aboutStyle = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 48, alignItems: 'flex-start' }
  const aboutImgStyle = { width: isMobile ? '100%' : 220, maxHeight: isMobile ? 200 : undefined, objectFit: 'cover', objectPosition: 'top', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.15))' }
  const aboutGridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginTop: 24 }
  const skillsGridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }
  const projectsGridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }
  const projectImageStyle = { width: '100%', height: isMobile ? 140 : 160, objectFit: 'cover', display: 'block' }
  const servicesGridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 24 }
  const contactGridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }
  const navLinksStyle = { display: isMobile ? 'none' : 'flex', gap: 16, fontSize: 9, color: 'rgba(16,185,129,0.5)', letterSpacing: '0.15em' }

  return (
    <div style={s.wrap} id="pf-wrap">

      {/* NAV */}
      <nav style={navStyle}>
        <div style={s.logo}>&lt;/DevJ&gt;</div>
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
          <div style={{ ...s.tag, display:'inline-block', marginBottom:16, fontSize:9, letterSpacing:'0.2em', color:'#10b981', border:'1px solid rgba(16,185,129,0.3)', padding:'4px 12px' }}>
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
              <div key={l} style={s.card}>
                <div style={{ fontSize:22, color:'#10b981', fontWeight:700 }}>{v}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', letterSpacing:'0.2em' }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={heroButtonsStyle}>
            <a href="mailto:devfred58@gmail.com" style={{ background:'#10b981', color:'#000', padding:'10px 24px', fontSize:9, letterSpacing:'0.2em', textDecoration:'none', fontWeight:700, textAlign:'center' }}>ME CONTACTER</a>
            <a href="https://wa.me/2250767998373" target="_blank" rel="noopener" style={{ border:'1px solid rgba(16,185,129,0.4)', color:'#10b981', padding:'10px 24px', fontSize:9, letterSpacing:'0.2em', textDecoration:'none', textAlign:'center' }}>WHATSAPP</a>
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
                <div key={k} style={s.card}>
                  <div style={{ fontSize:8, color:'rgba(16,185,129,0.5)', letterSpacing:'0.2em', marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:11, color:'#10b981' }}>{v}</div>
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
        <div style={skillsGridStyle}>
          {competences.map(cat => (
            <div key={cat.cat} style={s.card}>
              <div style={{ fontSize:9, color:'#10b981', letterSpacing:'0.2em', marginBottom:16 }}>{cat.cat.toUpperCase()}</div>
              {cat.items.map(([nom, pct]) => (
                <div key={nom} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:4 }}>
                    <span>{nom}</span><span style={{ color:'#10b981' }}>{pct}%</span>
                  </div>
                  <div style={s.barWrap}>
                    <div style={{ width:`${pct}%`, height:'100%', background:'#10b981', borderRadius:2 }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="pf-projects" style={sectionStyle}>
        <div style={s.secNum}>03 // PROJETS</div>
        <h2 style={s.secTitle}>Mes Projets <span style={s.accent}>Réalisés</span></h2>
        <div style={projectsGridStyle}>
          {projets.map(p => (
            <div key={p.num} style={{ ...s.card, padding:0, overflow:'hidden' }}>
              <img src={p.img} alt={p.titre} style={projectImageStyle}
                onError={e => { e.target.style.display='none' }} />
              <div style={{ padding:20 }}>
                <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
                  {p.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}
                </div>
                <div style={{ fontSize:9, color:'rgba(16,185,129,0.5)', marginBottom:6 }}>{p.num}</div>
                <h3 style={{ fontSize:14, margin:'0 0 8px', color:'#fff' }}>{p.titre}</h3>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>{p.desc}</p>
                {p.lien && (
                  <a href={p.lien} target="_blank" rel="noopener"
                    style={{ display:'inline-block', marginTop:12, fontSize:9, color:'#10b981', letterSpacing:'0.15em', textDecoration:'none', border:'1px solid rgba(16,185,129,0.3)', padding:'4px 12px' }}>
                    VOIR LE PROJET →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="pf-services" style={sectionStyle}>
        <div style={s.secNum}>04 // SERVICES</div>
        <h2 style={s.secTitle}>Mes <span style={s.accent}>Services</span></h2>
        <div style={servicesGridStyle}>
          {services.map(sv => (
            <div key={sv.titre} style={{ ...s.card, position:'relative' }}>
              {sv.badge && (
                <div style={{ position:'absolute', top:16, right:16, background:'#10b981', color:'#000', fontSize:8, padding:'2px 8px', fontWeight:700, letterSpacing:'0.1em' }}>
                  {sv.badge}
                </div>
              )}
              <div style={{ fontSize:16, color:'#10b981', fontWeight:700, marginBottom:4 }}>{sv.prix}</div>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{sv.titre}</div>
              <div style={{ fontSize:9, color:'rgba(16,185,129,0.5)', marginBottom:16 }}>Délai : {sv.delai}</div>
              {sv.features.map(f => (
                <div key={f} style={{ fontSize:10, color:'rgba(255,255,255,0.6)', marginBottom:6, display:'flex', gap:8 }}>
                  <span style={{ color:'#10b981' }}>✓</span>{f}
                </div>
              ))}
              <a href="mailto:devfred58@gmail.com"
                style={{ display:'block', marginTop:20, textAlign:'center', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', padding:'8px', fontSize:9, letterSpacing:'0.2em', textDecoration:'none' }}>
                COMMANDER
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* METHODOLOGY */}
      <section id="pf-methodology" style={sectionStyle}>
        <div style={s.secNum}>05 // MÉTHODE</div>
        <h2 style={s.secTitle}>Ma <span style={s.accent}>Méthode</span> de Travail</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {etapes.map((e, i) => (
            <div key={e.n} style={{ ...s.card, display:'flex', gap:24, alignItems:'flex-start' }}>
              <div style={{ fontSize:24, color:'rgba(16,185,129,0.3)', fontWeight:700, minWidth:40 }}>{e.n}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:6, color:'#10b981' }}>{e.titre}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>{e.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="pf-contact" style={sectionStyle}>
        <div style={s.secNum}>06 // CONTACT</div>
        <h2 style={s.secTitle}>Me <span style={s.accent}>Contacter</span></h2>
        <div style={contactGridStyle}>
          {[
            ['Email','devfred58@gmail.com','mailto:devfred58@gmail.com'],
            ['Téléphone','+225 0767998373','tel:+2250767998373'],
            ['WhatsApp','Envoyer un message','https://wa.me/2250767998373'],
            ['LinkedIn','Voir le profil','https://www.linkedin.com/in/frejus-kouadio-316238329'],
          ].map(([label, val, href]) => (
            <a key={label} href={href} target="_blank" rel="noopener"
              style={{ ...s.card, textDecoration:'none', display:'block', transition:'border-color 0.2s' }}>
              <div style={{ fontSize:8, color:'rgba(16,185,129,0.5)', letterSpacing:'0.2em', marginBottom:6 }}>{label.toUpperCase()}</div>
              <div style={{ fontSize:12, color:'#10b981' }}>{val}</div>
            </a>
          ))}
        </div>
      </section>

    </div>
  )
})

export default Portfolio
