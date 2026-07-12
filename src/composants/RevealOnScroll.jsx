import { useEffect, useRef, useState } from 'react'

export default function RevealOnScroll({
  children,
  direction = 'up',
  distance = 45,
  duration = 600,
  delay = 0,
  as = 'div',
  style,
  ...props
}) {
  const ref = useRef(null)
  const timeoutRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [delay])

  const getInitialTransform = () => {
    if (isVisible) return 'translate(0,0)'

    switch (direction) {
      case 'up': return `translateY(${distance}px)`
      case 'down': return `translateY(-${distance}px)`
      case 'left': return `translateX(${distance}px)`
      case 'right': return `translateX(-${distance}px)`
      default: return 'translate(0,0)'
    }
  }

  const Component = as

  return (
    <Component
      ref={ref}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: getInitialTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        willChange: 'opacity, transform',
      }}
      {...props}
    >
      {children}
    </Component>
  )
}
