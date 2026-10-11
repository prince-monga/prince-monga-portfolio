import { useState, useEffect, useCallback } from 'react'
import { ApiError } from '../api'
import { useAuth } from './useAuth'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const { logout } = useAuth()
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null })

  const run = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetcher()
      setState({ data, loading: false, error: null })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { run() }, [run])

  return { ...state, refetch: run }
}
