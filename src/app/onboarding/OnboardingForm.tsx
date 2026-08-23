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
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username *
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            pattern="[a-zA-Z0-9_-]+"
            title="Only letters, numbers, underscores, and dashes are allowed."
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
            placeholder="johndoe"
          />
        </div>
        
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
            placeholder="John Doe"
          />
        </div>

        {role === 'developer' && (
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
              placeholder="Full-stack developer building..."
            />
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </div>
    </form>
  )
}
