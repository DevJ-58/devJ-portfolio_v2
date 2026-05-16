import { useState } from 'react'
import { X, Settings } from 'lucide-react'
import utiliserTheme from '@/store/utiliserTheme'
import themes from '@/donnees/themes'

export default function PanneauParametres() {
  const [ouvert, setOuvert] = useState(false)
  const { themeActif, theme, changerTheme } = utiliserTheme()
  const a = theme.accent

  return (
    <>
      {/* Bouton icône paramètres — position fixed bas-droite */}
      <button
        onClick={() => setOuvert(o => !o)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 60,
          width: 36,
          height: 36,
          borderRadius: '8px',
          background: `rgba(${theme.accentRgb},0.08)`,
          border: `1px solid rgba(${theme.accentRgb},0.25)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backdropFilter: 'blur(12px)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = `rgba(${theme.accentRgb},0.15)`
          e.currentTarget.style.borderColor = a
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = `rgba(${theme.accentRgb},0.08)`
          e.currentTarget.style.borderColor = `rgba(${theme.accentRgb},0.25)`
        }}
      >
        <Settings size={15} color={a} />
      </button>

      {/* Panneau latéral */}
      {ouvert && (
        <div style={{
          position: 'fixed',
          bottom: 70,
          right: 24,
          zIndex: 60,
          width: 220,
          background: 'rgba(4,4,6,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid rgba(${theme.accentRgb},0.18)`,
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
          animation: 'fadeInUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>

          {/* Ligne lumineuse top */}
          <div style={{
            position: 'absolute', top: 0, left: 20, right: 20, height: 1,
            background: `linear-gradient(90deg,transparent,rgba(${theme.accentRgb},0.35),transparent)`
          }} />

          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            borderBottom: `1px solid rgba(${theme.accentRgb},0.08)`,
          }}>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 8,
              color: a,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}>// PARAMÈTRES</div>
            <button
              onClick={() => setOuvert(false)}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={12} color={`rgba(${theme.accentRgb},0.5)`} />
            </button>
          </div>

          {/* Section thème */}
          <div style={{ padding: '14px' }}>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 7,
              color: `rgba(${theme.accentRgb},0.4)`,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>INTERFACE</div>

            {/* Label mode couleur */}
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 8,
              color: `rgba(255,255,255,0.3)`,
              letterSpacing: '0.15em',
              marginBottom: 8,
            }}>MODE COULEUR</div>

            {/* Les 3 options de thème */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              {Object.values(themes).map(t => {
                const actif = themeActif === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => changerTheme(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: actif
                        ? `rgba(${t.accentRgb},0.1)`
                        : 'rgba(255,255,255,0.02)',
                      border: actif
                        ? `1px solid rgba(${t.accentRgb},0.4)`
                        : '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    {/* Pastille couleur */}
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: t.accent,
                      flexShrink: 0,
                      boxShadow: actif ? `0 0 8px ${t.accent}` : 'none',
                    }} />
                    <span style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 9,
                      color: actif ? t.accent : 'rgba(255,255,255,0.3)',
                      letterSpacing: '0.15em',
                    }}>{t.label}</span>
                    {actif && (
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: 8,
                        color: t.accent,
                        opacity: 0.7,
                      }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Séparateur */}
            <div style={{
              height: 1,
              background: `rgba(${theme.accentRgb},0.06)`,
              margin: '12px 0',
            }} />

            {/* Placeholder futures options */}
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 7,
              color: 'rgba(255,255,255,0.12)',
              letterSpacing: '0.15em',
              textAlign: 'center',
              padding: '4px 0',
            }}>+ OPTIONS À VENIR</div>
          </div>
        </div>
      )}
    </>
  )
}
