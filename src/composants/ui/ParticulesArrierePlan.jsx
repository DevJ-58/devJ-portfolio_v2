import { useEffect, useRef } from 'react'

export default function ParticulesArrierePlan() {
  const refCanvas = useRef(null)

  useEffect(() => {
    const canvas = refCanvas.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particules = []
    for (let i = 0; i < 50; i++) {
      particules.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        taille: Math.random() * 2 + 1,
      })
    }

    function animer() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particules.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.taille, 0, Math.PI * 2)
        ctx.fill()
      })
      requestAnimationFrame(animer)
    }
    animer()
  }, [])

  return (
    <canvas
      ref={refCanvas}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}