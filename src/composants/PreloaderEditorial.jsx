import { useEffect, useRef, useState } from 'react'
import utiliserTheme from '@/store/utiliserTheme'
import devjlogImg from '@/assets/devjlog.png'

const DUREE_TOTALE = 7000 // 30 secondes
const DUREE_SORTIE = 1000

export default function PreloaderEditorial({ onTermine }) {
  const { theme, mode, getThemeEffectif } = utiliserTheme()
  const eff = getThemeEffectif ? getThemeEffectif() : theme
  const isLight = mode === 'light'
  const a = theme.accent
  const aRgb = theme.accentRgb

  const [sortie, setSortie] = useState(false)
  const [pct, setPct] = useState(0)
  const [motIdx, setMotIdx] = useState(0)
  const [sectionsActives, setSectionsActives] = useState(Array(4).fill(false))
  const [barres, setBarres] = useState(Array(24).fill(3))
  const [isMobile, setIsMobile] = useState(false)
  const fillRef = useRef(null)
  const loaderRef = useRef(null)
  const irisRef = useRef(null)
  const debutRef = useRef(Date.now())

  const mots = [
    'INITIALISATION', 'CONNEXION AU SERVEUR', 'CHARGEMENT DES ASSETS',
    'COMPILATION', 'OPTIMISATION DES IMAGES', 'RENDU DES COMPOSANTS',
    'VÉRIFICATION', 'MISE EN PAGE', 'FINALISATION', 'PRÊT'
  ]
  const caracteres = ['<', '/', 'D', 'e', 'v', 'J', '>']
  const sections = ['PORTRAIT', 'PARCOURS', 'PROJETS', 'CONTACT']

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const timers = []
    const intervals = []
    debutRef.current = Date.now()

    sections.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setSectionsActives(prev => {
          const copy = [...prev]
          copy[i] = true
          return copy
        })
      }, (DUREE_TOTALE / 5) * (i + 1)))
    })

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - debutRef.current
      const pctLocal = Math.min(100, Math.round((elapsed / DUREE_TOTALE) * 100))
      setPct(pctLocal)
      if (fillRef.current) {
        fillRef.current.style.clipPath = `inset(${100 - pctLocal}% 0 0 0)`
      }
      if (pctLocal >= 100) clearInterval(progressInterval)
    }, 80)
    intervals.push(progressInterval)

    const motInterval = setInterval(() => {
      setMotIdx(prev => (prev + 1) % mots.length)
    }, DUREE_TOTALE / mots.length)
    intervals.push(motInterval)

    const barInterval = setInterval(() => {
      setBarres(prev => prev.map(() => 3 + Math.random() * 13))
    }, 160)
    intervals.push(barInterval)

    timers.push(setTimeout(() => {
      clearInterval(progressInterval)
      clearInterval(motInterval)
      clearInterval(barInterval)
    }, DUREE_TOTALE))

    timers.push(setTimeout(() => {
      setSortie(true)
      if (loaderRef.current) {
        loaderRef.current.style.transform = 'scale(1.08)'
        loaderRef.current.style.opacity = '0'
      }
      if (irisRef.current) {
        irisRef.current.style.clipPath = 'circle(0% at 50% 50%)'
      }
    }, DUREE_TOTALE))

    timers.push(setTimeout(() => {
      onTermine && onTermine()
    }, DUREE_TOTALE + DUREE_SORTIE))

    return () => {
      timers.forEach(clearTimeout)
      intervals.forEach(clearInterval)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      pointerEvents: sortie ? 'none' : 'auto',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,800;1,9..144,500&family=Space+Mono:wght@400;700&display=swap');
      `}</style>

      <div ref={loaderRef} style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isMobile ? '20px 18px 24px' : '32px 40px',
        boxSizing: 'border-box',
        fontFamily: 'Space Mono, monospace',
        transition: 'transform 0.9s cubic-bezier(.7,0,.3,1), opacity 0.7s ease 0.1s',
      }}>

        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}>
          <img
            src={devjlogImg}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
              filter: 'blur(4px) saturate(1.15)',
              transform: 'scale(1.35)',
              opacity: isLight ? 0.45 : 0.7,
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${eff.fond} 0%, ${eff.fond} 25%, transparent 75%)`,
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: eff.fond,
            opacity: isLight ? 0.25 : 0.35,
          }} />
        </div>

        <div style={{ position: 'absolute', inset: isMobile ? 20 : 32, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: isMobile ? 10 : 14, height: isMobile ? 10 : 14, borderTop: `1px solid rgba(${aRgb},0.5)`, borderLeft: `1px solid rgba(${aRgb},0.5)` }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: isMobile ? 10 : 14, height: isMobile ? 10 : 14, borderTop: `1px solid rgba(${aRgb},0.5)`, borderRight: `1px solid rgba(${aRgb},0.5)` }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: isMobile ? 10 : 14, height: isMobile ? 10 : 14, borderBottom: `1px solid rgba(${aRgb},0.5)`, borderLeft: `1px solid rgba(${aRgb},0.5)` }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: isMobile ? 10 : 14, height: isMobile ? 10 : 14, borderBottom: `1px solid rgba(${aRgb},0.5)`, borderRight: `1px solid rgba(${aRgb},0.5)` }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, border: `1px solid ${a}`, transform: 'rotate(45deg)' }} />
            <span style={{ fontSize: isMobile ? 8 : 11, letterSpacing: '0.35em', color: isLight ? 'rgba(20,20,20,0.4)' : 'rgba(242,240,236,0.4)' }}>
              VOL. I · N°01
            </span>
          </div>
          <span style={{ fontSize: isMobile ? 8 : 11, letterSpacing: '0.2em', color: isLight ? 'rgba(20,20,20,0.3)' : 'rgba(242,240,236,0.3)' }}>
            ÉD. {String(pct).padStart(3, '0')}
          </span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            position: 'relative',
            display: 'inline-block',
            fontFamily: 'Fraunces, serif',
            fontWeight: 800,
            fontSize: isMobile ? 'clamp(44px, 16vw, 84px)' : 'clamp(72px, 13vw, 128px)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            <div style={{ opacity: 1 }}>
              {caracteres.map((c, i) => (
                <span key={i} style={{
                  color: (i === 0 || i === 6)
                    ? (isLight ? 'rgba(20,20,20,0.14)' : 'rgba(242,240,236,0.14)')
                    : `rgba(${aRgb},0.14)`,
                }}>
                  {c}
                </span>
              ))}
            </div>

            <div ref={fillRef} style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              clipPath: 'inset(100% 0 0 0)',
            }}>
              {caracteres.map((c, i) => (
                <span key={i} style={{ color: (i === 0 || i === 6) ? eff.texte : a }}>
                  {c}
                </span>
              ))}
              <div style={{
                position: 'absolute',
                left: -4, right: -4, top: 0, height: 3,
                background: `linear-gradient(90deg, transparent, rgba(${aRgb},0.9), transparent)`,
                boxShadow: `0 0 8px 1px rgba(${aRgb},0.6)`,
              }} />
            </div>
          </div>

          <div style={{
            marginTop: isMobile ? 10 : 14,
            fontSize: isMobile ? 9 : 11,
            letterSpacing: isMobile ? '0.3em' : '0.5em',
            color: `rgba(${aRgb},0.65)`,
          }}>
            DÉVELOPPEUR LOGICIEL · UI/UX
          </div>

          <div style={{
            marginTop: isMobile ? 18 : 28,
            fontSize: isMobile ? 13 : 15,
            letterSpacing: '0.25em',
            color: `rgba(${aRgb},0.7)`,
          }}>
            {String(pct).padStart(2, '0')}%
          </div>

          <div style={{
            marginTop: isMobile ? 16 : 24,
            display: 'flex',
            gap: isMobile ? 10 : 14,
            justifyContent: 'center',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            fontSize: isMobile ? 8 : 9,
            letterSpacing: '0.15em',
          }}>
            {sections.map((s, i) => (
              <span key={s} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{
                  color: sectionsActives[i]
                    ? `rgba(${aRgb},0.75)`
                    : (isLight ? 'rgba(20,20,20,0.2)' : 'rgba(242,240,236,0.2)'),
                  transition: 'color 0.3s',
                }}>
                  {s}
                </span>
                {i < sections.length - 1 && (
                  <span style={{ color: isLight ? 'rgba(20,20,20,0.15)' : 'rgba(242,240,236,0.15)' }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0, marginBottom: isMobile ? 10 : 14 }}>
            <span style={{ fontSize: isMobile ? 9 : 10, letterSpacing: '0.15em', color: isLight ? 'rgba(20,20,20,0.3)' : 'rgba(242,240,236,0.3)' }}>
              CI · 2026
            </span>
            <span style={{ fontSize: isMobile ? 9 : 10, letterSpacing: '0.2em', color: isLight ? 'rgba(20,20,20,0.35)' : 'rgba(242,240,236,0.35)' }}>
              {mots[motIdx]}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? 2 : 3, justifyContent: 'center', height: isMobile ? 18 : 24 }}>
            {barres.map((h, i) => (
              <div key={i} style={{
                width: isMobile ? 2 : 3,
                height: h * (isMobile ? 1.2 : 1.5),
                background: `rgba(${aRgb},${0.25 + (h / 16) * 0.5})`,
                transition: 'height 0.15s ease',
              }} />
            ))}
          </div>
        </div>
      </div>

      <div ref={irisRef} style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: eff.fond,
        clipPath: 'circle(150% at 50% 50%)',
        transition: 'clip-path 1s cubic-bezier(.7,0,.3,1)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

