import { Stars, Sparkles, Points } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'

function sampleTerrainNoise(x, z) {
  return (
    Math.sin(x * 0.24) * Math.cos(z * 0.19) * 0.35 +
    Math.sin((x + z) * 0.18) * 0.27 +
    Math.cos(z * 0.33) * Math.sin(x * 0.14) * 0.16
  )
}

export default function SceneEnvironment() {
  const terrainRef = useRef()
  const gridPoints = useMemo(() => {
    const positions = []
    const extent = 15
    const step = 1.5
    for (let x = -extent; x <= extent; x += step) {
      for (let z = -extent; z <= extent; z += step) {
        positions.push(x, -6.5, z)
      }
    }
    return new Float32Array(positions)
  }, [])

  useEffect(() => {
    const geo = terrainRef.current
    if (!geo) return

    const positions = geo.attributes.position
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i)
      const z = positions.getZ(i)
      positions.setY(i, sampleTerrainNoise(x, z))
    }

    positions.needsUpdate = true
    geo.computeVertexNormals()
  }, [])

  return (
    <>
      <fogExp2 attach="fog" args={['#0a0d12', 0.045]} />
      <Stars radius={60} depth={50} count={800} factor={2} saturation={0} fade speed={0.15} />
      <Sparkles count={30} scale={12} size={2} speed={0.2} color="#5d94c3" opacity={0.25} />

      <group position={[0, -6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <gridHelper args={[40, 40, '#3d5d80', '#111']} />
      </group>

      <group position={[0, -7, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <planeGeometry ref={terrainRef} args={[40, 40, 24, 24]} />
          <meshBasicMaterial color="#3f6f94" wireframe transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={gridPoints.length / 3} array={gridPoints} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#5d94c3" transparent opacity={0.18} sizeAttenuation />
      </points>
    </>
  )
}
