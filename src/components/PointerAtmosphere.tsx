import { useEffect, useRef } from 'react'

export default function PointerAtmosphere() {
  const lightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const light = lightRef.current
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!light || coarsePointer.matches || reducedMotion.matches) return

    let frame = 0
    let x = 0
    let y = 0

    const moveLight = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      x = event.clientX
      y = event.clientY
      if (frame) return

      frame = window.requestAnimationFrame(() => {
        light.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
        light.classList.add('is-visible')
        frame = 0
      })
    }

    const hideLight = (event: PointerEvent) => {
      if (!event.relatedTarget) light.classList.remove('is-visible')
    }

    window.addEventListener('pointermove', moveLight, { passive: true })
    window.addEventListener('pointerout', hideLight)

    return () => {
      window.removeEventListener('pointermove', moveLight)
      window.removeEventListener('pointerout', hideLight)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="pointer-atmosphere" aria-hidden="true">
      <div ref={lightRef} className="pointer-light" />
    </div>
  )
}
