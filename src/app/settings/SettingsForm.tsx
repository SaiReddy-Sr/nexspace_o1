'use client'

import { useState } from 'react'
import { updateProfile } from './actions'

export function SettingsForm({ initialProfile }: { initialProfile: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    setMessage('')
    
    const { error: updateError, success } = await updateProfile(formData)
    
    if (updateError) {
      setError(updateError)
    } else if (success) {
      setMessage('Profile updated successfully.')
    }
    
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          required
          defaultValue={initialProfile?.username || ''}
          className="block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-foreground mb-1">
          Avatar URL (optional)
        </label>
        <input
          type="url"
          name="avatar_url"
          id="avatar_url"
          defaultValue={initialProfile?.avatar_url || ''}
          placeholder="https://example.com/avatar.jpg"
          className="block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
          Role
        </label>
        <select
          name="role"
          id="role"
          defaultValue={initialProfile?.role || 'developer'}
          required
          className="block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
        >
          <option value="developer">Developer</option>
          <option value="client">Client</option>
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-500 font-medium bg-red-500/10 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {message && (
        <div className="text-sm text-accent font-medium bg-accent/10 p-3 rounded-lg">
          {message}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full sm:w-auto justify-center rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
