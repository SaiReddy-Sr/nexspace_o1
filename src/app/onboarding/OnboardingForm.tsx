'use client'

import { useState } from 'react'
import { createProfile } from './actions'

export default function OnboardingForm({ role, nextParam }: { role: string; nextParam?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    
    const { error: profileError } = await createProfile(formData)
    if (profileError) {
      setError(profileError)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={async (e) => {
      e.preventDefault()
      await handleSubmit(new FormData(e.currentTarget))
    }} className="mt-8 space-y-6">
      <input type="hidden" name="role" value={role} />
      {nextParam && <input type="hidden" name="next" value={nextParam} />}
      
      <div className="space-y-4 rounded-md shadow-sm">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-foreground">
            Username *
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            pattern="[a-zA-Z0-9_-]+"
            title="Only letters, numbers, underscores, and dashes are allowed."
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
            placeholder="johndoe"
          />
        </div>
        
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-foreground">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
            placeholder="John Doe"
          />
        </div>

        {role === 'developer' && (
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-foreground">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors resize-y"
              placeholder="Full-stack developer building..."
            />
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-center text-red-500 font-medium">
          {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full justify-center rounded-md bg-accent py-2.5 px-4 text-sm font-bold text-white hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </div>
    </form>
  )
}
