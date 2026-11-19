// Géométrie de la tête d'AXIS, calculée à partir des points du visage
// (src/donnees/axisVisage.json). Le calcul est lourd (~60 000 sommets) :
// il n'est fait qu'une fois puis partagé entre toutes les instances.
import * as THREE from 'three'
import A from '@/donnees/axisVisage.json'

export const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
export const lerp = (a, b, t) => a + (b - a) * t

// Couleur donnée en sRGB, convertie vers l'espace de travail linéaire.
export const lin = (h) => new THREE.Color(h)

let cache = null

export function construireTete() {
  if (cache) return cache

  const LM = A.lm.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
  const G = A.grid
  function rel(x, y) {
    const fx = (x - G.x0) / (G.x1 - G.x0) * (G.nx - 1), fy = (y - G.y0) / (G.y1 - G.y0) * (G.ny - 1)
    if (fx < 0 || fy < 0 || fx > G.nx - 1 || fy > G.ny - 1) return 0
    const i = Math.floor(fx), j = Math.floor(fy), a = fx - i, b = fy - j
    const i1 = Math.min(i + 1, G.nx - 1), j1 = Math.min(j + 1, G.ny - 1)
    const r = G.rel
    return (r[j * G.nx + i] * (1 - a) + r[j * G.nx + i1] * a) * (1 - b) + (r[j1 * G.nx + i] * (1 - a) + r[j1 * G.nx + i1] * a) * b
  }
  const PROF = A.prof // [y, xl, xr] du haut vers le bas
  function prof(y) {
    if (y >= PROF[0][0]) return [PROF[0][1], PROF[0][2]]
    for (let k = 0; k < PROF.length - 1; k++) {
      const a = PROF[k], b = PROF[k + 1]
      if (y <= a[0] && y >= b[0]) { const t = (a[0] - y) / (a[0] - b[0]); return [lerp(a[1], b[1], t), lerp(a[2], b[2], t)] }
    }
    const l = PROF[PROF.length - 1]
    return [l[1], l[2]]
  }
  const TOP = A.top, CHIN = A.chin
  function inPoly(x, y, P) {
    let c = false
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const a = P[i], b = P[j]
      if (((a[1] > y) !== (b[1] > y)) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) c = !c
    }
    return c
  }
  function distSeg(x, y, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1]
    const t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1), 0, 1)
    return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy)
  }
  function sdPoly(x, y, P) { // positif à l'intérieur
    let d = 1e9
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) d = Math.min(d, distSeg(x, y, P[i], P[j]))
    return inPoly(x, y, P) ? d : -d
  }
  const pts = (ids) => ids.map((i) => [LM[i].x, LM[i].y])
  const cen = (ids) => { let x = 0, y = 0; ids.forEach((i) => { x += LM[i].x; y += LM[i].y }); return [x / ids.length, y / ids.length] }

  // ── Traits principaux
  const EYE_L = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
  const EYE_R = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]
  const ESC = 1.0
  function scaledEye(ids) {
    const c = cen(ids)
    return { c, poly: pts(ids).map((p) => [c[0] + (p[0] - c[0]) * ESC, c[1] + (p[1] - c[1]) * ESC * 1.08]), w: Math.abs(LM[ids[0]].x - LM[ids[8]].x) * ESC }
  }
  const eyeL = scaledEye(EYE_L), eyeR = scaledEye(EYE_R)
  const UPLIP = pts([61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78])
  const LOLIP = pts([61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78])
  const mL = [LM[61].x, LM[61].y], mR = [LM[291].x, LM[291].y], mC = [(LM[13].x + LM[14].x) / 2, (LM[13].y + LM[14].y) / 2]
  const mouthW = mR[0] - mL[0]
  const iL = [LM[78].x, LM[78].y], iR = [LM[308].x, LM[308].y]
  function lipLine(x) { // interpolation de Lagrange par iL, mC, iR
    const [x0, y0] = iL, [x1, y1] = mC, [x2, y2] = iR
    return y0 * (x - x1) * (x - x2) / ((x0 - x1) * (x0 - x2)) + y1 * (x - x0) * (x - x2) / ((x1 - x0) * (x1 - x2)) + y2 * (x - x0) * (x - x1) / ((x2 - x0) * (x2 - x1))
  }
  const HL = A.hairline
  function hairY(x) {
    if (x <= HL[0][0]) return HL[0][1]
    if (x >= HL[HL.length - 1][0]) return HL[HL.length - 1][1]
    for (let k = 0; k < HL.length - 1; k++) {
      const a = HL[k], b = HL[k + 1]
      if ((x - a[0]) * (x - b[0]) <= 0) { const t = (x - a[0]) / ((b[0] - a[0]) || 1e-6); return lerp(a[1], b[1], t) }
    }
    return HL[0][1]
  }
  const faceW = LM[454].x - LM[234].x

  // ── Palette de peau
  const SKIN = lin('#6e3d28'), SKIN_HI = lin('#86502f'), SKIN_LO = lin('#4f2a1b')
  const LIP_UP = lin('#56291f'), LIP_LO = lin('#7c4239'), SLIT = lin('#160604')
  const HAIR = lin('#0e0b0a'), HAIR2 = lin('#231a16'), NOSTRIL = lin('#2e160e')

  // ── Maillage de la tête
  const SEG_U = 260, SEG_V = 230
  const nV = (SEG_U + 1) * (SEG_V + 1)
  const SLITW = new Float32Array(nV)
  const P0 = new Float32Array(nV * 3), COL = new Float32Array(nV * 3)
  const RX = new Float32Array(nV), RY = new Float32Array(nV), FRONT = new Float32Array(nV)
  const yBot = CHIN - 0.06
  const zFront = (W, cs) => W * 1.02 * Math.sign(cs) * Math.pow(Math.abs(cs), 0.72)
  const zBack = (W, cs, y) => { const back = Math.max(W * 1.12, y > -0.25 ? 0.78 : lerp(0.5, 0.78, sstep(-0.85, -0.25, y))); return back * cs }
  let vi = 0
  for (let j = 0; j <= SEG_V; j++) {
    const v = j / SEG_V
    const y = lerp(TOP, yBot, v)
    const [xl, xr] = prof(Math.min(y, PROF[0][0]))
    let W = (xr - xl) / 2
    const c = (xl + xr) / 2
    if (j === 0) W = 0
    const tTop = sstep(TOP, TOP - 0.12, y)
    W *= lerp(0, 1, Math.sqrt(tTop))
    if (y < CHIN) { const t = (CHIN - y) / (CHIN - yBot); W *= Math.sqrt(Math.max(0, 1 - t * t)) }
    for (let i = 0; i <= SEG_U; i++) {
      const th = (i / SEG_U) * Math.PI * 2 - Math.PI // 0 = face avant
      const sn = Math.sin(th), cs = Math.cos(th)
      const x = c + W * sn
      let z = cs >= 0 ? zFront(W, cs) : zBack(W, cs, y)
      const fw = sstep(0.15, 0.55, cs)
      z += rel(x, y) * fw * 0.95
      P0[vi * 3] = x; P0[vi * 3 + 1] = y; P0[vi * 3 + 2] = z
      RX[vi] = x; RY[vi] = y; FRONT[vi] = fw
      vi++
    }
  }

  // Deux rangées de sommets plaquées sur la ligne des lèvres → bouche nette
  const SLITP = []
  for (let i = 0; i <= SEG_U; i++) {
    for (let j = 0; j < SEG_V; j++) {
      const k = j * (SEG_U + 1) + i, k2 = k + SEG_U + 1
      if (FRONT[k] < 0.5) continue
      const x = RX[k]
      if (x < iL[0] - 0.004 || x > iR[0] + 0.004) continue
      const ly = lipLine(clamp(x, iL[0], iR[0]))
      if (RY[k] >= ly && RY[k2] < ly) {
        const taper = 1 - Math.pow(Math.abs(x - mC[0]) / ((iR[0] - iL[0]) / 2 + 0.004), 4)
        const gap = 0.0012 + 0.0018 * Math.max(0, taper)
        const zk = P0[k * 3 + 2], zk2 = P0[k2 * 3 + 2]
        RY[k] = ly + gap; P0[k * 3 + 1] = RY[k]
        RY[k2] = ly - gap; P0[k2 * 3 + 1] = RY[k2]
        const zm = (zk + zk2) / 2 - 0.004
        P0[k * 3 + 2] = zm; P0[k2 * 3 + 2] = zm
        SLITW[k] = 1; SLITW[k2] = 1
        SLITP.push([k, k2])
        break
      }
    }
  }

  // Creusement des orbites et placement des globes oculaires
  function surfZAt(x, y) {
    let best = 1e9, bz = 0
    for (let k = 0; k < nV; k++) {
      if (FRONT[k] < 0.5) continue
      const d = (RX[k] - x) ** 2 + (RY[k] - y) ** 2
      if (d < best) { best = d; bz = P0[k * 3 + 2] }
    }
    return bz
  }
  for (const E of [eyeL, eyeR]) {
    E.z = surfZAt(E.c[0], E.c[1])
    E.r = E.w * 0.6
    E.cz = E.z - E.r * 0.86
  }
  for (let k = 0; k < nV; k++) {
    if (FRONT[k] < 0.3) continue
    const x = RX[k], y = RY[k]
    for (const E of [eyeL, eyeR]) {
      if (Math.abs(x - E.c[0]) > E.w || Math.abs(y - E.c[1]) > E.w * 0.6) continue
      const d = sdPoly(x, y, E.poly)
      const w = sstep(-0.012, 0.014, d)
      if (w > 0) P0[k * 3 + 2] = lerp(P0[k * 3 + 2], E.cz - E.r * 0.15, w)
      const rimw = Math.exp(-(((d + 0.012) / 0.012) ** 2))
      P0[k * 3 + 2] += rimw * 0.008
    }
  }

  // Couleurs par sommet
  const SIDE = new Int8Array(nV)
  const narines = [
    [LM[98].x * 0.5 + LM[64].x * 0.5, LM[98].y * 0.5 + LM[64].y * 0.5],
    [LM[327].x * 0.5 + LM[294].x * 0.5, LM[327].y * 0.5 + LM[294].y * 0.5],
  ]
  const hyEnd = (HL[0][1] + HL[HL.length - 1][1]) / 2
  const c = new THREE.Color(), cheveu = new THREE.Color()
  for (let k = 0; k < nV; k++) {
    const x = RX[k], y = RY[k]
    c.copy(SKIN)
    c.lerp(SKIN_HI, clamp(rel(x, y) * 2.2, 0, 0.35) * FRONT[k])
    c.lerp(SKIN_LO, clamp(-rel(x, y) * 1.4, 0, 0.2) * FRONT[k])
    if (FRONT[k] > 0.5) {
      const du = sdPoly(x, y, UPLIP), dl = sdPoly(x, y, LOLIP)
      if (du > -0.006) c.lerp(LIP_UP, sstep(-0.006, 0.004, du))
      if (dl > -0.006) c.lerp(LIP_LO, sstep(-0.006, 0.004, dl))
      for (const n of narines) {
        const d = Math.hypot((x - n[0]) / 1.5, y - n[1])
        if (d < 0.016) c.lerp(NOSTRIL, sstep(0.016, 0.006, d) * 0.85)
      }
      if (x > iL[0] - 0.005 && x < iR[0] + 0.005) {
        const d = y - lipLine(x)
        SIDE[k] = d >= 0 ? 1 : -1
        if (SLITW[k]) c.copy(SLIT)
      }
    }
    // Cheveux : contour continu autour de la tête
    const thk = (k % (SEG_U + 1)) / SEG_U * Math.PI * 2 - Math.PI, cs = Math.cos(thk)
    const hyF = hairY(x)
    const hb = cs > 0.35 ? hyF : lerp(hyEnd, -0.42, sstep(0.35, -0.55, cs)) * (1 - sstep(0.35, 0.55, cs)) + hyF * sstep(0.35, 0.55, cs)
    const hb2 = hb - 0.035
    const hw = sstep(hb2 - 0.012, hb2 - 0.004, y), hwD = sstep(hb2 - 0.03, hb2 + 0.02, y)
    if (hw > 0 || hwD > 0) {
      const nz2 = (Math.sin(x * 190) * Math.sin(y * 210) + Math.sin(x * 97 + y * 130)) * 0.5
      c.lerp(cheveu.copy(HAIR).lerp(HAIR2, 0.25 + 0.25 * nz2), hw)
      const nx = P0[k * 3], nz = P0[k * 3 + 2], l = Math.hypot(nx, nz) || 1
      P0[k * 3] += nx / l * 0.028 * hwD
      P0[k * 3 + 2] += nz / l * 0.028 * hwD
      P0[k * 3 + 1] += 0.014 * hwD * sstep(0.3, 0.9, y)
    }
    COL[k * 3] = c.r; COL[k * 3 + 1] = c.g; COL[k * 3 + 2] = c.b
  }
  const idx = new Uint32Array(SEG_V * SEG_U * 6)
  let q = 0
  for (let j = 0; j < SEG_V; j++) {
    for (let i = 0; i < SEG_U; i++) {
      const a = j * (SEG_U + 1) + i, b = a + 1, c2 = a + SEG_U + 1, d = c2 + 1
      idx[q++] = a; idx[q++] = c2; idx[q++] = b; idx[q++] = b; idx[q++] = c2; idx[q++] = d
    }
  }

  // Sourcils : points de passage posés sur la peau
  const browSets = [[[46, 53, 52, 65, 55], [70, 63, 105, 66, 107]], [[276, 283, 282, 295, 285], [300, 293, 334, 296, 336]]]
  const sourcils = browSets.map(([lo, up]) => lo.map((l, i) => {
    const a = LM[l], b = LM[up[i]]
    const x = a.x * 0.45 + b.x * 0.55, y = a.y * 0.45 + b.y * 0.55 + 0.004
    return [x, y, surfZAt(x, y) + 0.006]
  }))

  // Oreilles
  const oreilles = []
  for (const [E, sgn] of [[A.earL, -1], [A.earR, 1]]) {
    if (!E.length) continue
    const ys = E.map((e) => e[0])
    const yTop = Math.min(Math.max(...ys), LM[sgn < 0 ? 127 : 356].y + 0.02)
    const yBotE = Math.max(Math.min(...ys), LM[sgn < 0 ? 132 : 361].y - 0.02)
    const outer = sgn < 0 ? Math.min(...E.map((e) => e[1])) : Math.max(...E.map((e) => e[1]))
    const yc = (yTop + yBotE) / 2, hh = (yTop - yBotE) / 2
    const [xl, xr] = prof(yc)
    const skull = sgn < 0 ? xl : xr
    const wx = Math.max(0.035, Math.abs(outer - skull) * 0.95)
    oreilles.push({ sgn, yc, hh, skull, wx })
  }

  const lipZ = surfZAt(mC[0], mC[1])

  // ── Formes de déformation (blendshapes analytiques, creuses)
  function mkShape(fn) {
    const ids = [], d = []
    for (let k = 0; k < nV; k++) {
      if (FRONT[k] < 0.2) continue
      const r = fn(RX[k], RY[k], k)
      if (r && (r[0] || r[1] || r[2])) { ids.push(k); d.push(r[0] * FRONT[k], r[1] * FRONT[k], r[2] * FRONT[k]) }
    }
    return { ids: Int32Array.from(ids), d: Float32Array.from(d) }
  }
  const g2 = (x, y, cx, cy, r) => Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * r * r))
  const JAW_AMP = 0.17
  const browLc = cen([70, 63, 105, 66, 107]), browRc = cen([300, 293, 334, 296, 336])
  const browInA = cen([107, 66]), browInB = cen([336, 296])
  const SH = {
    jaw: mkShape((x, y, k) => {
      const ly = lipLine(clamp(x, iL[0], iR[0])); const dx = Math.abs(x - mC[0])
      const whn = Math.pow(clamp(1 - (dx / (mouthW * 0.56)) ** 2, 0, 1), 0.5), whf = 1 - sstep(mouthW * 0.55, faceW * 0.52, dx)
      const tv = sstep(0, 0.18, ly - y); const wh = whn * (1 - tv) + whf * tv
      let w = 0
      if (SIDE[k] === -1 || y < ly) {
        const band = 0.004 + sstep(mouthW * 0.3, mouthW * 0.9, dx) * 0.14
        w = wh * sstep(0, band, ly - y)
        if (SIDE[k] === -1) w = Math.max(w, 0.35 + 0.65 * clamp(1 - (dx / (mouthW * 0.5)) ** 2, 0, 1))
      }
      if (y < CHIN - 0.02) w *= sstep(CHIN - 0.12, CHIN - 0.02, y)
      let up = 0
      if (SIDE[k] === 1 || (y >= ly && dx < mouthW * 0.55)) up = Math.exp(-Math.max(0, y - ly) / 0.03) * (1 - sstep(mouthW * 0.3, mouthW * 0.6, dx))
      const sl = SLITW[k] ? 1 : 0
      return [0, -w * JAW_AMP + up * JAW_AMP * 0.1, -w * 0.04 - sl * 0.10]
    }),
    smile: mkShape((x, y) => {
      let dx = 0, dy = 0, dz = 0
      for (const [p, s] of [[mL, -1], [mR, 1]]) { const g = g2(x, y, p[0], p[1], mouthW * 0.3); dx += s * g * 0.032; dy += g * 0.03; dz -= g * 0.008 }
      for (const id of [50, 280]) { const g = g2(x, y, LM[id].x, LM[id].y, mouthW * 0.42); dy += g * 0.016; dz += g * 0.012 }
      for (const E of [eyeL, eyeR]) { const g = g2(x, y, E.c[0], E.c[1] - E.w * 0.35, E.w * 0.25); dy += g * 0.006 }
      return [dx, dy, dz]
    }),
    wide: mkShape((x, y) => {
      let dx = 0, dy = 0
      for (const [p, s] of [[mL, -1], [mR, 1]]) { const g = g2(x, y, p[0], p[1], mouthW * 0.28); dx += s * g * 0.02; dy += g * 0.004 }
      return [dx, dy, 0]
    }),
    round: mkShape((x, y) => {
      let dx = 0
      for (const [p, s] of [[mL, -1], [mR, 1]]) { const g = g2(x, y, p[0], p[1], mouthW * 0.33); dx -= s * g * 0.03 }
      const g = g2(x, y, mC[0], mC[1], mouthW * 0.42)
      return [dx, 0, g * 0.035]
    }),
    press: mkShape((x, y) => {
      const g = g2(x, y, mC[0], mC[1], mouthW * 0.36); const ly = lipLine(clamp(x, iL[0], iR[0]))
      return [0, (y > ly ? -1 : 1) * g * 0.006, g * 0.008]
    }),
    browL: mkShape((x, y) => { const g = g2(x, y, browLc[0], browLc[1] + 0.02, 0.09) * (y > browLc[1] - 0.03 ? 1 : 0); return [0, g * 0.03, 0] }),
    browR: mkShape((x, y) => { const g = g2(x, y, browRc[0], browRc[1] + 0.02, 0.09) * (y > browRc[1] - 0.03 ? 1 : 0); return [0, g * 0.03, 0] }),
    browIn: mkShape((x, y) => {
      const g = Math.max(g2(x, y, browInA[0], browInA[1], 0.05), g2(x, y, browInB[0], browInB[1], 0.05))
      return [(x < 0 ? 0.004 : -0.004) * g, g * 0.016, 0]
    }),
  }

  cache = {
    P0, COL, idx, SLITP, SH, JAW_AMP,
    TOP, CHIN, yBot, prof,
    eyeL, eyeR, mC, mouthW, lipZ,
    sourcils, oreilles,
    SKIN, SKIN_LO,
  }
  return cache
}
