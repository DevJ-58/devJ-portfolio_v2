import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

export default function SceneParallaxGroup({ children, actif }) {
  console.log('parallax actif:', actif)
  const groupRef = useRef()
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event) => {
      mouseRef.current.x = MathUtils.clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1)
      mouseRef.current.y = MathUtils.clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(() => {
    if (!groupRef.current) return

    const targetY = actif ? mouseRef.current.x * 0.06 : 0
    const targetX = actif ? -mouseRef.current.y * 0.04 : 0

    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.04)
    groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.04)
  })

  return <group ref={groupRef}>{children}</group>
}
