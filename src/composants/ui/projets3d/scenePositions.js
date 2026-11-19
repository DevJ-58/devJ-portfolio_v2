// Les projets sont posés sur un anneau légèrement ondulé : la caméra peut
// ainsi passer de l'un à l'autre en tournant autour du centre, sans traverser
// les autres cartes.
export function genererPositions(count) {
  if (count <= 0) return []
  if (count === 1) return [[0, 0, 0]]
  const rayon = Math.max(4.2, count * 0.9)
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    return [Math.cos(angle) * rayon, Math.sin(i * 1.7) * 0.7, Math.sin(angle) * rayon]
  })
}
