import { useState, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, useTexture } from '@react-three/drei'

const easeOutBack = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export default function ProjectShape({ projet, position, categoryColor, onSelect, isDimmed, isSelected, hasSelection, isMobile, idx, sceneStartTime }) {
  const groupRef = useRef()
  const orbitRef = useRef()
  const [hovered, setHovered] = useState(false)
  const texture = useTexture(projet.img)
  const hasTexture = texture && texture.image
  const safeStartTime = useMemo(() => (typeof sceneStartTime === 'number' ? sceneStartTime : 0), [sceneStartTime])

  useFrame((state, delta) => {
    if (!groupRef.current || !orbitRef.current) return

    const time = state.clock.elapsedTime - safeStartTime
    const delay = idx * 0.09
    const introDuration = 0.6
    const raw = (time - delay) / introDuration
    const progress = Math.min(Math.max(raw, 0), 1)
    const introScale = progress === 0 ? 0 : easeOutBack(progress)
    const introOpacity = Math.min(Math.max(progress, 0), 1)

    const shouldAnimate = !hasSelection || isSelected
    const bob = shouldAnimate ? Math.sin(state.clock.elapsedTime * 1.2 + position[0] + position[1]) * 0.15 : 0
    groupRef.current.position.y = position[1] + bob

    const targetScale = isSelected ? 1.35 : hovered ? 1.15 : 1
    const scaleFallback = safeStartTime ? targetScale * introScale : targetScale
    const finalScale = safeStartTime ? targetScale * introScale : scaleFallback
    groupRef.current.scale.set(finalScale, finalScale, finalScale)

    const orbitSpeed = 0.7 + (idx % 5) * 0.05
    const speed = hovered ? orbitSpeed * 1.7 : orbitSpeed
    const angle = state.clock.elapsedTime * speed + idx * 0.85
    const tilt = 0.35
    const radius = 1.35
    orbitRef.current.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * Math.sin(tilt),
      Math.sin(angle) * radius * Math.cos(tilt)
    )
    orbitRef.current.scale.set(hovered ? 1.14 : 1, hovered ? 1.14 : 1, hovered ? 1.14 : 1)

    const children = groupRef.current.children
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i]
      if (child.material) {
        if (child.material.transparent !== true) {
          child.material.transparent = true
        }
        child.material.opacity = isDimmed ? 0.35 * introOpacity : introOpacity
      }
    }
  })

  const baseOpacity = isDimmed ? 0.35 : 1
  const emissiveIntensity = isSelected ? 0.22 : hovered ? 0.12 : 0.08

  const handlePointerOver = (e) => {
    if (isDimmed || isMobile) return
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e) => {
    if (isDimmed || isMobile) return
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'default'
  }

  const handleClick = () => {
    if (isDimmed) return
    onSelect(projet)
  }

  return (
    <group position={position}>
      <Billboard follow lockX={false} lockY={false} lockZ={false} raycast={() => null}>
        <group ref={groupRef} scale={[0, 0, 0]}>
          <mesh
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
            castShadow
            receiveShadow
            transparent
            opacity={baseOpacity}
          >
            <boxGeometry args={[1.7, 1.05, 0.01]} />
            <meshStandardMaterial
              map={hasTexture ? texture : null}
              color={hasTexture ? '#FFFFFF' : '#ffffff'}
              metalness={0.15}
              roughness={0.5}
              emissive={categoryColor}
              emissiveIntensity={emissiveIntensity}
              transparent
              opacity={baseOpacity}
            />
          </mesh>

          <mesh position={[0, 0, -0.03]} raycast={() => null}>
            <planeGeometry args={[1.95, 1.25]} />
            <meshBasicMaterial color={categoryColor} transparent opacity={0.08} toneMapped={false} />
          </mesh>

          <group raycast={() => null}>
            {[{
              position: [-0.92, 0.43, 0.022], scale: [0.01, 0.15, 0.01]
            }, {
              position: [-0.82, 0.53, 0.022], scale: [0.15, 0.01, 0.01]
            }, {
              position: [0.92, 0.43, 0.022], scale: [0.01, 0.15, 0.01]
            }, {
              position: [0.82, 0.53, 0.022], scale: [0.15, 0.01, 0.01]
            }, {
              position: [-0.92, -0.43, 0.022], scale: [0.01, 0.15, 0.01]
            }, {
              position: [-0.82, -0.53, 0.022], scale: [0.15, 0.01, 0.01]
            }, {
              position: [0.92, -0.43, 0.022], scale: [0.01, 0.15, 0.01]
            }, {
              position: [0.82, -0.53, 0.022], scale: [0.15, 0.01, 0.01]
            }].map((segment, index) => (
              <mesh key={index} position={segment.position}>
                <boxGeometry args={segment.scale} />
                <meshBasicMaterial color={categoryColor} transparent opacity={0.6} toneMapped={false} />
              </mesh>
            ))}
          </group>

          <mesh ref={orbitRef} raycast={() => null}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color={categoryColor} transparent opacity={baseOpacity} />
          </mesh>
        </group>
      </Billboard>

    </group>
  )
}
