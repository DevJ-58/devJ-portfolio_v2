import { useEffect, useRef, useState } from 'react'

export default function RevealOnScroll({
  children,
  direction = 'up', // 'up', 'down', 'left', 'right', 'none'
  distance = 30,
  duration = 600,
  delay = 0,
  as = 'div',
  ...props
}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const getInitialTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return `translateY(${distance}px)`
        case 'down':
          return `translateY(-${distance}px)`
        case 'left':
          return `translateX(${distance}px)`
        case 'right':
          return `translateX(-${distance}px)`
        case 'none':
          return 'translateY(0)'
        default:
          return 'translateY(0)'
      }
    }
    return 'translateY(0)'
  }

  const Component = as

  return (
    <Component
      ref={ref}
      style={{
        ...props.style,
        opacity: isVisible ? 1 : 0,
        transform: getInitialTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      }}
      {...props}
    >
      {children}
    </Component>
  )
}
