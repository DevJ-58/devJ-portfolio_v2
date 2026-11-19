import { useState } from 'react'
import Portfolio from '@/composants/Portfolio'
import PreloaderEditorial from '@/composants/PreloaderEditorial'

// Le préchargeur s'ouvre sur le portfolio : l'intro du hero démarre dès le
// début de l'ouverture (pret), le préchargeur est retiré à la fin (termine).
export default function PortfolioPage() {
  const [pret, setPret] = useState(false)
  const [termine, setTermine] = useState(false)

  return (
    <>
      {!termine && <PreloaderEditorial onSortie={() => setPret(true)} onTermine={() => setTermine(true)} />}
      <Portfolio accesDirecte={true} pret={pret} />
    </>
  )
}
