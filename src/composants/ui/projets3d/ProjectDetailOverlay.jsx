import React from 'react'

const statusColors = {
  'EN LIGNE': '#5DCAA5',
  'EN PRODUCTION': '#D4537E',
  'PRIVÉ': '#898A8F',
}

export default function ProjectDetailOverlay({ projet, categoryColor, onClose }) {
  const statusColor = statusColors[projet.status] || '#ffffff'

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(820px, 90vw)',
          maxWidth: '100%',
          background: 'rgba(5,5,5,0.97)',
          borderRadius: 20,
          border: `1px solid rgba(${parseInt(categoryColor.slice(1, 3), 16)}, ${parseInt(categoryColor.slice(3, 5), 16)}, ${parseInt(categoryColor.slice(5, 7), 16)}, 0.35)`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${categoryColor}1A`,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
          animation: 'projectDetailFadeIn 0.25s ease forwards',
        }}
      >
        <div style={{ position: 'relative', minHeight: 340, overflow: 'hidden' }}>
          <img
            src={projet.img}
            alt={projet.titre}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.75) 100%)',
          }} />
          <div style={{
            position: 'absolute',
            top: 18,
            left: 18,
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.65)',
            borderRadius: 999,
            fontFamily: 'Space Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#fff',
            pointerEvents: 'none',
          }}>
            {projet.num}
          </div>
          <div style={{
            position: 'absolute',
            left: 18,
            bottom: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.55)',
            borderRadius: 999,
            fontFamily: 'Space Mono, monospace',
            fontSize: 11,
            color: '#fff',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
            <span>{projet.status}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', padding: 32, gap: 18, minHeight: 340, color: '#F5F5F0' }}>
          <button
            onClick={onClose}
            style={{
              alignSelf: 'flex-end',
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
            aria-label="Fermer le détail du projet"
          >
            ×
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: categoryColor, display: 'inline-block' }} />
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
              {projet.categorie}
            </span>
          </div>

          <h2 style={{
            margin: 0,
            fontFamily: 'Fraunces, serif',
            fontWeight: 800,
            fontSize: 28,
            lineHeight: 1.05,
          }}>
            {projet.titre}
          </h2>

          <div style={{ width: 44, height: 3, borderRadius: 999, background: `linear-gradient(90deg, ${categoryColor}, rgba(255,255,255,0.05))` }} />

          <p style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 300,
            fontSize: 13,
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.84)',
          }}>
            {projet.desc}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              Stack
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {projet.tags.map((tag) => (
                <span key={tag} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            {projet.lien ? (
              <a
                href={projet.lien}
                target="_blank"
                rel="noreferrer noopener"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 999,
                  background: categoryColor,
                  color: '#050505',
                  textDecoration: 'none',
                  fontFamily: 'Space Mono, monospace',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
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
                padding: '14px 20px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Space Mono, monospace',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}>
                PROJET PRIVÉ
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes projectDetailFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 860px) {
          div[style*="display: grid"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="minHeight: 340px"] {
            min-height: 240px !important;
          }
        }
      `}</style>
    </div>
  )
}
