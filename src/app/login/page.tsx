'use client'

import { useState, useEffect } from 'react'
import { loginWithOtp, verifyOtp } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  async function handleSendOtp(email: string) {
    setLoading(true)
    setError('')
    setMessage('')
    
    const { error: otpError, success } = await loginWithOtp(email)
    if (otpError) {
      setError(otpError)
    } else if (success) {
      setMessage('Check your email for the OTP code.')
      setSubmittedEmail(email)
      setOtpSent(true)
      setResendCooldown(60)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    const formData = new FormData(e.currentTarget)
    if (!otpSent) {
      const email = formData.get('email') as string
      await handleSendOtp(email)
    } else {
      const token = formData.get('otp') as string
      const { error: verifyError } = await verifyOtp(submittedEmail, token)
      if (verifyError) {
        setError(verifyError)
      }
      setLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 bg-card/60 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl z-10">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground/90 mb-2">
            Welcome back
          </h2>
          <p className="text-center text-sm text-foreground/60">
            Log in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            {!otpSent ? (
              <div className="relative">
                <label htmlFor="email" className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full appearance-none rounded-xl border border-white/10 px-4 py-3 text-foreground placeholder-foreground/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-black/40 transition-all duration-200"
                  placeholder="name@example.com"
                />
              </div>
            ) : (
              <div className="text-center text-sm text-foreground/80 mb-6 bg-black/30 py-3 rounded-xl border border-white/5">
                Code sent to <span className="font-semibold text-accent">{submittedEmail}</span>
              </div>
            )}

            {otpSent && (
              <div className="relative">
                <label htmlFor="otp" className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider text-center">
                  OTP Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  pattern="\d{6,8}"
                  maxLength={8}
                  className="block w-full appearance-none rounded-xl border border-white/10 px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-lg bg-black/40 transition-all duration-200 text-center tracking-[0.5em] font-mono shadow-inner"
                  placeholder="--------"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-center text-red-400 bg-red-400/10 py-2 px-3 rounded-lg border border-red-400/20 font-medium">
              {error}
            </div>
          )}
          {message && !error && (
            <div className="text-sm text-center text-emerald-400 bg-emerald-400/10 py-2 px-3 rounded-lg border border-emerald-400/20 font-medium">
              {message}
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-accent py-3 px-4 text-sm font-bold text-white hover:bg-accent-hover transition-all duration-200 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-lg shadow-accent/20 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Processing...' : otpSent ? 'Verify Code' : 'Send OTP Code'}
            </button>

            {otpSent && (
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleSendOtp(submittedEmail)}
                className="w-full text-sm font-medium text-foreground/60 hover:text-foreground transition-colors py-2 disabled:opacity-50 disabled:hover:text-foreground/60"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Didn\'t receive code? Resend'}
              </button>
            )}
          </div>
        </form>

        <div className="text-center text-sm space-y-5 flex flex-col pt-4 border-t border-white/10">
          {otpSent && (
            <button
              type="button"
              onClick={() => { setOtpSent(false); setMessage(''); setError(''); }}
              className="font-medium text-foreground/60 hover:text-foreground transition-colors"
            >
              Back to email entry
            </button>
          )}

          <div className="text-foreground/60">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-accent hover:text-accent-hover transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
