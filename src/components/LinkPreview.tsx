'use client'

import { useState, useEffect } from 'react'

export default function LinkPreview({ url, displayMode = 'card' }: { url: string, displayMode?: 'card' | 'thumbnail' }) {
  const [data, setData] = useState<{ title?: string, description?: string, image?: string, logo?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchOG() {
      try {
        const res = await fetch(`/api/og?url=${encodeURIComponent(url)}`)
        if (res.ok && isMounted) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchOG()
    return () => { isMounted = false }
  }, [url])

  if (loading) {
    if (displayMode === 'thumbnail') {
      return <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center"><span className="text-xs text-white/30">Loading preview...</span></div>
    }
    return <div className="h-24 w-full bg-white/5 animate-pulse rounded-xl mt-4"></div>
  }

  if (!data || (!data.title && !data.image)) {
    if (displayMode === 'thumbnail') return null
    return null
  }

  if (displayMode === 'thumbnail') {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="w-full h-full flex flex-col bg-[#1E1E2E] hover:bg-[#252535] transition-colors overflow-hidden group no-underline border-none"
      >
        {/* Image Section (Top 70%) */}
        {data.image ? (
          <div className="flex-1 w-full relative overflow-hidden bg-black/40 border-b border-white/5">
            <img 
              src={data.image} 
              alt={data.title || "Link preview"} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          </div>
        ) : (
          <div className="flex-1 w-full bg-[#161622] flex flex-col items-center justify-center border-b border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-50" />
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10 shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden">
              {data.logo ? (
                <img src={data.logo} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </div>
          </div>
        )}
        
        {/* Text Section (Bottom 30%) */}
        <div className="h-[32%] min-h-[70px] w-full p-3 px-4 flex flex-col justify-center bg-background/40">
          <span className="text-[10px] text-accent font-mono uppercase tracking-widest mb-1 opacity-80 flex items-center gap-1.5">
            {data.logo ? (
              <img src={data.logo} alt="Domain" className="w-3 h-3 object-contain rounded-sm" />
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            )}
            {new URL(url).hostname}
          </span>
          <h4 className="text-sm font-bold text-foreground line-clamp-1 leading-tight group-hover:text-accent transition-colors">
            {data.title || new URL(url).hostname}
          </h4>
          {data.description && (
            <p className="text-xs text-foreground/60 line-clamp-1 mt-1">
              {data.description}
            </p>
          )}
        </div>
      </a>
    )
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center gap-4 border border-border rounded-xl overflow-hidden hover:bg-accent/5 hover:border-accent/40 transition-colors bg-background/50 relative z-20 mt-4 group no-underline"
    >
      {data.image && (
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-border/30 border-r border-border overflow-hidden">
          <img src={data.image} alt={data.title || "Link preview"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-3 sm:p-4 flex flex-col justify-center min-w-0 flex-1">
        {data.title && <h4 className="text-sm font-bold text-foreground line-clamp-1 mb-1">{data.title}</h4>}
        {data.description && <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">{data.description}</p>}
        <span className="text-[10px] text-accent font-mono mt-2 flex items-center gap-1.5 opacity-80">
          {data.logo ? (
            <img src={data.logo} alt="Domain" className="w-3 h-3 object-contain rounded-sm" />
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          )}
          {new URL(url).hostname}
        </span>
      </div>
    </a>
  )
}
