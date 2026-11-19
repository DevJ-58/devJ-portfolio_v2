import AvatarAxis from '@/composants/ui/AvatarAxis'

// Bouton flottant « Parler à AXIS » (page /portfolio en accès direct), sur
// bureau comme sur téléphone : l'avatar 3D d'AXIS, qui ramène vers l'accueil
// où AXIS prend le relais.
export default function AxisBouton({ isMobile, navigate }) {
  const taille = isMobile ? 58 : 74
  return (
    <button type="button" className="pf-axis" onClick={() => navigate('/')} aria-label="Parler à AXIS, l'IA de Fréjus">
      <span className="pf-axis__bulle" aria-hidden="true">
        <small>AXIS // IA</small>
        <b><i />Parler à AXIS</b>
      </span>
      <span className="pf-axis__avatar" aria-hidden="true">
        <AvatarAxis width={taille} height={taille} etat="idle" />
      </span>
    </button>
  )
}
