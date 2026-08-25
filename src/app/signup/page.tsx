'use client'

import { useState, Suspense } from 'react'
import { signupWithPassword, signupWithMagicLink } from './actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function SignupForm() {
  const [role, setRole] = useState<'developer' | 'client'>('developer')
  const [method, setMethod] = useState<'password' | 'magic_link'>('password')
  
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next') || undefined
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage('')
    const email = formData.get('email') as string
    
    if (method === 'password') {
      const password = formData.get('password') as string
      const { error } = await signupWithPassword(email, password, role, nextParam)
      if (error) {
        setMessage(error)
      } else {
        setMessage('Check your email to confirm your account.')
      }
    } else {
      const { error } = await signupWithMagicLink(email, role, nextParam)
      if (error) {
        setMessage(error)
      } else {
        setMessage('Check your email for the magic link.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Create an account
          </h2>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setRole('developer')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                role === 'developer'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-background text-foreground/70 border border-border hover:text-foreground'
              }`}
            >
              I'm a Developer
            </button>
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                role === 'client'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-background text-foreground/70 border border-border hover:text-foreground'
              }`}
            >
              I'm a Client
            </button>
          </div>

          <div className="flex justify-center space-x-4 border-b border-border pb-4">
            <button
              type="button"
              onClick={() => setMethod('password')}
              className={`text-sm font-medium transition-colors ${
                method === 'password'
                  ? 'text-accent'
                  : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              Sign up with password
            </button>
            <button
              type="button"
              onClick={() => setMethod('magic_link')}
              className={`text-sm font-medium transition-colors ${
                method === 'magic_link'
                  ? 'text-accent'
                  : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              Sign up with magic link
            </button>
          </div>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:z-10 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
                placeholder="Email address"
              />
            </div>
            {method === 'password' && (
              <div className="pt-2">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:z-10 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
                  placeholder="Password"
                />
              </div>
            )}
          </div>

          {message && (
            <div className="text-sm text-center text-accent font-medium">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-accent py-2.5 px-4 text-sm font-bold text-white hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : method === 'password' ? 'Sign up with Password' : 'Send Magic Link'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm pt-2">
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover transition-colors">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
