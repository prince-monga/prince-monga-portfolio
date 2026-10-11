import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { login as apiLogin, setToken, clearToken, ApiError } from '../api'

interface AuthState {
  email: string | null
  isLoading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    email: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    // Restore session from sessionStorage on mount
    const token = sessionStorage.getItem('admin_token')
    const email = sessionStorage.getItem('admin_email')
    setState({ email: token && email ? email : null, isLoading: false, error: null })
  }, [])

  async function login(email: string, password: string) {
    setState(s => ({ ...s, isLoading: true, error: null }))
    try {
      const data = await apiLogin(email, password)
      setToken(data.token)
      sessionStorage.setItem('admin_email', data.email)
      setState({ email: data.email, isLoading: false, error: null })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed'
      setState({ email: null, isLoading: false, error: msg })
      throw err
    }
  }

  function logout() {
    clearToken()
    sessionStorage.removeItem('admin_email')
    setState({ email: null, isLoading: false, error: null })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
