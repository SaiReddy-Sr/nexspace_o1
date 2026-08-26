'use client'

import { useEffect, useState } from 'react'

// I will define simple SVG icons since lucide-react isn't installed.
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
)

const ExternalLinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
)

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
)

interface Project {
  id: string
  title: string
  live_url: string | null
}

export default function QuickViewDrawer({
  project,
  onClose,
}: {
  project: Project | null
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    if (project) {
      setLoading(true)
      setTimeoutReached(false)
      
      const timer = setTimeout(() => {
        if (loading) {
          setTimeoutReached(true)
        }
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [project, loading])

  if (!project) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal/Drawer Container */}
      <div className="relative w-full h-full max-w-6xl bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-foreground line-clamp-1">{project.title}</h2>
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
              >
                <span>Open in new tab</span>
                <ExternalLinkIcon />
              </a>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-foreground/70 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 bg-black/5">
          {project.live_url ? (
            <>
              {loading && !timeoutReached && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10">
                  <svg className="animate-spin h-8 w-8 text-accent mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-foreground/70 font-medium">Loading live preview...</p>
                </div>
              )}
              
              {timeoutReached && loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10 p-6 text-center animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
                    <AlertIcon />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Preview unavailable for this site</h3>
                  <p className="text-foreground/70 max-w-md mb-6">
                    This site might be blocking iframe embedding, or it's taking too long to load.
                  </p>
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
                  >
                    Open in new tab
                    <ExternalLinkIcon />
                  </a>
                </div>
              )}

              <iframe
                src={project.live_url}
                className={`w-full h-full border-0 ${loading && !timeoutReached ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}
                onLoad={() => setLoading(false)}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title={`Preview of ${project.title}`}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-card">
              <p className="text-foreground/50">No live URL provided for this project.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
