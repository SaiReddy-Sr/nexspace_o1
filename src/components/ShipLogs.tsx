'use client'

import { useState } from 'react'
import { PlusCircle, GitCommit, Calendar, Send } from 'lucide-react'
import dynamic from 'next/dynamic'

const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), { ssr: false })
const MarkdownViewer = dynamic(() => import('./MarkdownViewer'))

interface ShipLog {
  id: string
  version: string | null
  title: string
  description: string | null
  created_at: string
}

interface ShipLogsProps {
  projectId: string
  isOwnProject: boolean
  initialLogs: ShipLog[]
}

export function ShipLogs({ projectId, isOwnProject, initialLogs }: ShipLogsProps) {
  const [logs, setLogs] = useState<ShipLog[]>(initialLogs)
  const [isDrafting, setIsDrafting] = useState(false)
  const [title, setTitle] = useState('')
  const [version, setVersion] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, version, description })
      })

      if (res.ok) {
        const newLog = await res.json()
        setLogs([newLog.data, ...logs])
        setIsDrafting(false)
        setTitle('')
        setVersion('')
        setDescription('')
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to post update')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while posting the update.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOwnProject && logs.length === 0) {
    return null
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <GitCommit className="w-6 h-6 text-accent" />
          Ship Logs
        </h2>
        {isOwnProject && !isDrafting && (
          <button 
            onClick={() => setIsDrafting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent font-bold rounded-lg transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Post Update
          </button>
        )}
      </div>

      {isDrafting && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl border border-border shadow-sm mb-12">
          <h3 className="text-lg font-bold mb-4">Draft New Update</h3>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-mono text-foreground/50 uppercase mb-2">Title</label>
              <input 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Added Real-time Notifications!"
                className="w-full bg-[#0f0f0f] border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-mono text-foreground/50 uppercase mb-2">Version (Opt)</label>
              <input 
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.2.0"
                className="w-full bg-[#0f0f0f] border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-mono text-foreground/50 uppercase mb-2">Changelog (Markdown)</label>
            <MarkdownEditor 
              value={description}
              onChange={setDescription}
              placeholder="What did you ship? Add screenshots, videos, or code snippets!"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsDrafting(false)}
              className="px-5 py-2.5 text-sm font-bold text-foreground/50 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Posting...' : 'Publish Update'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {logs.map((log) => (
          <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
              <GitCommit className="w-4 h-4 text-accent" />
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-6 rounded-xl border border-border shadow-sm group-hover:border-accent/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-foreground">{log.title}</h3>
                {log.version && (
                  <span className="px-2.5 py-1 bg-accent/10 text-accent font-mono text-xs font-bold rounded-md">
                    {log.version}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-foreground/50 uppercase tracking-wider mb-4">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              
              {log.description && (
                <div className="text-sm border-t border-border/50 pt-4 mt-2">
                  <MarkdownViewer content={log.description} />
                </div>
              )}
            </div>
          </div>
        ))}
        {logs.length === 0 && !isDrafting && (
          <div className="text-center py-12 relative z-10 bg-background/80">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/5 mb-4">
              <GitCommit className="w-8 h-8 text-accent/50" />
            </div>
            <p className="text-foreground/50 font-mono text-sm uppercase tracking-widest">No updates shipped yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
