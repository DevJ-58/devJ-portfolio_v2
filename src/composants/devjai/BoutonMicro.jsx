import { motion } from 'framer-motion'

// Bouton microphone avec animation de pulsation quand actif
export default function BoutonMicro({ estEnEcoute, surClic }) {
  return (
    <motion.button
      onClick={surClic}
      whileTap={{ scale: 0.9 }}
      className={`relative p-3 rounded-moyen transition-all duration-200
                  ${estEnEcoute
                    ? 'bg-red-500 text-white'
                    : 'bg-fond-carte border border-bordure text-gray-400 hover:border-primaire'}`}
    >
      {/* Anneau de pulsation quand actif */}
      {estEnEcoute && (
        <motion.div
          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 rounded-moyen bg-red-500"
        />
      )}
      <span className="relative z-10 text-lg">{estEnEcoute ? '⏹' : '🎙'}</span>
    </motion.button>
  )
}