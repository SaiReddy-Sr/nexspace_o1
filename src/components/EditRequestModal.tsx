'use client'

import { useState, useEffect } from 'react'

interface Problem {
  id: string
  title: string
  description: string | null
  tags: string[]
  status: string
}

interface EditRequestModalProps {
  problem: Problem
  onClose: () => void
  onSave: (data: { title: string, description: string, tags: string, status: string }) => Promise<void>
}

export default function EditRequestModal({ problem, onClose, onSave }: EditRequestModalProps) {
  const [title, setTitle] = useState(problem.title || '')
  const [description, setDescription] = useState(problem.description || '')
  const [tags, setTags] = useState(problem.tags ? problem.tags.join(', ') : '')
  const [status, setStatus] = useState(problem.status || 'open')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      await onSave({ title, description, tags, status })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update request')
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#181825] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#1E1E2E] shrink-0">
          <h2 className="text-xl font-bold text-white">Edit Request</h2>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          <div className="px-6 py-6">
            <form id="edit-request-form" onSubmit={handleSave} className="space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#1E1E2E] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#1E1E2E] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-white/70">Description</label>
                    <span className="text-xs text-white/40 font-mono">
                      Markdown & Loom/YouTube links supported
                    </span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#1E1E2E] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors min-h-[100px] resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-[#1E1E2E] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-[#1E1E2E] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-request-form"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
