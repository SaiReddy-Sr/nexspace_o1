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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create an account
          </h2>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setRole('developer')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                role === 'developer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              I'm a Developer
            </button>
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                role === 'client'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              I'm a Client
            </button>
          </div>

          <div className="flex justify-center space-x-4 border-b border-gray-200 dark:border-gray-800 pb-4">
            <button
              type="button"
              onClick={() => setMethod('password')}
              className={`text-sm font-medium ${
                method === 'password'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Sign up with password
            </button>
            <button
              type="button"
              onClick={() => setMethod('magic_link')}
              className={`text-sm font-medium ${
                method === 'magic_link'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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
                  autoComplete="new-password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
                  placeholder="Password"
                />
              </div>
            )}
          </div>

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
              {loading ? 'Processing...' : method === 'password' ? 'Sign up with Password' : 'Send Magic Link'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
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
