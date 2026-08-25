'use client'

import { useState } from 'react'
import { createProblem } from './actions'

export default function ProblemForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')

    const { error: submitError } = await createProblem(formData)
    
    if (submitError) {
      setError(submitError)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={async (e) => {
      e.preventDefault()
      await handleSubmit(new FormData(e.currentTarget))
    }} className="mt-8 space-y-6">
      
      <div className="space-y-6 rounded-md shadow-sm">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground">
            Request Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
            placeholder="e.g. Need a custom e-commerce dashboard"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors resize-y"
            placeholder="Describe what you're looking for in detail..."
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-foreground">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors font-mono"
            placeholder="React, Design, Node.js"
          />
        </div>
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
          {loading ? 'Posting...' : 'Post Request'}
        </button>
      </div>
    </form>
  )
}
