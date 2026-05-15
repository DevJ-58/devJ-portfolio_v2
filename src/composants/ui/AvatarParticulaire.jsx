import { useEffect, useRef } from 'react'

export default function AvatarParticulaire({ width = 280, height = 280, etat = 'idle' }) {
  const canvasRef = useRef(null)
  const etatRef = useRef(etat)
  useEffect(() => { etatRef.current = etat }, [etat])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    const W = width, H = height, CX = W/2, CY = H/2
    let frame = 0, mounted = true, rafId = null

    const rings = [
      { r:W*0.361, spd:0.004,  gaps:3, gapSize:0.32, ticks:60, tw:6 },
      { r:W*0.3,   spd:-0.007, gaps:2, gapSize:0.18, ticks:48, tw:4 },
      { r:W*0.239, spd:0.012,  gaps:4, gapSize:0.22, ticks:36, tw:8 },
      { r:W*0.178, spd:-0.018, gaps:2, gapSize:0.28, ticks:24, tw:5 },
      { r:W*0.117, spd:0.025,  gaps:3, gapSize:0.38, ticks:16, tw:7 },
    ]
    const rots = rings.map(() => Math.random() * Math.PI * 2)

    const orbs = []
    for (let i = 0; i < 6; i++) {
      orbs.push({
        r: rings[i % rings.length].r + W*0.039,
        angle: i*(Math.PI*2/6),
        spd: 0.015 + i*0.004,
        sz: 3 + i%3
      })
    }

    const streams = []
    for (let i = 0; i < 20; i++) {
      streams.push({
        angle: i*(Math.PI*2/20),
        len: 0,
        maxLen: W*0.05 + Math.random()*W*0.06,
        r: rings[0].r + W*0.011,
        phase: Math.random()*Math.PI*2,
        active: false
      })
    }

    const waveN = 64
    const wave = new Array(waveN).fill(0)

    function drawRing(ring, rot, alpha, lw) {
      const { r, gaps, gapSize, ticks, tw } = ring
      const gapAngle = gapSize
      const arcLen = (Math.PI*2 - gaps*gapAngle) / gaps
      ctx.lineWidth = lw || 1.2
      for (let g = 0; g < gaps; g++) {
        const start = rot + g*(arcLen + gapAngle)
        ctx.beginPath()
        ctx.arc(CX, CY, r, start, start + arcLen)
        ctx.strokeStyle = `rgba(16,185,129,${alpha})`
        ctx.stroke()
      }
      for (let t = 0; t < ticks; t++) {
        const a = rot + t*(Math.PI*2/ticks)
        const isMajor = t%(ticks/8) === 0
        const len = isMajor ? tw : tw*0.45
        ctx.beginPath()
        ctx.moveTo(CX+Math.cos(a)*(r-len*0.5), CY+Math.sin(a)*(r-len*0.5))
        ctx.lineTo(CX+Math.cos(a)*(r+len*0.5), CY+Math.sin(a)*(r+len*0.5))
        ctx.strokeStyle = `rgba(16,185,129,${alpha*(isMajor?1:0.4)})`
        ctx.lineWidth = isMajor ? 1.5 : 0.5
        ctx.stroke()
      }
    }

    function drawCore(e, f) {
      const pulse = e==='speaking' ? Math.sin(f*0.18)*8
        : e==='thinking' ? Math.sin(f*0.09)*4
        : Math.sin(f*0.03)*2
      const sides = 6, rad = W*0.061 + pulse*0.4
      ctx.beginPath()
      for (let i = 0; i < sides; i++) {
        const a = i*(Math.PI*2/sides) - Math.PI/6 + f*0.008
        i===0 ? ctx.moveTo(CX+rad*Math.cos(a),CY+rad*Math.sin(a))
               : ctx.lineTo(CX+rad*Math.cos(a),CY+rad*Math.sin(a))
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(16,185,129,0.9)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      const ds = W*0.033 + pulse*0.3
      ctx.save()
      ctx.translate(CX, CY)
      ctx.rotate(f*0.022)
      ctx.beginPath()
      ctx.moveTo(0,-ds); ctx.lineTo(ds*0.6,0)
      ctx.lineTo(0,ds);  ctx.lineTo(-ds*0.6,0)
      ctx.closePath()
      ctx.strokeStyle = 'rgba(16,185,129,1)'
      ctx.lineWidth = 1.2
      ctx.stroke()
      if (e==='speaking') {
        ctx.fillStyle = 'rgba(16,185,129,0.2)'
        ctx.fill()
      }
      ctx.restore()

      ctx.beginPath()
      ctx.arc(CX, CY, 3.5 + pulse*0.15, 0, Math.PI*2)
      ctx.fillStyle = 'rgba(16,185,129,1)'
      ctx.fill()

      const br = W*0.089 + pulse*0.3, bl = W*0.028
      const corners = [[-1,-1],[1,-1],[1,1],[-1,1]]
      corners.forEach(([sx,sy]) => {
        const bx=CX+sx*br, by=CY+sy*br
        ctx.strokeStyle = 'rgba(16,185,129,0.8)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(bx+sx*-bl, by)
        ctx.lineTo(bx, by)
        ctx.lineTo(bx, by+sy*-bl)
        ctx.stroke()
      })
    }

    function drawScan(e, f) {
      if (e !== 'thinking') return
      const a = f*0.04, len = rings[0].r
      const gx = ctx.createLinearGradient(CX,CY,CX+Math.cos(a)*len,CY+Math.sin(a)*len)
      gx.addColorStop(0, 'rgba(16,185,129,0.0)')
      gx.addColorStop(0.7,'rgba(16,185,129,0.0)')
      gx.addColorStop(1, 'rgba(16,185,129,0.25)')
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(CX,CY)
      ctx.arc(CX,CY,len,a-0.35,a)
      ctx.closePath()
      ctx.fillStyle = gx
      ctx.fill()
      ctx.restore()
    }

    function drawOrbs(e, f) {
      orbs.forEach(o => {
        const spd = e==='thinking' ? o.spd*2.5 : e==='speaking' ? o.spd*1.4 : o.spd
        o.angle += spd
        const x=CX+Math.cos(o.angle)*o.r, y=CY+Math.sin(o.angle)*o.r
        ctx.save()
        ctx.translate(x,y)
        ctx.rotate(o.angle + f*0.05)
        ctx.beginPath()
        ctx.moveTo(0,-o.sz); ctx.lineTo(o.sz*0.6,0)
        ctx.lineTo(0,o.sz);  ctx.lineTo(-o.sz*0.6,0)
        ctx.closePath()
        ctx.strokeStyle = `rgba(16,185,129,${e==='speaking'?0.9:0.55})`
        ctx.lineWidth = 1
        ctx.stroke()
        if (e==='speaking') { ctx.fillStyle='rgba(16,185,129,0.3)'; ctx.fill() }
        ctx.restore()
      })
    }

    function drawStreams(e, f) {
      streams.forEach(s => {
        const rate = e==='speaking' ? 0.55 : e==='thinking' ? 0.3 : 0.08
        if (!s.active && Math.random() < rate*0.04) s.active = true
        if (s.active) {
          s.len += e==='speaking' ? 3.5 : 2
          if (s.len >= s.maxLen) { s.len=0; s.active=false }
        }
        if (s.len > 0) {
          const ca=Math.cos(s.angle), sa=Math.sin(s.angle)
          const fade = 1-(s.len/s.maxLen)
          ctx.beginPath()
          ctx.moveTo(CX+ca*s.r, CY+sa*s.r)
          ctx.lineTo(CX+ca*(s.r+s.len), CY+sa*(s.r+s.len))
          ctx.strokeStyle = `rgba(16,185,129,${fade*0.9})`
          ctx.lineWidth = e==='speaking' ? 1.8 : 1.2
          ctx.stroke()
        }
      })
    }

    function drawWave(e, f) {
      if (e !== 'speaking') return
      const r0=rings[3].r+4, r1=rings[2].r-4
      for (let i=0;i<waveN;i++) {
        wave[i]=wave[i]*0.85+Math.sin(f*0.18+i*0.4+Math.sin(i*0.3)*2)*(r1-r0)*0.38*(0.5+Math.random()*0.5)*0.25
      }
      ctx.beginPath()
      for (let i=0;i<waveN;i++) {
        const a=(i/waveN)*Math.PI*2
        const r=r0+(r1-r0)*0.5+wave[i]
        const x=CX+Math.cos(a)*r, y=CY+Math.sin(a)*r
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
      }
      ctx.closePath()
      ctx.strokeStyle='rgba(16,185,129,0.6)'
      ctx.lineWidth=1.5
      ctx.stroke()
    }

    function animate() {
      if (!mounted) return
      ctx.clearRect(0,0,W,H)
      frame++
      const f=frame, e=etatRef.current

      rings.forEach((ring,i) => {
        const spd = e==='thinking' ? ring.spd*2.8 : e==='speaking' ? ring.spd*1.6 : ring.spd
        rots[i] += spd
      })

      const spkPulse = e==='speaking' ? 0.15+Math.abs(Math.sin(f*0.18))*0.3 : 0
      const alpha = e==='speaking' ? [0.75,0.6,0.85,0.7,0.9]
        : e==='thinking' ? [0.55,0.45,0.65,0.5,0.7]
        : [0.4,0.3,0.5,0.35,0.55]

      drawScan(e,f)
      rings.forEach((ring,i) => drawRing(ring, rots[i], alpha[i]+spkPulse, e==='speaking'?1.8:1.2))
      drawWave(e,f)
      drawStreams(e,f)
      drawOrbs(e,f)
      drawCore(e,f)

      rafId = requestAnimationFrame(animate)
    }

    animate()
    return () => { mounted=false; if(rafId) cancelAnimationFrame(rafId) }
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display:'block' }}
    />
  )
}
