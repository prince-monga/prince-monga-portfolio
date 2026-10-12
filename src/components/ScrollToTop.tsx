import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'

type ScrollPosition = { x: number; y: number }
type RoutePosition = { pathname: string; search: string; hash: string }

const positions = new Map<string, ScrollPosition>()

function scrollToHash(hash: string): boolean {
  if (!hash) return false

  let id = hash.slice(1)
  try {
    id = decodeURIComponent(id)
  } catch {
    // Keep the literal fragment if it is not valid percent-encoding.
  }
  const target = document.getElementById(id)
  if (!target) return false

  target.scrollIntoView()
  return true
}

function scrollInstantly(position: ScrollPosition) {
  window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' })
}

export function ScrollToTop() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const currentKey = useRef(location.key)
  const previousRoute = useRef<RoutePosition | null>(null)
  const scrollFrame = useRef(0)

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    const rememberPosition = () => {
      positions.set(currentKey.current, { x: window.scrollX, y: window.scrollY })
      if (positions.size > 100) {
        const oldestKey = positions.keys().next().value
        if (oldestKey) positions.delete(oldestKey)
      }
    }

    window.addEventListener('scroll', rememberPosition, { passive: true })
    rememberPosition()

    return () => {
      window.removeEventListener('scroll', rememberPosition)
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  useLayoutEffect(() => {
    if (scrollFrame.current) window.cancelAnimationFrame(scrollFrame.current)
    const route = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    }
    const previous = previousRoute.current
    currentKey.current = location.key

    if (navigationType === 'POP') {
      const savedPosition = positions.get(location.key)
      if (savedPosition) {
        scrollFrame.current = window.requestAnimationFrame(() => {
          scrollInstantly(savedPosition)
          scrollFrame.current = 0
        })
      } else {
        scrollFrame.current = window.requestAnimationFrame(() => {
          if (!scrollToHash(location.hash)) scrollInstantly({ x: 0, y: 0 })
          scrollFrame.current = 0
        })
      }
    } else if (
      !previous ||
      previous.pathname !== route.pathname ||
      previous.search !== route.search ||
      previous.hash !== route.hash
    ) {
      scrollFrame.current = window.requestAnimationFrame(() => {
        if (!scrollToHash(location.hash)) scrollInstantly({ x: 0, y: 0 })
        scrollFrame.current = 0
      })
    }

    previousRoute.current = route

    return () => {
      if (scrollFrame.current) {
        window.cancelAnimationFrame(scrollFrame.current)
        scrollFrame.current = 0
      }
    }
  }, [location.hash, location.key, location.pathname, location.search, navigationType])

  return null
}

export function BackToTop() {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const updateVisibility = () => {
      if (!buttonRef.current) return
      const shouldHide = window.scrollY <= 480
      if (buttonRef.current.hidden !== shouldHide) {
        buttonRef.current.hidden = shouldHide
      }
    }

    window.addEventListener('scroll', updateVisibility, { passive: true })
    updateVisibility()

    return () => {
      window.removeEventListener('scroll', updateVisibility)
    }
  }, [])

  return (
    <button
      ref={buttonRef}
      type="button"
      className="back-to-top"
      aria-label="Back to top"
      hidden
      onClick={() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' })
      }}
    >
      <ArrowUp size={16} aria-hidden="true" />
      <span>Top</span>
    </button>
  )
}
