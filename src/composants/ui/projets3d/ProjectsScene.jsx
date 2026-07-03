import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { TOUCH, Vector3 } from 'three'
import { OrbitControls } from '@react-three/drei'
import ProjectShape from './ProjectShape'
import SceneEnvironment from './SceneEnvironment'
import IntroSequence from './IntroSequence'
import SceneParallaxGroup from './SceneParallaxGroup'
import { genererPositions } from './scenePositions'

// Helper: Compare deux positions (arrays) pour l'égalité
const positionsEqual = (pos1, pos2) => {
  if (!pos1 || !pos2) return pos1 === pos2
  return pos1[0] === pos2[0] && pos1[1] === pos2[1] && pos1[2] === pos2[2]
}

function CameraRig({ targetPosition, previewTarget, isActive, isMobile, controlsRef, setIsTransitioning }) {
  const { camera } = useThree()
  const lookAtTarget = useMemo(() => new Vector3(), [])
  const goal = useMemo(() => new Vector3(), [])
  const defaultPosition = useMemo(() => new Vector3(0, 0, isMobile ? 14 : 10), [isMobile])
  const prevActive = useRef(isActive)
  const prevPreview = useRef(Boolean(previewTarget))
  const prevTargetPosition = useRef(targetPosition)
  const prevPreviewTarget = useRef(previewTarget)
  const transitioningRef = useRef(false)

  useFrame((state, delta) => {
    const controls = controlsRef?.current
    if (!controls) return

    const isPreview = !isActive && Boolean(previewTarget)
    
    // Détecte une transition si:
    // 1) isActive change (sélection complète activée/désactivée)
    // 2) isPreview change (mode aperçu activé/désactivé)
    // 3) targetPosition change (quand on a une sélection complète)
    // 4) previewTarget change (quand on navigue dans les aperçus)
    const shouldTransition = 
      isActive !== prevActive.current || 
      isPreview !== prevPreview.current ||
      !positionsEqual(targetPosition, prevTargetPosition.current) ||
      !positionsEqual(previewTarget, prevPreviewTarget.current)

    if (shouldTransition) {
      prevActive.current = isActive
      prevPreview.current = isPreview
      prevTargetPosition.current = targetPosition
      prevPreviewTarget.current = previewTarget
      transitioningRef.current = true
      setIsTransitioning(true)
    }

    // Calcule le goal en fonction de l'état actuel
    if (isActive && targetPosition) {
      goal.set(targetPosition[0], targetPosition[1] + 0.4, targetPosition[2] + 1.6)
      lookAtTarget.set(targetPosition[0], targetPosition[1], targetPosition[2])
    } else if (!isActive && isPreview && previewTarget) {
      goal.set(previewTarget[0], previewTarget[1], previewTarget[2] + 3.2)
      lookAtTarget.set(previewTarget[0], previewTarget[1], previewTarget[2])
    } else {
      goal.copy(defaultPosition)
      lookAtTarget.set(0, 0, 0)
    }

    // IMPORTANT: N'appliquer lerp et lookAt QUE si une transition est en cours
    // Cela évite que la caméra soit tirée en arrière quand l'utilisateur contrôle OrbitControls
    if (transitioningRef.current) {
      camera.position.lerp(goal, Math.min(delta * 2.8, 1))
      camera.lookAt(lookAtTarget)

      // Une fois le goal atteint, termine la transition et remet le contrôle à OrbitControls
      if (camera.position.distanceTo(goal) < 0.05) {
        camera.position.copy(goal)
        if (isActive && targetPosition) {
          controls.target.set(targetPosition[0], targetPosition[1], targetPosition[2])
        } else if (!isActive && isPreview && previewTarget) {
          controls.target.set(previewTarget[0], previewTarget[1], previewTarget[2])
        } else {
          controls.target.set(0, 0, 0)
        }
        controls.update()
        
        // Fin de la transition : arrête le lerp et laisse OrbitControls seul maître
        transitioningRef.current = false
        setIsTransitioning(false)
      }
    }
  })

  return null
}

export default function ProjectsScene({ projets, categories, filtreActif, projetSelectionne, onSelectProjet, isMobile, positions: positionsProp, previewTarget }) {
  const positions = useMemo(() => positionsProp || genererPositions(projets.length), [positionsProp, projets.length])
  const selectedIndex = useMemo(
    () => projets.findIndex((projet) => projet.num === projetSelectionne?.num),
    [projets, projetSelectionne]
  )
  const selectedPosition = selectedIndex >= 0 ? positions[selectedIndex] : null
  const hasSelection = Boolean(projetSelectionne)
  const controlsRef = useRef()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [introTermine, setIntroTermine] = useState(false)

  return (
    <Canvas camera={{ position: [0, 0, isMobile ? 14 : 10], fov: 50 }} shadows>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -5, 5]} color="#ffffff" intensity={0.6} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={introTermine && !hasSelection && !isTransitioning}
        minDistance={isMobile ? 8 : 6}
        maxDistance={isMobile ? 20 : 18}
        enableRotate={!hasSelection && !isTransitioning}
        autoRotate={introTermine && !hasSelection && !isTransitioning}
        autoRotateSpeed={0.3}
        enabled={introTermine && !hasSelection && !isTransitioning}
        touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
      />
      <CameraRig
        targetPosition={selectedPosition}
        previewTarget={previewTarget}
        isActive={introTermine && hasSelection}
        isMobile={isMobile}
        controlsRef={controlsRef}
        setIsTransitioning={setIsTransitioning}
      />
      { !introTermine && (
        <IntroSequence onComplete={() => setIntroTermine(true)} isMobile={isMobile} />
      ) }
      <Suspense fallback={null}>
        <SceneParallaxGroup actif={introTermine && !projetSelectionne && !isMobile}>
          <SceneEnvironment />
          {projets.map((projet, index) => {
            const isSelected = projetSelectionne?.num === projet.num
            const isDimmedBySelection = projetSelectionne ? !isSelected : filtreActif !== 'TOUS' && projet.type !== filtreActif

            return (
              <ProjectShape
                key={projet.num}
                projet={projet}
                position={positions[index]}
                categoryColor={categories[projet.type]?.color || '#ffffff'}
                onSelect={onSelectProjet}
                isDimmed={isDimmedBySelection}
                isSelected={isSelected}
                hasSelection={hasSelection}
                isMobile={isMobile}
                idx={index}
                sceneStartTime={0}
              />
            )
          })}
        </SceneParallaxGroup>
      </Suspense>
    </Canvas>
  )
}
