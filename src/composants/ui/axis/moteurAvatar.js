// Moteur 3D de l'avatar AXIS : scène three.js, rig du visage, comportements
// (repos / réflexion / parole) et synchronisation de la bouche sur le texte.
import * as THREE from 'three'
import { construireTete, sstep, lerp, lin } from './construireTete'
import { construireTimeline } from './visemes'
import { creerLunettes } from './lunettes'

// L'avatar d'origine (three r128, sans gestion des couleurs) interprétait les
// couleurs hors palette de peau comme déjà linéaires. On garde ce rendu.
const brut = (c) => (typeof c === 'number'
  ? new THREE.Color().setHex(c, THREE.LinearSRGBColorSpace)
  : new THREE.Color().setStyle(c, THREE.LinearSRGBColorSpace))

// Depuis three r155 les lumières sont physiques : ×π pour retrouver
// l'éclairage d'origine.
const PI = Math.PI

// Texte de remplissage quand l'avatar doit parler sans texte connu
// (aperçu de l'admin). Jamais affiché.
const TEXTE_REMPLISSAGE = 'Bonjour, je suis Axis. Je présente le travail de Fréjus avec plaisir.'

const DIST_CAMERA = 7.4
const VISEE_Y = -0.12

function texturePupille() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d')
  g.fillStyle = '#e4dbd2'; g.fillRect(0, 0, 512, 512)
  const cx = 128, cy = 256 // iris à u=.75 : face avant de la sphère
  g.save(); g.translate(cx, cy); g.scale(0.5, 1)
  const ir = g.createRadialGradient(0, 0, 4, 0, 0, 82)
  ir.addColorStop(0, '#0b0605'); ir.addColorStop(0.32, '#0b0605'); ir.addColorStop(0.36, '#4a2a1c'); ir.addColorStop(0.75, '#2e1810'); ir.addColorStop(1, '#120806')
  g.fillStyle = ir; g.beginPath(); g.arc(0, 0, 82, 0, Math.PI * 2); g.fill(); g.restore()
  g.strokeStyle = 'rgba(120,70,40,.35)'; g.lineWidth = 2
  for (let a = 0; a < 40; a++) {
    const t = a / 40 * Math.PI * 2
    g.beginPath(); g.moveTo(cx + Math.cos(t) * 12, cy + Math.sin(t) * 24); g.lineTo(cx + Math.cos(t) * 27, cy + Math.sin(t) * 54); g.stroke()
  }
  const sh = g.createLinearGradient(0, cy - 120, 0, cy + 120)
  sh.addColorStop(0, 'rgba(60,30,20,.35)'); sh.addColorStop(0.4, 'rgba(0,0,0,0)')
  g.fillStyle = sh; g.fillRect(0, 0, 512, 512)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function creerMoteurAvatar(canvas, { accent: accentInitial = '#10b981' } = {}) {
  const T0 = construireTete()
  const { P0, SLITP, SH, JAW_AMP, TOP, CHIN, yBot, prof, mC, mouthW, lipZ, SKIN, SKIN_LO } = T0

  const accent = brut(accentInitial)

  // ── Rendu
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.localClippingEnabled = true
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 60)

  function redimensionner(w, h) {
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const fit = Math.min(1, w / h * 1.1)
    camera.position.set(0, VISEE_Y, DIST_CAMERA / fit)
    camera.lookAt(0, VISEE_Y, 0)
    camera.updateProjectionMatrix()
  }

  scene.add(new THREE.HemisphereLight(brut(0xfff1e6), brut(0x1a2236), 0.55 * PI))
  const key = new THREE.DirectionalLight(brut(0xfff0e0), 1.25 * PI); key.position.set(-2.2, 2.4, 3.2); scene.add(key)
  const fill = new THREE.DirectionalLight(brut(0xdfe8ff), 0.35 * PI); fill.position.set(2.5, 0.3, 2.5); scene.add(fill)
  const rim = new THREE.DirectionalLight(accent.clone(), 1.6 * PI); rim.position.set(2.6, 1.2, -2.4); scene.add(rim)
  const rim2 = new THREE.DirectionalLight(brut(0xffffff), 0.5 * PI); rim2.position.set(-2.6, 0.6, -2.4); scene.add(rim2)

  // ── Tête
  const pos = new Float32Array(P0)
  const headGeo = new THREE.BufferGeometry()
  headGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  headGeo.setAttribute('color', new THREE.BufferAttribute(T0.COL, 3))
  headGeo.setIndex(new THREE.BufferAttribute(T0.idx, 1))
  headGeo.computeVertexNormals()
  // Équivalent de computeVertexNormals(), en boucle directe sur les tableaux
  // (appelé à chaque image : la version générique de three est plus lente).
  const nrm = headGeo.attributes.normal.array
  const tri = T0.idx
  function calculerNormales() {
    nrm.fill(0)
    for (let q = 0; q < tri.length; q += 3) {
      const a = tri[q] * 3, b = tri[q + 1] * 3, c = tri[q + 2] * 3
      const bx = pos[b], by = pos[b + 1], bz = pos[b + 2]
      const cbx = pos[c] - bx, cby = pos[c + 1] - by, cbz = pos[c + 2] - bz
      const abx = pos[a] - bx, aby = pos[a + 1] - by, abz = pos[a + 2] - bz
      const nx = cby * abz - cbz * aby, ny = cbz * abx - cbx * abz, nz = cbx * aby - cby * abx
      nrm[a] += nx; nrm[a + 1] += ny; nrm[a + 2] += nz
      nrm[b] += nx; nrm[b + 1] += ny; nrm[b + 2] += nz
      nrm[c] += nx; nrm[c + 1] += ny; nrm[c + 2] += nz
    }
    for (let o = 0; o < nrm.length; o += 3) {
      const l = Math.hypot(nrm[o], nrm[o + 1], nrm[o + 2]) || 1
      nrm[o] /= l; nrm[o + 1] /= l; nrm[o + 2] /= l
    }
    headGeo.attributes.normal.needsUpdate = true
  }
  const skinMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.5, metalness: 0, clearcoat: 0.06, clearcoatRoughness: 0.6 })
  const headMesh = new THREE.Mesh(headGeo, skinMat)

  const pivot = new THREE.Group(); scene.add(pivot)
  const headG = new THREE.Group(); pivot.add(headG)
  const NECKY = CHIN + 0.05
  pivot.position.set(0, NECKY, -0.1); headG.position.set(0, -NECKY, 0.1)
  headG.add(headMesh)

  // ── Yeux
  const eyeTex = texturePupille()
  const eyeMat = new THREE.MeshPhysicalMaterial({ map: eyeTex, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 })
  const lidMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.5, clearcoat: 0.1 })
  const reflet = new THREE.MeshBasicMaterial({ color: brut(0xffffff) })
  const bordPaupiere = lin('#0d0605')
  const eyes = []
  for (const E of [T0.eyeL, T0.eyeR]) {
    const g = new THREE.Group(); g.position.set(E.c[0], E.c[1], E.cz); headG.add(g)
    const ball = new THREE.Mesh(new THREE.SphereGeometry(E.r, 48, 32), eyeMat)
    const ballG = new THREE.Group(); ballG.add(ball); g.add(ballG)
    const cl = new THREE.Mesh(new THREE.SphereGeometry(E.r * 0.09, 12, 8), reflet)
    cl.position.set(E.r * 0.28, E.r * 0.32, E.r * 0.93); g.add(cl)
    const mkLid = (up) => {
      const geo = new THREE.SphereGeometry(E.r * 1.06, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5)
      const n = geo.attributes.position.count, col = new Float32Array(n * 3)
      for (let q = 0; q < n; q++) {
        const yy = geo.attributes.position.getY(q) / (E.r * 1.06)
        const edge = sstep(0.18, 0.0, yy)
        const cc = SKIN.clone().lerp(bordPaupiere, edge * (up ? 0.95 : 0.35))
        col.set([cc.r, cc.g, cc.b], q * 3)
      }
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
      const m = new THREE.Mesh(geo, lidMat)
      if (!up) m.rotation.z = Math.PI
      return m
    }
    const up = mkLid(true), lo = mkLid(false)
    g.add(up); g.add(lo)
    eyes.push({ ballG, up, lo })
  }

  // ── Sourcils (tubes effilés posés sur la peau)
  const browMat = new THREE.MeshStandardMaterial({ color: lin('#0d0807'), roughness: 0.85 })
  const brows = []
  for (const pts of T0.sourcils) {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])))
    const TS = 40, RS = 10
    const geo = new THREE.TubeGeometry(curve, TS, 1, RS, false)
    const p = geo.attributes.position
    for (let r = 0; r <= TS; r++) {
      const t = r / TS
      const pc = curve.getPoint(t)
      const th = lerp(0.0075, 0.0155, Math.pow(Math.sin(Math.PI * (t * 0.75 + 0.18)), 0.8)) * (t < 0.12 ? sstep(0, 0.12, t) * 0.8 + 0.2 : 1)
      for (let q = 0; q <= RS; q++) {
        const k = r * (RS + 1) + q
        const dx = p.getX(k) - pc.x, dy = p.getY(k) - pc.y, dz = p.getZ(k) - pc.z
        p.setXYZ(k, pc.x + dx * th, pc.y + dy * th, pc.z + dz * th * 0.45)
      }
    }
    geo.computeVertexNormals()
    const m = new THREE.Mesh(geo, browMat); headG.add(m); brows.push(m)
  }

  // ── Oreilles
  const earMat = new THREE.MeshPhysicalMaterial({ color: SKIN, roughness: 0.55, clearcoat: 0.08 })
  const conchaMat = new THREE.MeshStandardMaterial({ color: lin('#5a2f1e'), roughness: 0.8 })
  for (const { sgn, yc, hh, skull, wx } of T0.oreilles) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), earMat)
    ear.scale.set(wx, hh * 1.02, 0.1); ear.position.set(skull + sgn * wx * 0.35, yc, -0.06)
    ear.rotation.y = sgn * -0.55; ear.rotation.z = sgn * 0.06
    headG.add(ear)
    const con = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), conchaMat)
    con.scale.set(wx * 0.42, hh * 0.45, 0.04)
    con.position.set(skull + sgn * wx * 0.62, yc - 0.01, 0); con.rotation.copy(ear.rotation)
    headG.add(con)
  }

  // ── Lunettes (verres bleus sans monture, pont et branches dorés)
  headG.add(creerLunettes(T0))

  // ── Bouche : dents, langue, cavité
  const toothMat = new THREE.MeshPhysicalMaterial({ color: lin('#efe8df'), roughness: 0.25, clearcoat: 0.6 })
  const TR = mouthW * 0.62
  function teethArc(h, yTop) {
    const g = new THREE.CylinderGeometry(TR, TR * 0.97, h, 48, 1, true, -0.62, 1.24)
    const m = new THREE.Mesh(g, toothMat)
    m.position.set(mC[0], yTop - h / 2, lipZ - TR - 0.03)
    return m
  }
  const upT = teethArc(0.05, mC[1] + 0.022); headG.add(upT)
  const jawG = new THREE.Group(); headG.add(jawG)
  const loT = teethArc(0.035, mC[1] - 0.006); loT.position.z -= 0.035; jawG.add(loT)
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshStandardMaterial({ color: lin('#8e3c36'), roughness: 0.6 }))
  tongue.scale.set(mouthW * 0.34, 0.03, 0.12); tongue.position.set(mC[0], mC[1] - 0.07, lipZ - 0.2); jawG.add(tongue)
  const cav = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: brut(0x140504) }))
  cav.scale.set(mouthW * 0.5, 0.12, 0.12); cav.position.set(mC[0], mC[1] - 0.03, lipZ - 0.24); headG.add(cav)

  // ── Cou et col
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.29, 0.33, 0.44, 48, 1, true),
    new THREE.MeshPhysicalMaterial({ color: SKIN_LO, roughness: 0.55, side: THREE.DoubleSide }),
  )
  neck.position.set(0, CHIN - 0.06, -0.16); scene.add(neck)
  const collarMat = new THREE.MeshStandardMaterial({ color: accent.clone(), emissive: accent.clone(), emissiveIntensity: 0.8, roughness: 0.3 })
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.335, 0.012, 12, 64), collarMat)
  collar.rotation.x = Math.PI / 2; collar.position.set(0, CHIN - 0.28, -0.16); scene.add(collar)

  // ── Intérieur de la bouche (entre les dents et l'ouverture des lèvres)
  const nS = SLITP.length
  const fPos = new Float32Array(nS * 2 * 3), fIdx = []
  for (let q = 0; q < nS - 1; q++) {
    const a = q * 2, b = q * 2 + 1, c2 = (q + 1) * 2, d = (q + 1) * 2 + 1
    fIdx.push(a, b, c2, c2, b, d, a, c2, b, c2, d, b)
  }
  const fGeo = new THREE.BufferGeometry()
  fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3)); fGeo.setIndex(fIdx)
  const fillMesh = new THREE.Mesh(fGeo, new THREE.MeshBasicMaterial({ color: lin('#120403') })); headG.add(fillMesh)
  function updFill() {
    for (let q = 0; q < nS; q++) {
      const [ku, kl] = SLITP[q]
      fPos[q * 6] = pos[ku * 3]; fPos[q * 6 + 1] = pos[ku * 3 + 1] - 0.0015; fPos[q * 6 + 2] = P0[ku * 3 + 2] - 0.045
      fPos[q * 6 + 3] = pos[kl * 3]; fPos[q * 6 + 4] = pos[kl * 3 + 1] + 0.0015; fPos[q * 6 + 5] = P0[kl * 3 + 2] - 0.045
    }
    fGeo.attributes.position.needsUpdate = true
    fGeo.computeBoundingSphere()
  }

  // ── Apparition holographique (plan de coupe qui descend + anneau de scan)
  const clipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 99)
  scene.traverse((o) => {
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.clippingPlanes = [clipPlane] })
  })
  const scanMat = new THREE.MeshBasicMaterial({ color: accent.clone(), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  const scan = new THREE.Mesh(new THREE.TorusGeometry(1, 0.008, 8, 96), scanMat)
  scan.rotation.x = Math.PI / 2; scene.add(scan)
  const scanGlowMat = new THREE.MeshBasicMaterial({ color: accent.clone(), transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  const scanGlow = new THREE.Mesh(new THREE.RingGeometry(0, 1, 64), scanGlowMat)
  scanGlow.rotation.x = -Math.PI / 2; scene.add(scanGlow)
  let holoT = 0
  const HOLO_D = 2.4
  function updHolo(dt) {
    holoT += dt
    const p = Math.min(1, holoT / HOLO_D)
    const e = 1 - Math.pow(1 - p, 2)
    const h = lerp(TOP + 0.12, CHIN - 0.5, e)
    clipPlane.constant = p >= 1 ? 99 : -h
    const vis = p < 1
    scan.visible = scanGlow.visible = vis
    if (vis) {
      const yl = Math.min(TOP - 0.02, Math.max(h, yBot + 0.02))
      const [xl, xr] = h > CHIN ? prof(yl) : [-0.31, 0.31]
      const W = Math.max(0.28, (xr - xl) / 2) * 1.08
      scan.position.set(0, h, h > CHIN ? 0.02 : -0.16); scan.scale.set(W, W * 1.05, 1)
      scanGlow.position.copy(scan.position); scanGlow.scale.set(W, W * 1.05, 1)
      scanMat.opacity = 0.9 * (1 - Math.pow(p, 6))
    }
    skinMat.emissive.copy(accent)
    skinMat.emissiveIntensity = vis ? 0.35 * (1 - p) : 0
  }

  // ── Application des formes
  const W = { jaw: 0, smile: 0, wide: 0, round: 0, press: 0, browL: 0, browR: 0, browIn: 0, blinkL: 0, blinkR: 0, squint: 0 }
  const T = { ...W }
  function apply() {
    pos.set(P0)
    for (const k in SH) {
      const a = W[k]
      if (Math.abs(a) < 1e-3) continue
      const s = SH[k]
      for (let q = 0; q < s.ids.length; q++) {
        const o = s.ids[q] * 3
        pos[o] += s.d[q * 3] * a; pos[o + 1] += s.d[q * 3 + 1] * a; pos[o + 2] += s.d[q * 3 + 2] * a
      }
    }
    headGeo.attributes.position.needsUpdate = true
    calculerNormales()
    updFill()
    brows[0].position.set(W.browIn * 0.004, W.browL * 0.03 + W.browIn * 0.012, 0)
    brows[1].position.set(-W.browIn * 0.004, W.browR * 0.03 + W.browIn * 0.012, 0)
    brows[0].rotation.z = -W.browIn * 0.08; brows[1].rotation.z = W.browIn * 0.08
    jawG.position.y = -W.jaw * JAW_AMP * 0.92; jawG.position.z = -W.jaw * 0.02
    upT.scale.x = loT.scale.x = 1 + W.wide * 0.08 + W.smile * 0.08 - W.round * 0.12
    eyes.forEach((e, i) => {
      const b = i === 0 ? W.blinkL : W.blinkR
      e.up.rotation.x = lerp(-0.22, 0.2, b) + W.squint * 0.18 - W.browL * 0.04
      e.lo.rotation.x = lerp(0.42, 0.22, Math.max(b * 0.5, W.squint * 0.6 + W.smile * 0.3))
    })
  }

  // ── Comportement
  const pose = { yaw: { x: 0, v: 0, t: 0 }, pitch: { x: 0, v: 0, t: 0 }, roll: { x: 0, v: 0, t: 0 } }
  const stepS = (s, dt, k = 40, d = 11) => { s.v += (k * (s.t - s.x) - d * s.v) * dt; s.x += s.v * dt }
  let nod = 0, nodV = 0
  const kickNod = (a) => { nodV += a }
  const gaze = { x: 0, y: 0 }
  let gazeT = { x: 0, y: 0 }, nextSacc = 0
  let etat = 'idle' // 'idle' | 'think' | 'speak'
  let texte = ''
  let speech = null
  let clock = 0, browPulse = 0, smilePulse = 0, blinkT = -1, nextBlink = 1.5
  const blinkNow = () => { if (blinkT < 0) blinkT = 0 }

  function demarrerParole() {
    const remplissage = !texte
    const { ev, dur } = construireTimeline(remplissage ? TEXTE_REMPLISSAGE : texte)
    speech = { ev, dur, t0: clock, p: 0, v: {}, fin: null, remplissage }
  }

  function updSpeech(t) {
    if (!speech) return
    const tt = t - speech.t0
    while (speech.p < speech.ev.length && speech.ev[speech.p].t <= tt) {
      const e = speech.ev[speech.p]
      if (speech.fin != null && e.i >= speech.fin) break // attend la voix
      speech.p++
      if (e.v) speech.v = e.v
      if (tt - e.t > 0.3) continue // rattrapage : pas de gestes en rafale
      if (e.word) {
        if (e.emph) { browPulse = 1; kickNod(1.4) } else if (Math.random() < 0.25) kickNod(0.6)
        if (Math.random() < 0.2) pose.yaw.t = (Math.random() - 0.5) * 0.14
        if (Math.random() < 0.3) gazeT = { x: (Math.random() - 0.5) * 0.3, y: (Math.random() - 0.5) * 0.15 }
      }
      if (e.end) {
        smilePulse = 1
        kickNod(e.end === '?' ? -1.4 : 2)
        if (e.end === '?') { browPulse = 1.2; pose.roll.t = 0.06 }
        if (Math.random() < 0.8) blinkNow()
        gazeT = { x: 0, y: 0 }
      }
      if (e.pause && Math.random() < 0.5) blinkNow()
    }
    if (speech.p >= speech.ev.length && tt > speech.dur) {
      speech.v = {} // texte terminé : bouche au repos
      if (speech.remplissage && tt > speech.dur + 0.6) demarrerParole()
    }
  }

  function definirEtat(nouvel) {
    const e = nouvel === 'thinking' ? 'think' : nouvel === 'speaking' ? 'speak' : 'idle'
    if (e === etat) return
    etat = e
    speech = null
    if (e === 'speak') demarrerParole()
    if (e === 'think') kickNod(-1.2)
  }

  function definirTexte(nouveau) {
    const t = nouveau || ''
    if (t === texte) return
    texte = t
    if (etat === 'speak') demarrerParole()
  }

  // Position de la voix réelle dans le texte (mot par mot)
  function synchroniserVoix({ debut, fin }) {
    if (!speech || speech.remplissage) return
    speech.fin = fin
    const e = speech.ev.find((x) => x.i >= debut && x.v)
    if (e) speech.t0 = clock - e.t
  }

  function definirAccent(hex) {
    accent.copy(brut(hex))
    rim.color.copy(accent)
    collarMat.color.copy(accent); collarMat.emissive.copy(accent)
    scanMat.color.copy(accent); scanGlowMat.color.copy(accent)
  }

  // ── Souris : position mesurée par rapport à l'avatar lui-même. Sans
  // mouvement récent, l'attention retombe et la tête revient de face.
  let px = 0, py = 0, mx = 0, my = 0, dernierMouvement = -10
  const surPointeur = (e) => {
    const r = canvas.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.42
    px = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.45)))
    py = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.45)))
    dernierMouvement = performance.now() / 1000
  }
  window.addEventListener('pointermove', surPointeur)

  // ── Boucle d'animation
  let rafId = null, last = 0
  function frame(ms) {
    rafId = requestAnimationFrame(frame)
    const now = ms / 1000
    const dt = last ? Math.min(0.04, now - last) : 0.016
    last = now
    clock += dt
    const t = clock
    for (const k in T) T[k] = 0
    // Attention : 1 tant que la souris bouge, retombe à 0 deux secondes après
    const attention = 1 - Math.min(1, Math.max(0, (now - dernierMouvement - 2) / 1.2))
    mx = lerp(mx, px * attention, Math.min(1, dt * 6))
    my = lerp(my, py * attention, Math.min(1, dt * 6))
    if (etat === 'idle') {
      // Sourire permanent, qui s'accentue de temps en temps
      T.smile = 1.6 + 0.3 * Math.pow(Math.max(0, Math.sin(t * 0.35)), 6)
      // De face au repos, la tête suit franchement la souris
      pose.yaw.t = mx * 0.42 + Math.sin(t * 0.31) * 0.01
      pose.pitch.t = my * 0.24 - 0.05 * (1 - attention) + Math.sin(t * 0.23) * 0.008
      pose.roll.t = -mx * 0.04
      if (attention > 0.05) gazeT = { x: mx * 0.55, y: -my * 0.35 }
      else if (t > nextSacc) {
        gazeT = { x: (Math.random() - 0.5) * 0.06, y: 0.12 + (Math.random() - 0.5) * 0.04 }
        nextSacc = t + 1.5 + Math.random() * 2.5
      }
    }
    if (etat === 'think') {
      pose.yaw.t = 0.12 + Math.sin(t * 0.6) * 0.02
      pose.pitch.t = -0.1 + Math.sin(t * 0.8) * 0.012
      pose.roll.t = 0.08
      T.browIn = 0.5; T.browR = 0.8; T.browL = 0.1; T.press = 0.6; T.round = 0.2 + 0.1 * Math.sin(t * 1.3); T.squint = 0.5
      gazeT = { x: 0.45, y: 0.32 }
    }
    if (etat === 'speak') {
      updSpeech(t)
      const v = speech ? speech.v : {}
      for (const k in v) T[k] = v[k]
      T.smile = Math.max(T.smile, 0.9 + smilePulse * 0.5)
      T.browL += browPulse * 0.7; T.browR += browPulse * 0.8; T.browIn += browPulse * 0.15
      pose.yaw.t = lerp(pose.yaw.t, mx * 0.25, 0.04)
      pose.pitch.t = Math.sin(t * 1.1) * 0.02 + my * 0.12
      pose.roll.t = lerp(pose.roll.t, Math.sin(t * 0.7) * 0.03, 0.02)
    }
    browPulse = Math.max(0, browPulse - dt * 2.2)
    smilePulse = Math.max(0, smilePulse - dt * 1.1)
    T.jaw = Math.max(T.jaw, etat === 'speak' ? T.smile * 0.12 : 0)
    if (t > nextBlink) { blinkNow(); nextBlink = t + 2.2 + Math.random() * 3.5 }
    let bl = 0
    if (blinkT >= 0) { blinkT += dt; const d = 0.17; bl = blinkT < d ? Math.sin(blinkT / d * Math.PI) : 0; if (blinkT >= d) blinkT = -1 }
    T.blinkL = Math.min(1, T.blinkL + bl); T.blinkR = Math.min(1, T.blinkR + bl)
    for (const k in W) {
      const r = (k === 'jaw' || k === 'press' || k === 'round' || k === 'wide') ? 22 : (k.startsWith('blink') ? 45 : 6)
      W[k] = lerp(W[k], T[k], Math.min(1, dt * r))
    }
    apply()
    updHolo(dt)
    gaze.x = lerp(gaze.x, gazeT.x, Math.min(1, dt * 14)); gaze.y = lerp(gaze.y, gazeT.y, Math.min(1, dt * 14))
    eyes.forEach((e) => { e.ballG.rotation.y = gaze.x * 0.5; e.ballG.rotation.x = -gaze.y * 0.45 })
    for (const k in pose) stepS(pose[k], dt)
    nodV += (-nod * 90 - nodV * 13) * dt; nod += nodV * dt
    pivot.rotation.set(pose.pitch.x + nod * 0.06 + W.jaw * 0.03, pose.yaw.x, pose.roll.x)
    pivot.position.y = NECKY + Math.sin(t * 1.25) * 0.006
    rim.intensity = (1.5 + (etat === 'speak' ? W.jaw * 0.6 : 0)) * PI
    renderer.render(scene, camera)
  }

  function definirActif(actif) {
    if (actif && rafId == null) { last = 0; rafId = requestAnimationFrame(frame) }
    if (!actif && rafId != null) { cancelAnimationFrame(rafId); rafId = null }
  }

  function detruire() {
    definirActif(false)
    window.removeEventListener('pointermove', surPointeur)
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose())
    })
    eyeTex.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  return { redimensionner, definirEtat, definirTexte, synchroniserVoix, definirAccent, definirActif, detruire }
}
