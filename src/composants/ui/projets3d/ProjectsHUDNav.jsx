import { useRef } from 'react'

export default function ProjectsHUDNav({ projets, projetActifIndex, onNaviguerVers, categories }) {
  const lastWheel = useRef(0)

  const currentProjet = projets[projetActifIndex]
  const categoryColor = currentProjet ? categories[currentProjet.type]?.color || '#5d94c3' : '#5d94c3'
  const progress = projets.length > 1 ? (projetActifIndex / (projets.length - 1)) * 100 : 0

  const handleWheel = (event) => {
    const now = performance.now()
    if (now - lastWheel.current < 400) return
    lastWheel.current = now

    event.preventDefault()
    const direction = event.deltaY > 0 ? 1 : -1
    let nextIndex = projetActifIndex + direction
    if (nextIndex < 0) nextIndex = projets.length - 1
    if (nextIndex >= projets.length) nextIndex = 0
    onNaviguerVers(nextIndex)
  }

  return (
    <div
      onWheel={handleWheel}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '18px 36px',
        background: 'rgba(10, 10, 10, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        pointerEvents: 'auto',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: categoryColor, transition: 'width 0.25s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {projets.map((projet, index) => {
          const isActive = index === projetActifIndex
          return (
            <button
              key={projet.num}
              type="button"
              onClick={() => onNaviguerVers(index)}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                color: isActive ? categoryColor : 'rgba(255,255,255,0.5)',
              }}
            >
              <span style={{
                width: isActive ? 20 : 12,
                height: isActive ? 20 : 12,
                borderRadius: '50%',
                background: isActive ? categoryColor : 'rgba(255,255,255,0.08)',
                border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.18)',
                boxShadow: isActive ? `0 0 18px ${categoryColor}` : 'none',
                transition: 'all 0.2s ease',
              }} />
              <span style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 8,
                letterSpacing: '0.24em',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
              }}>
                {String(index + 1).padStart(2, '0')}
              </span>
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <span style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 8,
            letterSpacing: '0.28em',
            color: categoryColor,
            textTransform: 'uppercase',
          }}>
            // {currentProjet?.titre || 'Projet actif'} · {categories[currentProjet?.type]?.label || ''}
          </span>
          <span style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 8,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.35)',
          }}>
            {currentProjet ? currentProjet.categorie.toUpperCase() : ''}
          </span>
        </div>
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 8,
          letterSpacing: '0.28em',
          color: 'rgba(255,255,255,0.35)',
          whiteSpace: 'nowrap',
        }}>
          {String(projetActifIndex + 1).padStart(2, '0')} / {String(projets.length).padStart(2, '0')}
        </div>
      </div>
    </div>
  )
}
