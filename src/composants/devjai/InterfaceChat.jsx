import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AvatarParticulaire from '@/composants/ui/AvatarParticulaire'
import BoutonMicro from './BoutonMicro'
import utiliserStore from '@/store/utiliserStore'

export default function InterfaceChat() {
  const [saisie, definirSaisie]   = useState('')
  const refHistorique             = useRef(null)
  const { visiteur }              = utiliserStore()
  const envoyerMessage            = () => {}
  const estEnTrain                = false
  const estEnChargement           = false
  const estEnEcoute               = false
  const demarrerEcoute            = () => {}
  const arreterEcoute             = () => {}
  const historique                = []

  // Défilement automatique vers le bas à chaque nouveau message
  useEffect(() => {
    if (refHistorique.current) {
      refHistorique.current.scrollTop = refHistorique.current.scrollHeight
    }
  }, [historique])

  function gererEnvoi() {
    if (!saisie.trim() || estEnChargement) return
    envoyerMessage(saisie)
    definirSaisie('')
  }

  return (
    <div className="h-full flex flex-col bg-fond-secondaire border-l border-bordure">

      {/* ── En-tête avec avatar ──────────────────────────── */}
      <div className="flex items-center gap-4 p-6 border-b border-bordure">
        <AvatarParticulaire width={60} height={60} etat="idle" />
        <div>
          {/* Nom d'interface mis à jour pour AXIS */}
          <h3 className="police-mono font-bold text-primaire text-lg">AXIS</h3>
          <p className="text-xs text-gray-500">
            {estEnTrain      ? '● en train de parler...' :
             estEnEcoute     ? '● en écoute...' :
             estEnChargement ? '● réflexion...' :
                               '● en ligne'}
          </p>
        </div>
      </div>

      {/* ── Historique de la conversation ─────────────────── */}
      <div
        ref={refHistorique}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-4"
      >
        <AnimatePresence>
          {historique.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] px-4 py-3 rounded-grand text-sm leading-relaxed
                              ${msg.role === 'user'
                                ? 'bg-primaire text-black font-medium'
                                : 'bg-fond-carte text-gray-200 border border-bordure'}`}
              >
                {msg.contenu}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Indicateur de chargement (3 points animés) */}
        {estEnChargement && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex gap-1 px-4 py-3 bg-fond-carte rounded-grand w-fit border border-bordure"
          >
            {[0, 1, 2].map((i) => (
              <motion.div key={i}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                className="w-1.5 h-1.5 bg-primaire rounded-full"
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Zone de saisie ────────────────────────────────── */}
      <div className="p-4 border-t border-bordure flex gap-3 items-end">
        {visiteur.microActif && (
          <BoutonMicro
            estEnEcoute={estEnEcoute}
            surClic={() => estEnEcoute ? arreterEcoute() : demarrerEcoute()}
          />
        )}
        <input
          type="text"
          value={saisie}
          onChange={(e) => definirSaisie(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && gererEnvoi()}
          placeholder="Posez votre question..."
          className="flex-1 bg-fond-carte border border-bordure text-white
                     px-4 py-3 rounded-moyen text-sm
                     focus:outline-none focus:border-primaire transition-colors"
        />
        <button
          onClick={gererEnvoi}
          disabled={!saisie.trim() || estEnChargement}
          className="bg-primaire hover:bg-primaire-fonce disabled:opacity-40
                     text-black font-bold p-3 rounded-moyen transition-all duration-200"
        >
          →
        </button>
      </div>
    </div>
  )
}