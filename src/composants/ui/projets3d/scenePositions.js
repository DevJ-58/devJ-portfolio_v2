const MIN_DISTANCE = 3.2

export function genererPositions(count) {
  const positions = []

  for (let index = 0; index < count; index += 1) {
    let bestCandidate = null
    let bestDistance = -Infinity

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const theta = ((index * 137.5 + attempt * 21) % 360) * (Math.PI / 180)
      const radius = 3.5 + ((index * 0.5 + attempt * 0.4) % 2) + Math.sin(attempt * 0.35) * 0.22
      const phi = 0.65 + ((index % 4) * 0.14) + attempt * 0.018
      const x = radius * Math.cos(theta) * Math.sin(phi)
      const y = Math.sin(theta * 0.45) * 0.6
      const z = radius * Math.sin(theta) * Math.sin(phi)
      const candidate = [x, y, z]

      const minDistance = positions.reduce((acc, pos) => {
        const distance = Math.hypot(pos[0] - x, pos[1] - y, pos[2] - z)
        return Math.min(acc, distance)
      }, Infinity)

      if (minDistance > bestDistance) {
        bestDistance = minDistance
        bestCandidate = candidate
      }

      if (minDistance >= MIN_DISTANCE) {
        positions.push(candidate)
        break
      }

      if (attempt === 29 && bestCandidate) {
        positions.push(bestCandidate)
      }
    }
  }

  return positions
}
