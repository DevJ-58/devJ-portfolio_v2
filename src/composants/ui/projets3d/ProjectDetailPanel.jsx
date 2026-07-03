import { useEffect, useState, useMemo } from 'react'
import { Html } from '@react-three/drei'

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function ProjectDetailPanel({ projet, categoryColor, onClose }) {
  const [mounted, setMounted] = useState(false)
  const borderRgba = useMemo(() => hexToRgba(categoryColor, 0.5), [categoryColor])
  const accentRgba = useMemo(() => hexToRgba(categoryColor, 0.3), [categoryColor])

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <Html position={[0, 0, 1.8]} center distanceFactor={6} occlude={false} style={{ pointerEvents: 'auto' }}>
      <div style={{ position: 'relative' }}>
        <style>{`
          @keyframes hudPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
          @keyframes scanMove { 0%{transform: translateX(-100%)} 100%{transform: translateX(100%)} }
        `}</style>

        <div style={{
          width: 320,
          padding: 28,
          background: 'rgba(5,5,5,0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${borderRgba}`,
          clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)',
          color: '#F5F5F0',
          position: 'relative',
          overflow: 'hidden',
          transform: mounted ? 'rotateY(0deg) scale(1)' : 'rotateY(90deg) scale(0.84)',
          opacity: mounted ? 1 : 0,
          transition: 'transform 0.4s ease, opacity 0.4s ease',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 28, height: 28,
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.8)',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              zIndex: 2,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            aria-label="Fermer"
          >
            ×
          </button>

          <div style={{
            position: 'absolute', top: 16, left: 16,
            width: 10, height: 10,
            borderTop: `1px solid ${categoryColor}`,
            borderLeft: `1px solid ${categoryColor}`,
          }} />
          <div style={{
            position: 'absolute', top: 16, right: 16,
            width: 10, height: 10,
            borderTop: `1px solid ${categoryColor}`,
            borderRight: `1px solid ${categoryColor}`,
          }} />
          <div style={{
            position: 'absolute', bottom: 16, left: 16,
            width: 10, height: 10,
            borderBottom: `1px solid ${categoryColor}`,
            borderLeft: `1px solid ${categoryColor}`,
          }} />
          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            width: 10, height: 10,
            borderBottom: `1px solid ${categoryColor}`,
            borderRight: `1px solid ${categoryColor}`,
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 8,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: categoryColor,
              opacity: 0.88,
            }}>
              // PROJET_{projet.num}
            </span>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: categoryColor,
              boxShadow: `0 0 8px ${accentRgba}`,
              animation: 'hudPulse 1.6s ease-in-out infinite',
            }} />
          </div>

          <h2 style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 800,
            fontSize: 21,
            lineHeight: 1.05,
            margin: 0,
            marginBottom: 16,
          }}>
            {projet.titre}
          </h2>

          <div style={{
            position: 'relative',
            width: '100%',
            height: 1,
            marginBottom: 22,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: '150%',
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${categoryColor} 40%, ${categoryColor} 60%, transparent 100%)`,
              transform: 'translateX(-100%)',
              animation: 'scanMove 4.5s linear infinite',
            }} />
          </div>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 300,
            fontSize: 12,
            lineHeight: 1.7,
            color: 'rgba(245,245,240,0.55)',
            margin: 0,
            marginBottom: 22,
          }}>
            {projet.desc}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 8,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.38)',
            }}>
              stack
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
            {projet.tags.map((tag) => (
              <span key={tag} style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.12)`,
                color: '#F5F5F0',
                padding: '6px 12px',
                borderRadius: 10,
                fontFamily: 'Space Mono, monospace',
                fontSize: 9,
                letterSpacing: '0.12em',
              }}>
                {tag}
              </span>
            ))}
          </div>

          {projet.lien ? (
            <a
              href={projet.lien}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '14px 18px',
                border: `1px solid ${categoryColor}`,
                color: categoryColor,
                background: 'transparent',
                fontFamily: 'Space Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textDecoration: 'none',
                clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)',
                transition: 'background 0.2s ease, color 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = categoryColor
                e.currentTarget.style.color = '#050505'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = categoryColor
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              ACCÉDER AU PROJET →
            </a>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '14px 18px',
              border: `1px solid rgba(255,255,255,0.12)`,
              color: 'rgba(255,255,255,0.55)',
              background: 'rgba(255,255,255,0.03)',
              fontFamily: 'Space Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)',
            }}>
              PROJET PRIVÉ
            </div>
          )}
        </div>
      </div>
    </Html>
  )
}
