from pathlib import Path

root = Path(__file__).resolve().parent
file_path = root / 'src' / 'composants' / 'Portfolio.jsx'
text = file_path.read_text(encoding='utf-8')
lines = text.splitlines()
start = next(i for i, line in enumerate(lines) if line.strip() == '<section id="pf-methodology" style={sectionStyle}>')
end = next(i for i, line in enumerate(lines) if line.strip() == '<section id="pf-contact" style={sectionStyle}>')
replacement = '''      <section id="pf-methodology" style={sectionStyle}>
        <div style={s.secNum}>05 // MÉTHODE</div>
        <h2 style={s.secTitle}>Ma <span style={s.accent}>Méthode</span> de Travail</h2>

        <div style={{
          background: eff.cardBg,
          border: `1px solid ${eff.borderStrong}`,
          borderRadius: 16,
          overflow: 'hidden',
          maxWidth: 820,
          margin: '0 auto',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 40, right: 40, height: 1,
            background: `linear-gradient(90deg,transparent,rgba(${aRgb},0.3),transparent)`,
          }} />

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 10,
          }}>
            {etapes.map((e, i) => {
              const isActive = i === etapeActive
              return (
                <div
                  key={e.n || i}
                  role="button"
                  tabIndex={0}
                  aria-label={e.titre}
                  onClick={() => setEtapeActive(i)}
                  onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') setEtapeActive(i) }}
                  style={{
                    position: 'relative',
                    flex: isMobile ? 'none' : isActive ? 3 : 1,
                    minWidth: 0,
                    height: isMobile ? (isActive ? 220 : 58) : 'auto',
                    cursor: 'pointer',
                    borderRadius: 14,
                    border: `1px solid ${isActive ? eff.borderStrong : eff.borderMedium}`,
                    background: isActive ? eff.cardBg : `rgba(${aRgb},0.04)`,
                    overflow: 'hidden',
                    transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
                    display: 'flex',
                    alignItems: 'stretch',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    color: a,
                    fontFamily: 'Fraunces, serif',
                    fontWeight: 800,
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    ...(isActive
                      ? { fontSize: isMobile ? 90 : 180, right: -10, bottom: -28, opacity: 0.10 }
                      : isMobile
                        ? { fontSize: 18, left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }
                        : { fontSize: 24, top: 16, left: '50%', transform: 'translateX(-50%)', opacity: 0.28 }
                    ),
                  }}>
                    {e.n || String(i + 1).padStart(2, '0')}
                  </span>

                  {isActive ? (
                    <div style={{
                      position: 'relative',
                      padding: isMobile ? '22px 20px 18px' : '30px 28px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      width: '100%',
                    }}>
                      <span style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: 11,
                        color: a,
                        letterSpacing: '0.18em',
                        marginBottom: 10,
                      }}>
                        {e.n || String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{
                        fontFamily: 'Fraunces, serif',
                        fontWeight: 700,
                        fontSize: isMobile ? 18 : 20,
                        color: eff.textPrimary,
                        marginBottom: 10,
                      }}>
                        {e.titre}
                      </span>
                      <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 300,
                        fontSize: 13,
                        color: eff.textMuted,
                        lineHeight: 1.7,
                      }}>
                        {e.desc}
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isMobile ? 'flex-start' : 'center',
                      width: '100%',
                      padding: isMobile ? '0 20px 0 56px' : '22px 14px 22px',
                    }}>
                      <span style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: isMobile ? 12 : 11,
                        color: eff.textMuted,
                        letterSpacing: '0.1em',
                        textAlign: isMobile ? 'left' : 'center',
                      }}>
                        {e.titre}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>'''

new_lines = lines[:start] + replacement.splitlines() + lines[end:]
file_path.write_text('\n'.join(new_lines) + '\n', encoding='utf-8')
print(f'Updated section from {start} to {end}')
