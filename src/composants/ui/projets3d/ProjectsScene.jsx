import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { TOUCH, Vector3 } from 'three'
import { OrbitControls } from '@react-three/drei'
import ProjectShape from './ProjectShape'
import SceneEnvironment from './SceneEnvironment'
import IntroSequence from './IntroSequence'
import SceneParallaxGroup from './SceneParallaxGroup'
import { genererPositions } from './scenePositions'

const angleCourt = (a) => Math.atan2(Math.sin(a), Math.cos(a))

// Caméra de mise au point : elle tourne autour du centre de l'anneau jusqu'au
// projet ciblé, puis s'en approche lentement. Dès que le visiteur manipule la
// scène, elle lui rend la main (OrbitControls reste maître).
function CameraFocus({ cible, controlsRef, isMobile, lectureRef, transitionRef }) {
  const { camera } = useThree()
  const cibleV = useMemo(() => new Vector3(), [])
  const cleCible = cible ? cible.join(',') : ''

  useEffect(() => { if (cible) transitionRef.current = true }, [cleCible]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls || !cible) return
    cibleV.set(cible[0], cible[1], cible[2])
    const loin = isMobile ? 5.8 : 4.6
    const pres = isMobile ? 4.8 : 3.6

    if (transitionRef.current) {
      const k = 1 - Math.exp(-delta * 2.1)
      // Angle et distance de la caméra autour de l'axe central
      const thetaC = Math.atan2(camera.position.z, camera.position.x)
      const rayonC = Math.hypot(camera.position.x, camera.position.z)
      const dirCible = Math.hypot(cibleV.x, cibleV.z) > 0.01 ? Math.atan2(cibleV.z, cibleV.x) : Math.PI / 2
      const rayonG = Math.hypot(cibleV.x, cibleV.z) + loin
      const theta = thetaC + angleCourt(dirCible - thetaC) * k
      const rayon = rayonC + (rayonG - rayonC) * k
      const y = camera.position.y + (cibleV.y + 0.45 - camera.position.y) * k
      camera.position.set(Math.cos(theta) * rayon, y, Math.sin(theta) * rayon)
      controls.target.lerp(cibleV, k)
      controls.update()
      if (Math.abs(angleCourt(dirCible - theta)) < 0.004 && Math.abs(rayonG - rayon) < 0.03 && controls.target.distanceTo(cibleV) < 0.02) {
        transitionRef.current = false
      }
    } else if (lectureRef.current) {
      // Mise au point progressive : la caméra s'approche doucement du projet
      const d = camera.position.distanceTo(controls.target)
      if (d > pres) {
        const nd = d + (pres - d) * Math.min(delta * 0.18, 1)
        camera.position.sub(controls.target).setLength(nd).add(controls.target)
        controls.update()
      }
    }
  })

  return null
}

// Décale le cadrage pour que le projet ciblé ne soit pas caché par le panneau :
// vers la droite sur bureau, vers le haut sur téléphone.
function CadrageDecale({ isMobile }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const { width: w, height: h } = size
    camera.setViewOffset(w, h, isMobile ? 0 : -w * 0.14, isMobile ? h * 0.14 : 0, w, h)
    camera.updateProjectionMatrix()
    return () => { camera.clearViewOffset(); camera.updateProjectionMatrix() }
  }, [camera, size, isMobile])
  return null
}

export default function ProjectsScene({ projets, categories, filtreActif, focusIndex, enLecture, onSelectProjet, onFocus, onManipulation, isMobile, positions: positionsProp }) {
  const positions = useMemo(() => positionsProp || genererPositions(projets.length), [positionsProp, projets.length])
  const controlsRef = useRef()
  const transitionRef = useRef(false)
  const lectureRef = useRef(enLecture)
  const [introTermine, setIntroTermine] = useState(false)
  useEffect(() => { lectureRef.current = enLecture }, [enLecture])

  const cible = introTermine ? positions[focusIndex] || null : null

  const cliquer = (projet, index) => {
    if (index === focusIndex) onSelectProjet(projet)
    else onFocus(index)
  }

  return (
    <Canvas camera={{ position: [0, 0, isMobile ? 14 : 10], fov: 50 }} shadows>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -5, 5]} color="#ffffff" intensity={0.6} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={introTermine}
        minDistance={isMobile ? 3.4 : 2.2}
        maxDistance={isMobile ? 20 : 18}
        enabled={introTermine}
        touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
        onStart={() => { transitionRef.current = false; onManipulation(true) }}
        onEnd={() => onManipulation(false)}
      />
      <CadrageDecale isMobile={isMobile} />
      <CameraFocus cible={cible} controlsRef={controlsRef} isMobile={isMobile} lectureRef={lectureRef} transitionRef={transitionRef} />
      {!introTermine && <IntroSequence onComplete={() => setIntroTermine(true)} isMobile={isMobile} />}
      <Suspense fallback={null}>
        <SceneParallaxGroup actif={false}>
          <SceneEnvironment />
          {projets.map((projet, index) => (
            <ProjectShape
              key={projet.num}
              projet={projet}
              position={positions[index]}
              categoryColor={categories[projet.type]?.color || '#ffffff'}
              onSelect={() => cliquer(projet, index)}
              isDimmed={filtreActif !== 'TOUS' && projet.type !== filtreActif}
              isSelected={introTermine && index === focusIndex}
              estEnRetrait={introTermine && index !== focusIndex}
              hasSelection={false}
              isMobile={isMobile}
              idx={index}
              sceneStartTime={0}
            />
          ))}
        </SceneParallaxGroup>
      </Suspense>
    </Canvas>
  )
}
