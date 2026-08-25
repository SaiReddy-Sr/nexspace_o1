'use client'

import { useState } from 'react'
import { loginWithPassword, loginWithMagicLink } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [method, setMethod] = useState<'password' | 'magic_link'>('password')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    setMessage('')
    const email = formData.get('email') as string
    
    if (method === 'password') {
      const password = formData.get('password') as string
      const { error: loginError } = await loginWithPassword(email, password)
      if (loginError) {
        setError(loginError)
        setLoading(false)
      }
    } else {
      const { error: magicLinkError, success } = await loginWithMagicLink(email)
      if (magicLinkError) {
        setError(magicLinkError)
      } else if (success) {
        setMessage('Check your email for the magic link.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Log in to your account
          </h2>
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
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
                placeholder="Email address"
              />
            </div>
            {method === 'password' && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
                  placeholder="Password"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-center text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-center text-blue-600 dark:text-blue-400">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : method === 'password' ? 'Log in' : 'Send Magic Link'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm space-y-4 flex flex-col">
          <button
            type="button"
            onClick={() => setMethod(method === 'password' ? 'magic_link' : 'password')}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            {method === 'password' ? 'Log in with a magic link instead' : 'Log in with password instead'}
          </button>

          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
