import { useState } from 'react'
import Portfolio from '@/composants/Portfolio'
import PreloaderEditorial from '@/composants/PreloaderEditorial'

export default function PortfolioPage() {
  const [preloaderTermine, setPreloaderTermine] = useState(false)

  return (
    <>
      {!preloaderTermine && <PreloaderEditorial onTermine={() => setPreloaderTermine(true)} />}
      <Portfolio accesDirecte={true} />
    </>
  )
}
