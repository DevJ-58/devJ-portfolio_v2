import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/services/firebase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const naviguer = useNavigate()

  const connexion = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      naviguer('/admin/dashboard')
    } catch (err) {
      // Message générique — ne pas révéler si c'est l'email ou le mdp qui est faux
      setErreur('Identifiants incorrects.')
      setChargement(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Space Mono, monospace',
    }}>
      <div style={{
        width: 360,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '40px 32px',
      }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 8 }}>
          // AXIS ADMIN
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 32 }}>
          Connexion
        </div>

        <form onSubmit={connexion}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '12px 14px',
              color: '#fff',
              fontFamily: 'Space Mono, monospace',
              fontSize: 12,
              outline: 'none',
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '12px 14px',
              color: '#fff',
              fontFamily: 'Space Mono, monospace',
              fontSize: 12,
              outline: 'none',
              marginBottom: 20,
              boxSizing: 'border-box',
            }}
          />
          {erreur && (
            <div style={{ fontSize: 10, color: '#ef4444', marginBottom: 16, letterSpacing: '0.1em' }}>
              {erreur}
            </div>
          )}
          <button
            type="submit"
            disabled={chargement}
            style={{
              width: '100%',
              background: '#10b981',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              color: '#050505',
              fontFamily: 'Space Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              cursor: chargement ? 'wait' : 'pointer',
              opacity: chargement ? 0.6 : 1,
            }}
          >
            {chargement ? 'CONNEXION...' : 'ACCÉDER'}
          </button>
        </form>
      </div>
    </div>
  )
}
