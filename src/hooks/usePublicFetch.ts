import { useState, useEffect, useRef } from 'react'

interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Fetches public API data once on mount (or when deps change).
 * Pass a stable fetcher reference or use deps to control re-fetching.
 */
export function usePublicFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))
    fetcherRef.current()
      .then(data => { if (!cancelled) setState({ data, loading: false, error: null }) })
      .catch(err => {
        if (!cancelled)
          setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load' })
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
