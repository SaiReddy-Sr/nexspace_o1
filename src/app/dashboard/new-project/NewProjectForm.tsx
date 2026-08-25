'use client'

import { useState } from 'react'
import ProjectMediaUploader from '@/components/ProjectMediaUploader'
import { createProject } from './actions'

export default function NewProjectForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Media state
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined)
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)

  // We wrap the callback to keep track of upload state
  // We can pass a prop to ProjectMediaUploader for upload start, but since it doesn't have it,
  // we'll just rely on the user visually seeing "Uploading..." in the uploader component.
  // Actually, to prevent submission *during* upload, we can track if they selected a file but it hasn't completed.
  // The prompt allows making media optional for v1. I'll make it optional.

  function handleUploadComplete(url: string, type: 'image' | 'video') {
    setMediaUrl(url)
    setMediaType(type)
    setIsUploadingMedia(false)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')

    const { error: submitError } = await createProject(formData, mediaUrl, mediaType)
    
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
            Project Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
            placeholder="Awesome Web App"
          />
        </div>
        
        <div>
          <label htmlFor="live_url" className="block text-sm font-medium text-foreground">
            Live URL *
          </label>
          <input
            id="live_url"
            name="live_url"
            type="url"
            required
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
            placeholder="https://awesome-app.com"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors resize-y"
            placeholder="What does it do? How was it built?"
          />
        </div>

        <div>
          <label htmlFor="tech_tags" className="block text-sm font-medium text-foreground">
            Tech Tags (comma separated)
          </label>
          <input
            id="tech_tags"
            name="tech_tags"
            type="text"
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors font-mono"
            placeholder="React, Tailwind, Supabase"
          />
        </div>

        <div className="pt-6 border-t border-border">
          <ProjectMediaUploader onUploadComplete={handleUploadComplete} />
          {mediaUrl && (
            <p className="mt-3 text-sm text-accent font-medium">
              Media uploaded successfully! Ready to submit.
            </p>
          )}
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
          disabled={loading || isUploadingMedia}
          className="group relative flex w-full justify-center rounded-md bg-accent py-2.5 px-4 text-sm font-bold text-white hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-sm disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Project'}
        </button>
      </div>
    </form>
  )
}
