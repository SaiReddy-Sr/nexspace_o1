'use client'

import { useState } from 'react'
import { loginWithPassword, loginWithOtp, verifyOtp } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [method, setMethod] = useState<'password' | 'otp'>('password')
  const [otpSent, setOtpSent] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    setMessage('')
    
    if (method === 'password') {
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const { error: loginError } = await loginWithPassword(email, password)
      if (loginError) {
        setError(loginError)
      }
      setLoading(false)
    } else {
      if (!otpSent) {
        const email = formData.get('email') as string
        const { error: otpError, success } = await loginWithOtp(email)
        if (otpError) {
          setError(otpError)
        } else if (success) {
          setMessage('Check your email for the OTP code.')
          setSubmittedEmail(email)
          setOtpSent(true)
        }
        setLoading(false)
      } else {
        const token = formData.get('otp') as string
        const { error: verifyError } = await verifyOtp(submittedEmail, token)
        if (verifyError) {
          setError(verifyError)
        }
        setLoading(false)
      }
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
            {!otpSent ? (
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
            ) : (
              <div className="text-center text-sm text-foreground/80 mb-4">
                Code sent to <span className="font-semibold">{submittedEmail}</span>
              </div>
            )}
            
            {method === 'password' && !otpSent && (
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

            {method === 'otp' && otpSent && (
              <div className="pt-2">
                <label htmlFor="otp" className="sr-only">
                  6-digit OTP Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  pattern="\d{6}"
                  maxLength={6}
                  className="relative block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:z-10 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors text-center tracking-widest text-lg font-mono"
                  placeholder="------"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-center text-red-500 font-medium">
              {error}
            </div>
          )}
          {message && !error && (
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
              {loading ? 'Processing...' : method === 'password' ? 'Log in' : otpSent ? 'Verify Code' : 'Send OTP Code'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm space-y-4 flex flex-col pt-2">
          {!otpSent && (
            <button
              type="button"
              onClick={() => setMethod(method === 'password' ? 'otp' : 'password')}
              className="font-medium text-foreground/50 hover:text-foreground transition-colors"
            >
              {method === 'password' ? 'Log in with OTP code instead' : 'Log in with password instead'}
            </button>
          )}

          {otpSent && (
            <button
              type="button"
              onClick={() => { setOtpSent(false); setMessage(''); setError(''); }}
              className="font-medium text-foreground/50 hover:text-foreground transition-colors"
            >
              Back to email entry
            </button>
          )}

          <Link href="/signup" className="font-medium text-accent hover:text-accent-hover transition-colors">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
