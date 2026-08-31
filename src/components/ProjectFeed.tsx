'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProjectCard from './ProjectCard'
import QuickViewDrawer from './QuickViewDrawer'
import Link from 'next/link'
import { Search } from 'lucide-react'

interface Profile {
  username: string
  avatar_url: string | null
}

interface Project {
  id: string
  title: string
  description: string | null
  tech_tags: string[]
  live_url: string | null
  media_url: string | null
  media_type: 'image' | 'video'
  created_at: string
  profiles: Profile
  featured?: boolean
  featured_position?: number | null
}

interface ProjectFeedProps {
  initialProjects: any[]
  user?: any
  role?: string | null
}

export default function ProjectFeed({ initialProjects, user, role }: ProjectFeedProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects as Project[])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialProjects.length === 10)
  
  // Filtering state
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Quick View state
  const [quickViewProject, setQuickViewProject] = useState<Project | null>(null)
  
  const observerTarget = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    const from = page * 10
    const to = from + 9

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:developer_id (
          username,
          avatar_url
        )
      `)
      .order('featured_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching projects:', error.message)
      setLoading(false)
      return
    }

    if (data && data.length > 0) {
      setProjects((prev) => {
        const existingIds = new Set(prev.map(p => p.id))
        const newProjects = data.filter(p => !existingIds.has(p.id)) as unknown as Project[]
        return [...prev, ...newProjects]
      })
      setPage((p) => p + 1)
      if (data.length < 10) {
        setHasMore(false)
      }
    } else {
      setHasMore(false)
    }

    setLoading(false)
  }, [page, loading, hasMore, supabase])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [loadMore, hasMore, loading])

  // Filter logic
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    projects.forEach(p => {
      if (p.tech_tags) {
        p.tech_tags.forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1
        })
      }
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [projects])

  const visibleProjects = useMemo(() => {
    let filtered = projects
    if (activeTag) {
      filtered = filtered.filter(p => p.tech_tags?.includes(activeTag))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q))
    }
    return filtered
  }, [projects, activeTag, searchQuery])

  // Featured for Right Sidebar
  const featuredProjects = useMemo(() => {
    return projects.filter(p => p.featured_position !== null).sort((a, b) => a.featured_position! - b.featured_position!)
  }, [projects])

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full relative">
      {/* Left Column: Feed */}
      <div className="flex-1 min-w-0">
        {/* Sticky filter bar */}
        <div className="sticky top-0 sm:top-4 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 py-4 mb-8 bg-background/90 backdrop-blur-md border-b border-white/5">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2 items-center">
            <button
              onClick={() => setActiveTag(null)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                !activeTag 
                  ? 'bg-white text-black' 
                  : 'bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              All
            </button>
            {tagCounts.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTag === tag
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tag} <span className="opacity-40 ml-1 text-xs">({count})</span>
              </button>
            ))}
          </div>
        </div>

        {projects.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
            <p className="text-foreground/50">Check back soon for new creations.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {visibleProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onQuickView={setQuickViewProject} 
                />
              ))}
              
              {visibleProjects.length === 0 && (
                <div className="col-span-1 sm:col-span-2 xl:col-span-3 text-center py-12 text-foreground/50">
                  No projects match your filter.
                </div>
              )}
            </div>

            <div ref={observerTarget} className="mt-12 flex justify-center py-4">
              {loading && (
                <div className="text-sm text-foreground/50 flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-foreground/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading more...</span>
                </div>
              )}
              {!hasMore && projects.length > 0 && (
                <div className="text-sm text-foreground/50">
                  You've reached the end
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Column: Sidebar (Home only) */}
      <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 pt-4 lg:pt-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <input 
            id="home-search-input"
            type="text" 
            placeholder="Search nexspace..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151518] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
          />
        </div>

        {/* Dynamic CTA Card */}
        <div className="bg-[#151518] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
          {!user ? (
            <>
              <h3 className="text-lg font-bold text-white mb-2">Join nexspace</h3>
              <p className="text-sm text-foreground/60 mb-5">Showcase your work to the community.</p>
              <Link href="/signup" className="w-full py-2.5 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-colors shadow-sm">Sign up</Link>
            </>
          ) : role === 'developer' ? (
            <>
              <h3 className="text-lg font-bold text-white mb-2">Post your next project</h3>
              <p className="text-sm text-foreground/60 mb-5">Share what you've been working on.</p>
              <Link href="/dashboard/new-project" className="w-full py-2.5 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-colors shadow-sm">New Project</Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white mb-2">Need something built?</h3>
              <p className="text-sm text-foreground/60 mb-5">Post a request and find a developer.</p>
              <Link href="/requests/new" className="w-full py-2.5 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-colors shadow-sm">Post a Request</Link>
            </>
          )}
        </div>

        {/* Top Ranked Widget */}
        <div className="bg-[#151518] border border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <h3 className="font-bold text-white mb-4">Top Ranked</h3>
          {featuredProjects.length === 0 ? (
            <p className="text-sm text-foreground/50">No featured projects yet</p>
          ) : (
            <div className="flex flex-col gap-4">
              {featuredProjects.slice(0, 5).map((fp, i) => (
                <Link href={`/project/${fp.id}`} key={fp.id} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5">
                    {fp.profiles?.avatar_url ? (
                      <img src={fp.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white">{fp.title.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white truncate group-hover:text-accent transition-colors">{fp.title}</span>
                    <span className="text-xs text-foreground/50 truncate">@{fp.profiles?.username}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>

      <QuickViewDrawer 
        project={quickViewProject} 
        onClose={() => setQuickViewProject(null)} 
      />
    </div>
  )
}
