import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

export default function IntroSequence({ onComplete, isMobile }) {
  const { camera } = useThree()
  const startTime = useRef(null)
  const hasCompleted = useRef(false)
  const startPosition = useMemo(
    () => new Vector3(-2.2, 1.1, (isMobile ? 14 : 10) + 8),
    [isMobile]
  )
  const targetPosition = useMemo(
    () => new Vector3(0, 0, isMobile ? 14 : 10),
    [isMobile]
  )
  const startFov = 65
  const targetFov = 50
  const duration = 2.2

  useEffect(() => {
    camera.position.copy(startPosition)
    camera.fov = startFov
    camera.updateProjectionMatrix()
    camera.lookAt(0, 0, 0)
  }, [camera, startPosition])

  useFrame((state) => {
    if (hasCompleted.current) return

    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime
    }

    const raw = (state.clock.elapsedTime - startTime.current) / duration
    const progress = Math.min(Math.max(raw, 0), 1)
    console.log('intro progression:', progress)
    const eased = easeOutCubic(progress)

    camera.position.lerpVectors(startPosition, targetPosition, eased)
    camera.fov = startFov + (targetFov - startFov) * eased
    camera.updateProjectionMatrix()
    camera.lookAt(0, 0, 0)

    if (progress >= 1 && !hasCompleted.current) {
      console.log('INTRO onComplete appelé')
      hasCompleted.current = true
      onComplete()
    }
  })

  return null
}
