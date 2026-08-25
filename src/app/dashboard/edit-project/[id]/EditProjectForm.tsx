'use client'

import { useState } from 'react'
import ProjectMediaUploader from '@/components/ProjectMediaUploader'
import { updateProject } from './actions'

export default function EditProjectForm({ project }: { project: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Media state initialized with existing media
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(project.media_url || undefined)
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(project.media_type || undefined)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)

  function handleUploadComplete(url: string, type: 'image' | 'video') {
    setMediaUrl(url)
    setMediaType(type)
    setIsUploadingMedia(false)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')

    const { error: submitError } = await updateProject(project.id, formData, mediaUrl, mediaType)
    
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
            defaultValue={project.title}
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
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
            defaultValue={project.live_url}
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
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
            defaultValue={project.description || ''}
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
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
            defaultValue={project.tech_tags ? project.tech_tags.join(', ') : ''}
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-transparent"
          />
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {project.media_url ? 'Upload new media to replace existing.' : 'Upload media for your project.'}
          </p>
          <ProjectMediaUploader onUploadComplete={handleUploadComplete} />
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
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
