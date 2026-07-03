import { useRef } from 'react'

export default function ProjectsVerticalRail({ projets, projetApercuIndex, onNaviguerApercu, categories, isMobile }) {
  const lastWheel = useRef(0)
  const touchStart = useRef(null)
  const activeProjet = projets[projetApercuIndex]
  const categoryColor = activeProjet ? categories[activeProjet.type]?.color || '#5d94c3' : '#5d94c3'

  const goTo = (direction) => {
    let nextIndex = projetApercuIndex + direction
    if (nextIndex < 0) nextIndex = projets.length - 1
    if (nextIndex >= projets.length) nextIndex = 0
    onNaviguerApercu(nextIndex)
  }

  const handleWheel = (event) => {
    const now = performance.now()
    if (now - lastWheel.current < 400) return
    lastWheel.current = now
    event.preventDefault()
    goTo(event.deltaY > 0 ? 1 : -1)
  }

  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    const threshold = 30
    if (isMobile) {
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
        goTo(dx < 0 ? 1 : -1)
      }
    } else {
      if (Math.abs(dy) > threshold && Math.abs(dy) > Math.abs(dx)) {
        goTo(dy > 0 ? 1 : -1)
      }
    }
    touchStart.current = null
  }

  if (isMobile) {
    return (
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 64,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          color: '#fff',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', flex: 1 }}>
          {projets.map((projet, index) => {
            const isActive = index === projetApercuIndex
            return (
              <button
                key={projet.num}
                type="button"
                onClick={() => onNaviguerApercu(index)}
                style={{
                  flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <span style={{
                  width: isActive ? 14 : 8, height: isActive ? 14 : 8, borderRadius: '50%',
                  background: isActive ? categoryColor : 'rgba(255,255,255,0.15)',
                  border: isActive ? '1px solid rgba(255,255,255,0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }} />
                <span style={{
                  fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.15em',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
                }}>{String(index + 1).padStart(2, '0')}</span>
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
          {String(projetApercuIndex + 1).padStart(2, '0')}/{String(projets.length).padStart(2, '0')}
        </div>
      </div>
    )
  }

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'absolute',
        top: 0, bottom: 0, right: 0,
        width: 100,
        padding: '18px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        color: '#fff',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      <div style={{ position: 'relative', width: 1, flex: 1, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: `${(projetApercuIndex / Math.max(projets.length - 1, 1)) * 100}%`,
          background: categoryColor, transition: 'height 0.25s ease',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, flex: 1, justifyContent: 'center' }}>
        {projets.map((projet, index) => {
          const isActive = index === projetApercuIndex
          return (
            <button
              key={projet.num}
              type="button"
              onClick={() => onNaviguerApercu(index)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              <span style={{
                width: isActive ? 18 : 10, height: isActive ? 18 : 10, borderRadius: '50%',
                background: isActive ? categoryColor : 'rgba(255,255,255,0.08)',
                border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.18)',
                boxShadow: isActive ? `0 0 14px ${categoryColor}` : 'none',
                transition: 'all 0.2s ease',
              }} />
              <span style={{
                fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: '0.2em',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
              }}>{String(index + 1).padStart(2, '0')}</span>
            </button>
          )
        })}
      </div>

      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
        {String(projetApercuIndex + 1).padStart(2, '0')} / {String(projets.length).padStart(2, '0')}
      </div>
    </div>
  )
}
