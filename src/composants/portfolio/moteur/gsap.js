// Point d'entrée unique de GSAP pour le portfolio : plugins enregistrés une
// seule fois, courbes d'animation partagées.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

// Courbes : sortie douce par défaut, transitions dramatiques, ressort léger
export const EASE = {
  sortie: 'expo.out',
  doux: 'power3.out',
  drame: 'expo.inOut',
  rideau: 'power4.inOut',
  ressort: 'back.out(1.6)',
}

// Conditions communes de gsap.matchMedia
export const MEDIA = {
  anim: '(prefers-reduced-motion: no-preference)',
  bureau: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
  pointeurFin: '(pointer: fine) and (prefers-reduced-motion: no-preference)',
}

export const mouvementReduit = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap, ScrollTrigger, SplitText, useGSAP }
