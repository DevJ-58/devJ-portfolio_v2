import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/services/firebase'

export default function ProtectedRoute({ children }) {
  const [verification, setVerification] = useState(true)
  const naviguer = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        naviguer('/admin')
      } else {
        setVerification(false)
      }
    })
    return () => unsubscribe()
  }, [])

  if (verification) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Space Mono, monospace',
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.3em',
      }}>
        VÉRIFICATION...
      </div>
    )
  }

  return children
}
