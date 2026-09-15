'use client'

import { useState } from 'react'
import { loginWithPassword, loginWithMagicLink } from './actions'
import Link from 'next/link'

function getMailProviderUrl(email: string) {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return null
  
  if (domain === 'gmail.com') return 'https://mail.google.com/'
  if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') return 'https://outlook.live.com/'
  if (domain === 'yahoo.com') return 'https://mail.yahoo.com/'
  if (domain === 'proton.me' || domain === 'protonmail.com') return 'https://mail.proton.me/'
  if (domain === 'icloud.com' || domain === 'me.com' || domain === 'mac.com') return 'https://www.icloud.com/mail'
  
  return null
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [method, setMethod] = useState<'password' | 'magic_link'>('password')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    setMessage('')
    setSubmittedEmail('')
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
        setSubmittedEmail(email)
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
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
                  autoComplete="current-password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:z-10 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
                  placeholder="Password"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-center text-red-500 font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-center text-accent font-medium">
              {submittedEmail && getMailProviderUrl(submittedEmail) && !message.toLowerCase().includes('failed') ? (
                <a 
                  href={getMailProviderUrl(submittedEmail)!} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline underline-offset-2 flex items-center justify-center gap-1"
                >
                  {message}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                message
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-accent py-2.5 px-4 text-sm font-bold text-white hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : method === 'password' ? 'Log in' : 'Send Magic Link'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm space-y-4 flex flex-col pt-2">
          <button
            type="button"
            onClick={() => setMethod(method === 'password' ? 'magic_link' : 'password')}
            className="font-medium text-foreground/50 hover:text-foreground transition-colors"
          >
            {method === 'password' ? 'Log in with a magic link instead' : 'Log in with password instead'}
          </button>

          <Link href="/signup" className="font-medium text-accent hover:text-accent-hover transition-colors">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
