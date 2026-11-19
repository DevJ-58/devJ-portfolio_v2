import { lazy, Suspense } from 'react'

// La scène 3D (three.js + données du visage) est chargée à part, pour ne pas
// alourdir le premier affichage de la page.
const AvatarAxisScene = lazy(() => import('./axis/AvatarAxisScene'))

// Avatar 3D d'AXIS.
// - etat (optionnel) : 'idle' | 'thinking' | 'speaking'. Sans cette prop,
//   l'état est lu dans le store (estEnChargement → réflexion, estEnTrain → parole).
export default function AvatarAxis({ width = 280, height = 280, etat }) {
  return (
    <Suspense fallback={<div style={{ width, height, flexShrink: 0 }} />}>
      <AvatarAxisScene width={width} height={height} etat={etat} />
    </Suspense>
  )
}
