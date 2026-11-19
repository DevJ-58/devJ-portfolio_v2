import { useEffect, useRef } from 'react'
import utiliserStore from '@/store/utiliserStore'
import utiliserTheme from '@/store/utiliserTheme'
import { creerMoteurAvatar } from './moteurAvatar'
import { ecouterPositionVoix } from './canalParole'

// État dérivé du store : réflexion pendant l'appel à Groq, parole pendant
// l'affichage / la lecture de la réponse, repos sinon.
function etatDepuisStore(devjai) {
  if (devjai.estEnChargement) return 'thinking'
  if (devjai.estEnTrain) return 'speaking'
  return 'idle'
}

export default function AvatarAxisScene({ width = 280, height = 280, etat }) {
  const conteneurRef = useRef(null)
  const canvasRef = useRef(null)
  const moteurRef = useRef(null)

  const etatStore = utiliserStore((s) => etatDepuisStore(s.devjai))
  const texteParole = utiliserStore((s) => s.devjai.texteParole)
  const accent = utiliserTheme((s) => s.theme.accent)
  const etatFinal = etat || etatStore

  // Création / destruction du moteur 3D
  useEffect(() => {
    const moteur = creerMoteurAvatar(canvasRef.current, { accent: utiliserTheme.getState().theme.accent })
    moteurRef.current = moteur
    const st = utiliserStore.getState().devjai
    moteur.definirTexte(st.texteParole)

    const el = conteneurRef.current
    const ro = new ResizeObserver(([entree]) => {
      const { width: w, height: h } = entree.contentRect
      moteur.redimensionner(w, h)
    })
    ro.observe(el)

    // Pause du rendu quand l'avatar n'est pas visible ou que l'onglet est caché
    let visible = true
    const majActif = () => moteur.definirActif(visible && !document.hidden)
    const io = new IntersectionObserver(([entree]) => { visible = entree.isIntersecting; majActif() })
    io.observe(el)
    document.addEventListener('visibilitychange', majActif)
    majActif()

    const desabonner = ecouterPositionVoix((p) => moteur.synchroniserVoix(p))

    return () => {
      desabonner()
      document.removeEventListener('visibilitychange', majActif)
      io.disconnect()
      ro.disconnect()
      moteur.detruire()
      moteurRef.current = null
    }
  }, [])

  useEffect(() => { moteurRef.current?.definirTexte(texteParole) }, [texteParole])
  useEffect(() => { moteurRef.current?.definirEtat(etatFinal) }, [etatFinal])
  useEffect(() => { moteurRef.current?.definirAccent(accent) }, [accent])

  const enReflexion = etatFinal === 'thinking'

  return (
    <div ref={conteneurRef} style={{ position: 'relative', width, height, flexShrink: 0 }}>
      <style>{`
        @keyframes axisAnneauTourne { to { transform: translate(-50%, -50%) rotate(360deg) } }
        @keyframes axisPoint { 0%, 100% { opacity: .25; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-15%) } }
      `}</style>
      {/* Anneau pointillé de réflexion */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', left: '50%', top: '47%',
          width: '82%', aspectRatio: '1 / 1.12',
          transform: 'translate(-50%, -50%)', borderRadius: '50%',
          border: `${width < 120 ? 1 : 2}px dashed ${accent}b3`,
          opacity: enReflexion ? 1 : 0, transition: 'opacity .6s',
          animation: 'axisAnneauTourne 14s linear infinite',
          pointerEvents: 'none',
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      {/* Points de réflexion */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', left: '78%', top: '6%', display: 'flex', gap: '4%',
          width: '18%', opacity: enReflexion ? 1 : 0, transition: 'opacity .5s', pointerEvents: 'none',
        }}
      >
        {[0, 0.2, 0.4].map((d) => (
          <i
            key={d}
            style={{
              flex: '1 1 0', aspectRatio: '1', borderRadius: '50%', background: accent,
              boxShadow: `0 0 10px ${accent}`, animation: `axisPoint 1.2s ${d}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
