// Lunettes d'AXIS, d'après celles de Fréjus : verres rectangulaires sans
// monture, transparents, pont et charnières dorés, branches fines jusqu'aux
// oreilles. Les mesures sont prises sur la géométrie de la tête.
import * as THREE from 'three'

const lin = (h) => new THREE.Color(h)

// Contour d'un verre : rectangle aux coins arrondis, un peu plus étroit en bas
function formeVerre(l, h, r) {
  const s = new THREE.Shape()
  const x0 = -l / 2, x1 = l / 2, y0 = -h / 2, y1 = h / 2
  const rb = r * 1.25 // coins du bas plus arrondis
  s.moveTo(x0 + r, y1)
  s.lineTo(x1 - r, y1)
  s.quadraticCurveTo(x1, y1, x1, y1 - r)
  s.lineTo(x1 - l * 0.02, y0 + rb)
  s.quadraticCurveTo(x1 - l * 0.02, y0, x1 - l * 0.02 - rb, y0)
  s.lineTo(x0 + l * 0.02 + rb, y0)
  s.quadraticCurveTo(x0 + l * 0.02, y0, x0 + l * 0.02, y0 + rb)
  s.lineTo(x0, y1 - r)
  s.quadraticCurveTo(x0, y1, x0 + r, y1)
  return s
}

// Point le plus avancé (z max) de la peau dans une zone du visage
function avantPeau(P0, cx, cy, rx, ry) {
  let z = -Infinity
  for (let i = 0; i < P0.length; i += 3) {
    if (Math.abs(P0[i] - cx) < rx && Math.abs(P0[i + 1] - cy) < ry && P0[i + 2] > z) z = P0[i + 2]
  }
  return z
}

export function creerLunettes(T0) {
  const { eyeL, eyeR, oreilles, P0 } = T0
  const groupe = new THREE.Group()
  const milieuX = (eyeL.c[0] + eyeR.c[0]) / 2
  const yYeux = (eyeL.c[1] + eyeR.c[1]) / 2
  const ecart = Math.abs(eyeR.c[0] - eyeL.c[0])

  // Dimensions d'après l'écart entre les yeux
  const l = ecart * 0.82
  const h = l * 0.56
  const zNez = avantPeau(P0, milieuX, yYeux, ecart * 0.08, h * 0.35)

  const verreMat = new THREE.MeshPhysicalMaterial({
    color: lin('#eef4ff'), // verre clair, à peine froid
    transparent: true, opacity: 0.16, specularIntensity: 1, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04,
    side: THREE.DoubleSide, depthWrite: false,
  })
  const trancheMat = new THREE.MeshPhysicalMaterial({ color: lin('#e8f0ff'), transparent: true, opacity: 0.55, roughness: 0.1 })
  const refletMat = new THREE.MeshBasicMaterial({ color: lin('#ffffff'), transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })
  const lisereMat = new THREE.LineBasicMaterial({ color: lin('#dbe7ff'), transparent: true, opacity: 0.85 })
  const orMat = new THREE.MeshStandardMaterial({ color: lin('#d6ad55'), metalness: 0.85, roughness: 0.26, emissive: lin('#4a3208'), emissiveIntensity: 0.35 })

  const verres = []
  for (const E of [eyeL, eyeR]) {
    const sgn = Math.sign(E.c[0] - milieuX) || 1 // côté extérieur
    const cx = E.c[0] + sgn * l * 0.04
    const cy = E.c[1] + h * 0.06
    const zPeau = avantPeau(P0, cx, cy, l * 0.5, h * 0.5)
    const v = new THREE.Group()
    v.position.set(cx, cy, Math.max(zPeau, zNez - 0.025) + 0.02)
    v.rotation.y = sgn * 0.3 // les verres épousent la courbe du visage
    v.rotation.x = -0.04
    const geo = new THREE.ExtrudeGeometry(formeVerre(l, h, h * 0.2), { depth: 0.004, bevelEnabled: false, curveSegments: 10 })
    geo.translate(0, 0, -0.002)
    const verre = new THREE.Mesh(geo, [verreMat, trancheMat])
    verre.renderOrder = 2
    v.add(verre)
    // Liseré clair sur le bord du verre (verre sans monture)
    const contour = formeVerre(l, h, h * 0.2).getPoints(40).map((p) => new THREE.Vector3(p.x, p.y, 0.0025))
    const lisere = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(contour), lisereMat)
    lisere.renderOrder = 3
    v.add(lisere)
    // Reflets en biais (bandes inclinées dessinées à l'intérieur du verre)
    for (const [x, larg] of [[-0.06, 0.14], [0.16, 0.05]]) {
      const yh = h * 0.42, pente = l * 0.16
      const bande = new THREE.Shape([
        new THREE.Vector2(l * x + pente, yh), new THREE.Vector2(l * (x + larg) + pente, yh),
        new THREE.Vector2(l * (x + larg) - pente, -yh), new THREE.Vector2(l * x - pente, -yh),
      ])
      const reflet = new THREE.Mesh(new THREE.ShapeGeometry(bande), refletMat)
      reflet.position.z = 0.0032
      reflet.renderOrder = 3
      v.add(reflet)
    }
    groupe.add(v)
    verres.push({ v, sgn })
  }
  groupe.updateMatrixWorld(true)
  const point = ({ v }, x, y, z = 0) => v.localToWorld(new THREE.Vector3(x, y, z))

  // Pont doré au-dessus du nez
  const [vg, vd] = verres[0].sgn < 0 ? verres : [verres[1], verres[0]]
  const a = point(vg, l * 0.5, h * 0.22, 0.003)
  const b = point(vd, -l * 0.5, h * 0.22, 0.003)
  const haut = new THREE.Vector3(milieuX, (a.y + b.y) / 2 + h * 0.08, Math.max(zNez + 0.012, (a.z + b.z) / 2 + 0.004))
  const pont = new THREE.CatmullRomCurve3([a, a.clone().lerp(haut, 0.6).setY(haut.y), haut, b.clone().lerp(haut, 0.6).setY(haut.y), b])
  groupe.add(new THREE.Mesh(new THREE.TubeGeometry(pont, 24, 0.0058, 10, false), orMat))

  // Charnières et branches jusqu'aux oreilles
  for (const vr of verres) {
    const charniere = point(vr, vr.sgn * l * 0.5, h * 0.28, 0.002)
    const piece = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.013, 0.018), orMat)
    piece.position.copy(charniere)
    piece.rotation.y = vr.v.rotation.y
    groupe.add(piece)
    const oreille = oreilles.find((o) => Math.sign(o.sgn) === vr.sgn) || oreilles[0]
    const fin = new THREE.Vector3(oreille.skull + vr.sgn * 0.004, oreille.yc + oreille.hh * 0.42, -0.05)
    const milieu = new THREE.Vector3(oreille.skull + vr.sgn * 0.012, (charniere.y + fin.y) / 2 + 0.006, (charniere.z + fin.z) / 2)
    const courbe = new THREE.CatmullRomCurve3([charniere, charniere.clone().add(new THREE.Vector3(vr.sgn * 0.006, 0, -0.02)), milieu, fin])
    groupe.add(new THREE.Mesh(new THREE.TubeGeometry(courbe, 30, 0.0042, 8, false), orMat))
  }
  return groupe
}
