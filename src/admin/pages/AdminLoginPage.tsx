import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Field, Alert } from '../components/ui'

export default function AdminLoginPage() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const requestedPath = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ''
  const from = /^\/admin(?:\/[a-z0-9-]+)*$/i.test(requestedPath) ? requestedPath : '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid email or password.')
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin sign in | Prince Monga</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <span className="font-mono text-lg font-semibold text-neutral-100">
              pm<span className="text-blue-400">.</span>admin
            </span>
            <p className="mt-2 text-sm text-neutral-500">Sign in to your workspace</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4"
            noValidate
          >
            {error && <Alert type="error" message={error} />}

            <Field label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="admin@example.com"
              />
            </Field>

            <Field label="Password" required>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
              />
            </Field>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full justify-center"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-600">
            This page is not publicly linked. Admin access only.
          </p>
        </div>
      </div>
    </>
  )
}
