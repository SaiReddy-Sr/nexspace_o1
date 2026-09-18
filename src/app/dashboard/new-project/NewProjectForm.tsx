'use client'

import { useState } from 'react'
import ProjectMediaUploader from '@/components/ProjectMediaUploader'
import { createProject } from './actions'
import TagInput from '@/components/TagInput'
import LinkPreview from '@/components/LinkPreview'
import dynamic from 'next/dynamic'

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), { ssr: false })

export default function NewProjectForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Media state
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined)
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)

  // Form state
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [liveUrl, setLiveUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [isFetchingReadme, setIsFetchingReadme] = useState(false)
  const [showLinkPreview, setShowLinkPreview] = useState(true)

  function handleUploadComplete(url: string, type: 'image' | 'video') {
    setMediaUrl(url)
    setMediaType(type)
    setIsUploadingMedia(false)
  }

  async function handleImportReadme() {
    if (!githubUrl) return
    try {
      setIsFetchingReadme(true)
      let url = githubUrl.replace('https://github.com/', '')
      if (url.endsWith('/')) url = url.slice(0, -1)
      const res = await fetch(`https://api.github.com/repos/${url}/readme`)
      if (res.ok) {
        const data = await res.json()
        const content = decodeURIComponent(escape(atob(data.content)))
        setDescription(content)
      } else {
        alert('Could not fetch README. Make sure the repo is public.')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsFetchingReadme(false)
    }
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
    }} className="space-y-10">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left Column: Specs */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground border-b border-border pb-3 mb-6">
              Project Specs
            </h3>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-bold text-foreground/90">
              Project Title <span className="text-accent">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="mt-2 block w-full rounded-xl border border-border px-4 py-3 bg-background focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
              placeholder="Awesome Web App"
            />
          </div>
          
          <div>
            <label htmlFor="live_url" className="block text-sm font-bold text-foreground/90">
              Live URL <span className="text-foreground/50 font-normal ml-1">(Optional)</span>
            </label>
            <input
              id="live_url"
              name="live_url"
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border px-4 py-3 bg-background focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
              placeholder="https://awesome-app.com"
            />
          </div>

          <div>
            <label htmlFor="github_repo_url" className="block text-sm font-bold text-foreground/90">
              GitHub Repo URL <span className="text-foreground/50 font-normal ml-1">(Optional)</span>
            </label>
            <div className="flex gap-2 mt-2">
              <input
                id="github_repo_url"
                name="github_repo_url"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="block w-full rounded-xl border border-border px-4 py-3 bg-background focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm flex-1"
                placeholder="https://github.com/username/repo"
              />
              <button 
                type="button" 
                onClick={handleImportReadme} 
                disabled={isFetchingReadme || !githubUrl} 
                className="px-4 py-3 bg-accent/10 text-accent border border-accent/20 font-bold rounded-xl whitespace-nowrap hover:bg-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingReadme ? 'Importing...' : 'Import README'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Media & Details */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground border-b border-border pb-3 mb-6">
              Media & Details
            </h3>
          </div>
          
          <div className="bg-background/50 rounded-2xl p-2 border border-border/50">
            <ProjectMediaUploader onUploadComplete={handleUploadComplete} />
          </div>
          
          {/* Feed Media Preview */}
          <div className="bg-background/50 rounded-2xl p-5 border border-border/50 space-y-4">
            <div>
              <h4 className="text-base font-bold text-foreground">Feed Media Preview</h4>
              <p className="text-sm text-foreground/60">This shows exactly how your project's media will appear on the home feed.</p>
            </div>
            
            {mediaUrl ? (
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-accent">Custom Media ({mediaType})</span>
                  <button 
                    type="button" 
                    onClick={() => { setMediaUrl(undefined); setMediaType(undefined); }}
                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md"
                  >
                    Remove Media
                  </button>
                </div>
                <div className="rounded-lg overflow-hidden border border-border/50 bg-black/40 flex items-center justify-center aspect-[16/9] w-full">
                  {mediaType === 'video' ? (
                    <video src={mediaUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={mediaUrl} alt="Project media" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            ) : liveUrl ? (
              <div className="space-y-4">
                <div 
                  className="flex items-center bg-card p-4 rounded-xl border border-border cursor-pointer hover:border-accent/50 transition-colors" 
                  onClick={() => setShowLinkPreview(!showLinkPreview)}
                >
                  <input
                    id="show_link_preview"
                    name="show_link_preview"
                    type="checkbox"
                    checked={showLinkPreview}
                    onChange={(e) => setShowLinkPreview(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
                  />
                  <label htmlFor="show_link_preview" className="ml-3 text-sm font-bold text-foreground/90 cursor-pointer flex-1">
                    Generate Link Preview from Live URL
                  </label>
                </div>
                
                {showLinkPreview ? (
                  <div className="relative rounded-xl overflow-hidden bg-black/40 aspect-[16/9] w-full border border-white/5 pointer-events-none">
                    <LinkPreview url={liveUrl} displayMode="thumbnail" />
                  </div>
                ) : (
                  <div className="relative rounded-xl border border-border/50 border-dashed bg-background/50 aspect-[16/9] w-full flex flex-col items-center justify-center p-6 text-center">
                    <svg className="w-8 h-8 text-foreground/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span className="text-sm font-medium text-foreground/50">Compact Text-Only Card</span>
                    <span className="text-xs text-foreground/40 mt-1 max-w-[80%]">Your project will appear without a large media box in the feed.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative rounded-xl border border-border/50 border-dashed bg-background/50 aspect-[16/9] w-full flex flex-col items-center justify-center p-6 text-center">
                 <span className="text-sm font-medium text-foreground/50">No Media</span>
                 <span className="text-xs text-foreground/40 mt-1 max-w-[80%]">Upload media or add a Live URL to generate a preview.</span>
              </div>
            )}
            
            {/* Hidden input to ensure state is submitted even if checkbox isn't visible */}
            {(!liveUrl || mediaUrl) && showLinkPreview && (
              <input type="hidden" name="show_link_preview" value="on" />
            )}
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label htmlFor="description" className="block text-sm font-bold text-foreground/90">
                Description
              </label>
            </div>
            <MarkdownEditor 
              value={description} 
              onChange={setDescription} 
              placeholder="What does it do? How was it built?" 
            />
            <input type="hidden" name="description" value={description} />
          </div>

          <div>
            <label htmlFor="tech_tags" className="block text-sm font-bold text-foreground/90 mb-2">
              Tech Stack
            </label>
            <TagInput 
              tags={tags} 
              onChange={setTags} 
              placeholder="e.g. Next.js, Tailwind..." 
            />
            <input type="hidden" name="tech_tags" value={tags.join(', ')} />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-center text-red-500 font-bold bg-red-500/10 py-3 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}

      <div className="pt-8 mt-8 border-t border-border flex justify-end">
        <button
          type="submit"
          disabled={loading || isUploadingMedia}
          className="group relative flex items-center justify-center rounded-xl bg-accent py-3.5 px-10 text-sm font-bold text-white hover:bg-accent-hover transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-lg disabled:opacity-50 min-w-[200px]"
        >
          {loading ? 'Posting Project...' : 'Post Project'}
        </button>
      </div>
    </form>
  )
}
