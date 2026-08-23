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
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
            placeholder="Awesome Web App"
          />
        </div>
        
        <div>
          <label htmlFor="live_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Live URL *
          </label>
          <input
            id="live_url"
            name="live_url"
            type="url"
            required
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
            placeholder="https://awesome-app.com"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
            placeholder="What does it do? How was it built?"
          />
        </div>

        <div>
          <label htmlFor="tech_tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tech Tags (comma separated)
          </label>
          <input
            id="tech_tags"
            name="tech_tags"
            type="text"
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
            placeholder="React, Tailwind, Supabase"
          />
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <ProjectMediaUploader onUploadComplete={handleUploadComplete} />
          {mediaUrl && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              Media uploaded successfully! Ready to submit.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading || isUploadingMedia}
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Project'}
        </button>
      </div>
    </form>
  )
}
