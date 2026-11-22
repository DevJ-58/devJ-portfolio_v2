import { lazy, Suspense, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth'
import { auth } from '@/services/firebase'
import accesAdmin from '@/store/accesAdmin'
import utiliserTheme from '@/store/utiliserTheme'
import { variablesTheme } from '@/composants/portfolio/moteur/contexte'
import '@/composants/portfolio/portfolio.css'
import './admin.css'

const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))

// Espace admin : s'ouvre par-dessus le site, sans URL dédiée.
// La connexion Firebase reste obligatoire ; la session ne dure que le temps
// de l'onglet (fermer l'onglet déconnecte).
export default function EspaceAdmin() {
  const fermer = accesAdmin((s) => s.fermer)
  const { getThemeEffectif, theme, mode } = utiliserTheme()
  const eff = getThemeEffectif ? getThemeEffectif() : theme
  const vars = variablesTheme(eff, mode === 'light')
  const [utilisateur, setUtilisateur] = useState(undefined) // undefined = vérification

  useEffect(() => onAuthStateChanged(auth, (u) => setUtilisateur(u || null)), [])

  // Pas de défilement du site derrière l'espace admin
  useEffect(() => {
    const avant = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = avant }
  }, [])

  return (
    <div className={`ad ${mode === 'light' ? 'est-clair' : 'est-sombre'}`} style={vars} role="dialog" aria-modal="true" aria-label="Espace administrateur">
      {utilisateur === undefined && <div className="ad-attente"><i /> Vérification…</div>}
      {utilisateur === null && <Connexion onFermer={fermer} />}
      {utilisateur && (
        <Suspense fallback={<div className="ad-attente"><i /> AXIS se réveille…</div>}>
          <AdminDashboard onFermer={fermer} />
        </Suspense>
      )}
    </div>
  )
}

function Connexion({ onFermer }) {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  useEffect(() => {
    const echap = (e) => { if (e.key === 'Escape') onFermer() }
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [onFermer])

  const connexion = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      await setPersistence(auth, browserSessionPersistence)
      await signInWithEmailAndPassword(auth, email.trim(), motDePasse)
    } catch {
      // Message générique : ne pas révéler si l'email ou le mot de passe est faux
      setErreur('Identifiants incorrects.')
      setChargement(false)
    }
  }

  return (
    <div className="ad-connexion">
      <button type="button" className="ad-fermer" onClick={onFermer} aria-label="Fermer et revenir au site">✕</button>
      <form className="ad-connexion__carte" onSubmit={connexion}>
        <span className="pf-label"><b>00</b> Espace privé</span>
        <h1 className="ad-connexion__titre">Bon retour, <em className="pf-it">Fréjus</em></h1>
        <p className="ad-connexion__texte">Identifie-toi pour accéder au tableau de bord d'AXIS.</p>
        <label className="ad-champ">
          <span>Email</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="ad-champ">
          <span>Mot de passe</span>
          <input type="password" autoComplete="current-password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
        </label>
        {erreur && <p className="ad-erreur" role="alert">{erreur}</p>}
        <button type="submit" className="ad-bouton ad-bouton--plein" disabled={chargement}>
          {chargement ? 'Connexion…' : 'Accéder'}
        </button>
        <p className="ad-connexion__note">Échap pour revenir au site · session limitée à cet onglet</p>
      </form>
    </div>
  )
}
