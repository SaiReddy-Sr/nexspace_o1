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
          <label htmlFor="title" className="block text-sm font-medium text-foreground">
            Project Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={project.title}
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
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
            defaultValue={project.live_url}
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
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
            defaultValue={project.description || ''}
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors resize-y"
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
            defaultValue={project.tech_tags ? project.tech_tags.join(', ') : ''}
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors font-mono"
          />
        </div>

        <div className="pt-6 border-t border-border">
          <p className="mb-4 text-sm text-foreground/70">
            {project.media_url ? 'Upload new media to replace existing.' : 'Upload media for your project.'}
          </p>
          <ProjectMediaUploader onUploadComplete={handleUploadComplete} />
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
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
