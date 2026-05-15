import { useRef, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import utiliserStore from '@/store/utiliserStore'
import SectionHero        from './SectionHero'
import SectionAPropos     from './SectionAPropos'
import SectionCompetences from './SectionCompetences'
import SectionProjets     from './SectionProjets'
import SectionServices    from './SectionServices'
import SectionMethodologie from './SectionMethodologie'
import SectionFaq         from './SectionFaq'
import SectionContact     from './SectionContact'

// Décalages verticaux de chaque section (en pixels, à ajuster selon le contenu)
const DECALAGES_SECTIONS = {
  hero:         0,
  apropos:     -800,
  competences: -1600,
  projets:     -2400,
  services:    -3200,
  methodologie:-4000,
  faq:         -4800,
  contact:     -5600,
}

export default function CanvasPortfolio() {
  const { portfolio } = utiliserStore()
  const controles     = useAnimation()

  // Zoom + translation vers la section active à chaque changement
  useEffect(() => {
    const decalage = DECALAGES_SECTIONS[portfolio.sectionActive] ?? 0

    controles.start({
      y:      decalage,
      scale:  1.02,                         // léger zoom cinématique
      transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }
    })
  }, [portfolio.sectionActive]) // eslint-disable-line

  return (
    <div className="relative h-full overflow-hidden bg-fond">

      {/* Overlay semi-transparent pour maintenir la lisibilité du chat */}
      <div className="absolute inset-0 bg-fond/20 z-10 pointer-events-none" />

      {/* Surlignage de la section active */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute left-4 right-4 h-0.5 bg-primaire/30 top-1/2 transform -translate-y-1/2" />
      </div>

      {/* Conteneur du portfolio animé */}
      <motion.div
        animate={controles}
        className="absolute top-0 left-0 w-full origin-top"
        style={{ willChange: 'transform' }}
      >
        <SectionHero />
        <SectionAPropos />
        <SectionCompetences />
        <SectionProjets />
        <SectionServices />
        <SectionMethodologie />
        <SectionFaq />
        <SectionContact />
      </motion.div>
    </div>
  )
}