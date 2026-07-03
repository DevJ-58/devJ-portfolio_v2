const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'composants', 'Portfolio.jsx');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split(/\r?\n/);
const startMarker = "          <div style={{ padding: isMobile ? '18px 16px' : '22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>",
      endMarker = "        </div>";
const startIdx = lines.findIndex(l => l.trim() === startMarker.trim());
const styleIdx = lines.findIndex(l => l.includes("<style>{`@keyframes mblink {"));
if (startIdx === -1 || styleIdx === -1) {
  console.error('Markers not found', { startIdx, styleIdx });
  process.exit(1);
}
let endIdx = -1;
for (let i = styleIdx - 1; i > startIdx; i -= 1) {
  if (lines[i].trim() === endMarker.trim()) {
    endIdx = i;
    break;
  }
}
if (endIdx === -1) {
  console.error('End divider not found', { startIdx, styleIdx });
  process.exit(1);
}
const replacementLines = [
"          <div style={{",
"            display: 'flex',",
"            flexDirection: isMobile ? 'column' : 'row',",
"            gap: 6,",
"            height: isMobile ? 'auto' : 340,",
"          }}>",
"            {etapes.map((e, i) => {",
"              const isActive = i === etapeActive",
"              return (",
"                <div",
"                  key={e.n || i}",
"                  role=\"button\"",
"                  tabIndex={0}",
"                  aria-label={e.titre}",
"                  onClick={() => setEtapeActive(i)}",
"                  onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') setEtapeActive(i) }}",
"                  style={{",
"                    position: 'relative',",
"                    flex: isMobile ? 'none' : (isActive ? 5 : 1),",
"                    minWidth: 0,",
"                    height: isMobile ? (isActive ? 180 : 56) : '100%',",
"                    cursor: 'pointer',",
"                    borderRadius: 14,",
"                    border: `1px solid ${isActive ? eff.borderStrong : eff.borderMedium}`",
"                    borderLeft: isActive ? `2px solid ${a}` : `1px solid ${eff.borderMedium}`",
"                    background: isActive ? eff.cardBg : `rgba(${aRgb},0.02)`",
"                    overflow: 'hidden',",
"                    transition: isMobile",
"                      ? 'height 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s'",
"                      : 'flex 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s',",
"                    display: 'flex',",
"                  }}",
"                >",
"                  <span style={{",
"                    position: 'absolute',",
"                    fontFamily: 'Fraunces, serif',",
"                    fontWeight: 800,",
"                    color: a,",
"                    lineHeight: 1,",
"                    userSelect: 'none',",
"                    pointerEvents: 'none',",
"                    ...(isActive",
"                      ? { fontSize: isMobile ? 90 : 190, right: -10, bottom: -30, opacity: 0.10 }",
"                      : isMobile",
"                        ? { fontSize: 20, left: 18, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }",
"                        : { fontSize: 26, top: 14, left: '50%', transform: 'translateX(-50%)', opacity: 0.35 }",
"                    ),",
"                  }}>",
"                    {e.n || String(i + 1).padStart(2, '0')}",
"                  </span>",
"",
"                  {isActive ? (",
"                    <div style={{",
"                      position: 'relative',",
"                      padding: isMobile ? '20px 20px 18px' : '28px 26px',",
"                      display: 'flex',",
"                      flexDirection: 'column',",
"                      justifyContent: 'flex-end',",
"                      width: '100%',",
"                    }}>",
"                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: a, marginBottom: 8, letterSpacing: '0.1em' }}>",
"                        {e.n || String(i + 1).padStart(2, '0')}",
"                      </span>",
"                      <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: isMobile ? 18 : 21, color: eff.textPrimary, marginBottom: 8 }}>",
"                        {e.titre}",
"                      </span>",
"                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: eff.textMuted, lineHeight: 1.6, maxWidth: 300 }}>",
"                        {e.desc}",
"                      </span>",
"                    </div>",
"                  ) : isMobile ? (",
"                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 18px 0 52px' }}>",
"                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: eff.textMuted, letterSpacing: '0.05em' }}>",
"                        {e.titre}",
"                      </span>",
"                    </div>",
"                  ) : (",
"                    <span style={{",
"                      position: 'absolute',",
"                      bottom: 20,",
"                      left: '50%',",
"                      transform: 'translateX(-50%) rotate(180deg)',",
"                      writingMode: 'vertical-rl',",
"                      fontFamily: 'Space Mono, monospace',",
"                      fontSize: 11,",
"                      letterSpacing: '0.05em',",
"                      color: eff.textMuted,",
"                      whiteSpace: 'nowrap',",
"                    }}>",
"                      {e.titre}",
"                    </span>",
"                  )}",
"                </div>",
"              )",
"            })}",
"          </div>"
];
const newLines = lines.slice(0, startIdx).concat(replacementLines).concat(lines.slice(endIdx + 1));
fs.writeFileSync(filePath, newLines.join('\n'));
console.log('Replaced methodology block from', startIdx, 'to', endIdx);
