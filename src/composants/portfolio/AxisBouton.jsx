import { useState } from 'react'
import utiliserTheme from '@/store/utiliserTheme'

// Bouton flottant « Parler à AXIS » (page /portfolio en accès direct) :
// ramène vers l'accueil où AXIS prend le relais.
export default function AxisBouton({ isMobile, a, aRgb, navigate, eff }) {
  const [survol, setSurvol] = useState(false)
  const isLight = utiliserTheme((s) => s.mode) === 'light'
  // Texte en accent semi-transparent : en mode clair, opacité relevée pour rester lisible
  const ta = (o) => `rgba(${aRgb},${isLight ? Math.min(1, 0.72 + o * 0.28) : o})`

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? 16 : 24,
      right: isMobile ? 12 : 24,
      zIndex: 40,
    }}>
      <style>{`
        @keyframes axisRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes axisPulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        @keyframes axisScan {
          from { top: 0%; }
          to   { top: 100%; }
        }
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {survol && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? 52 : 62,
          left: 0,
          width: isMobile ? 200 : 220,
          background: eff.glassOverlay,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid rgba(${aRgb},0.25)`,
          borderRadius: 10,
          padding: '10px 12px',
          animation: 'tooltipIn 0.2s ease forwards',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 12, right: 12, height: 1,
            background: `rgba(${aRgb},0.3)`,
          }} />
          <div style={{
            position: 'absolute',
            bottom: -5, left: 18,
            width: 8, height: 5,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: `rgba(${aRgb},0.3)`,
          }} />
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 8,
            color: ta(0.5),
            letterSpacing: '0.2em',
            marginBottom: 5,
          }}>AXIS // IA</div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: isMobile ? 10 : 11,
            color: eff.textMedium,
            lineHeight: 1.55,
          }}>
            Optimisez votre expérience en conversant avec AXIS, l'IA de Fréjus.
          </div>
        </div>
      )}

      <div
        onClick={() => navigate('/')}
        onMouseEnter={() => setSurvol(true)}
        onMouseLeave={() => setSurvol(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 0 : 10,
          cursor: 'pointer',
        }}
      >
        <div style={{
          position: 'relative',
          width: isMobile ? 44 : 52,
          height: isMobile ? 44 : 52,
          flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', inset: -4,
            borderRadius: '50%',
            border: `1px solid rgba(${aRgb},0.4)`,
            animation: 'axisRing 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: -4,
            borderRadius: '50%',
            border: `1px solid rgba(${aRgb},0.2)`,
            animation: 'axisRing 2s ease-out infinite',
            animationDelay: '0.7s',
            pointerEvents: 'none',
          }} />

          <div style={{
            width: '100%', height: '100%',
            borderRadius: '50%',
            background: survol
              ? `rgba(${aRgb},0.12)`
              : eff.glassOverlay,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid rgba(${aRgb},${survol ? '0.6' : '0.35'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: survol
              ? `0 0 28px rgba(${aRgb},0.35)`
              : `0 0 16px rgba(${aRgb},0.15)`,
            transition: 'all 0.25s',
          }}>
            <div style={{
              position: 'absolute',
              left: 0, right: 0, height: 1,
              background: `rgba(${aRgb},0.45)`,
              animation: 'axisScan 2s linear infinite',
              zIndex: 2, pointerEvents: 'none',
            }} />

            <svg
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              viewBox="0 0 24 24"
              fill="none"
              style={{ position: 'relative', zIndex: 3 }}
            >
              <polygon
                points="12,2 20,7 20,17 12,22 4,17 4,7"
                stroke={a}
                strokeWidth="1.2"
                fill={`rgba(${aRgb},0.1)`}
              />
              <circle cx="12" cy="12" r="3" fill={a}
                style={{ animation: 'axisPulse 1.8s infinite' }}
              />
            </svg>
          </div>

          <div style={{
            position: 'absolute', bottom: 1, right: 1,
            width: isMobile ? 7 : 8, height: isMobile ? 7 : 8,
            borderRadius: '50%',
            background: a,
            border: `1.5px solid ${eff.fond}`,
            boxShadow: `0 0 6px ${a}`,
            animation: 'axisPulse 1.4s infinite',
            zIndex: 4,
          }} />
        </div>

        {!isMobile && (
          <div style={{
            background: eff.navOverlay,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid rgba(${aRgb},${survol ? '0.35' : '0.18'})`,
            borderRadius: 10,
            padding: '8px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            transition: 'border-color 0.25s',
          }}>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 7,
              color: ta(0.45),
              letterSpacing: '0.22em',
            }}>AXIS // IA</div>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 9,
              color: a,
              letterSpacing: '0.15em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{
                width: 5, height: 5,
                borderRadius: '50%',
                background: a,
                display: 'inline-block',
                animation: 'axisPulse 1.4s infinite',
              }} />
              PARLER À AXIS
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
