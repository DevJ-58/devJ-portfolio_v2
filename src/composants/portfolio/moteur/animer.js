// Animations déclaratives : un attribut data-a sur un élément suffit.
//
//   data-a="chars"     titre court, lettres qui montent hors d'un masque
//   data-a="mots"      phrase, mots qui montent
//   data-a="lignes"    paragraphe, lignes qui montent
//   data-a="fondu"     apparition douce
//   data-a="echelle"   apparition avec léger zoom
//   data-a="image"     image dévoilée par un rideau + dézoom
//   data-a="trait"     ligne qui se trace de gauche à droite
//   data-a="compteur"  nombre compté jusqu'à sa valeur (data-valeur)
//   data-a="cascade"   enfants qui apparaissent l'un après l'autre
//   data-parallaxe="0.2"  décor qui glisse plus lentement (ou plus vite)
//
// Options : data-delai (s), data-debut (« top 85% »…).
// Sans mouvement (prefers-reduced-motion), rien n'est animé : le contenu
// reste dans son état final, lisible.
import { gsap, ScrollTrigger, SplitText, useGSAP, EASE, MEDIA } from './gsap'

function declencheur(el) {
  return {
    trigger: el,
    start: el.dataset.debut || 'top 86%',
    toggleActions: 'play none none reverse',
  }
}

function formaterNombre(v, decimales) {
  // Espace classique comme séparateur des milliers (toutes les polices l'ont)
  return decimales ? v.toFixed(decimales).replace('.', ',') : String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function animerAttributs(racine) {
  if (!racine) return
  racine.querySelectorAll('[data-a]').forEach((el) => {
    const type = el.dataset.a
    const delay = Number(el.dataset.delai) || 0
    const scrollTrigger = declencheur(el)

    switch (type) {
      case 'chars':
        SplitText.create(el, {
          type: 'lines,chars', mask: 'lines', autoSplit: true, aria: 'auto',
          onSplit: (self) => gsap.from(self.chars, {
            yPercent: 118, rotate: 5, duration: 1.2, ease: EASE.sortie,
            stagger: { each: 0.022, from: 'start' }, delay, scrollTrigger,
          }),
        })
        break
      case 'mots':
        SplitText.create(el, {
          type: 'lines,words', mask: 'lines', autoSplit: true, aria: 'auto',
          onSplit: (self) => gsap.from(self.words, {
            yPercent: 110, duration: 1.05, ease: EASE.sortie, stagger: 0.035, delay, scrollTrigger,
          }),
        })
        break
      case 'lignes':
        SplitText.create(el, {
          type: 'lines', mask: 'lines', autoSplit: true, aria: 'auto',
          onSplit: (self) => gsap.from(self.lines, {
            yPercent: 105, duration: 1.1, ease: EASE.sortie, stagger: 0.09, delay, scrollTrigger,
          }),
        })
        break
      case 'fondu':
        gsap.from(el, { y: 44, autoAlpha: 0, duration: 1.15, ease: EASE.doux, delay, scrollTrigger })
        break
      case 'echelle':
        gsap.fromTo(el, { scale: 0.88, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, ease: EASE.sortie, delay, scrollTrigger })
        break
      case 'image': {
        const img = el.querySelector('img')
        const tl = gsap.timeline({ delay, scrollTrigger })
        tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: EASE.rideau })
        if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.9, ease: EASE.sortie }, 0)
        break
      }
      case 'trait':
        gsap.fromTo(el, { scaleX: 0, transformOrigin: el.dataset.origine || 'left center' }, { scaleX: 1, duration: 1.5, ease: EASE.rideau, delay, scrollTrigger })
        break
      case 'compteur': {
        const fin = Number(el.dataset.valeur)
        if (!Number.isFinite(fin)) break
        const decimales = Number(el.dataset.decimales) || 0
        const suffixe = el.dataset.suffixe || ''
        const etat = { v: 0 }
        gsap.to(etat, {
          v: fin, duration: 2, ease: 'power2.out', delay, scrollTrigger,
          onUpdate: () => { el.textContent = formaterNombre(etat.v, decimales) + suffixe },
          onReverseComplete: () => { el.textContent = formaterNombre(0, decimales) + suffixe },
        })
        break
      }
      case 'cascade':
        gsap.from(el.children, { y: 40, autoAlpha: 0, duration: 1, ease: EASE.doux, stagger: 0.08, delay, scrollTrigger })
        break
      default:
        break
    }
  })

  racine.querySelectorAll('[data-parallaxe]').forEach((el) => {
    const v = Number(el.dataset.parallaxe) || 0.15
    gsap.to(el, {
      yPercent: -100 * v, ease: 'none',
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })
}

// Hook d'animation d'une section : attributs data-a + chorégraphie propre.
// fn reçoit { bureau, mobile, racine } et n'est appelée que si le mouvement
// est autorisé. Tout est nettoyé au démontage ou quand deps change.
export function useAnimations(scope, fn, deps = []) {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({ anim: MEDIA.anim, bureau: MEDIA.bureau, mobile: MEDIA.mobile }, (c) => {
      if (!c.conditions.anim) return
      animerAttributs(scope.current)
      return fn?.({ bureau: c.conditions.bureau, mobile: c.conditions.mobile, racine: scope.current })
    })
    return () => mm.revert()
  }, { scope, dependencies: deps, revertOnUpdate: true })
}

// Bande défilante (contenu dupliqué deux fois dans la piste) qui accélère
// et change de sens avec la vitesse du scroll. En pause hors de l'écran.
export function animerBandeau(piste, { vitesse = 40, sens = 1, declencheurEl } = {}) {
  if (!piste) return
  const boucle = sens > 0
    ? gsap.fromTo(piste, { xPercent: 0 }, { xPercent: -50, ease: 'none', duration: vitesse, repeat: -1, paused: true })
    : gsap.fromTo(piste, { xPercent: -50 }, { xPercent: 0, ease: 'none', duration: vitesse, repeat: -1, paused: true })
  ScrollTrigger.create({
    trigger: declencheurEl || piste,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => boucle.paused(!self.isActive),
    onUpdate: (self) => {
      const dir = self.direction || 1
      const v = Math.min(5, Math.abs(self.getVelocity()) / 300)
      gsap.to(boucle, {
        timeScale: dir * (1 + v), duration: 0.2, overwrite: true,
        onComplete: () => gsap.to(boucle, { timeScale: dir, duration: 1.1, overwrite: true }),
      })
    },
  })
  return boucle
}
