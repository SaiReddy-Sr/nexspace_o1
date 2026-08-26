'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProjectCard from './ProjectCard'
import QuickViewDrawer from './QuickViewDrawer'

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
  profiles: Profile // the joined profile object
  featured?: boolean
  featured_position?: number | null
}

interface ProjectFeedProps {
  initialProjects: any[] // we use any to bypass strict type check for joined table parsing initially
}

export default function ProjectFeed({ initialProjects }: ProjectFeedProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects as Project[])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialProjects.length === 10)
  
  // Filtering state
  const [activeTag, setActiveTag] = useState<string | null>(null)
  
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
        // Simple deduplication just in case
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

  // Filter bar logic: compute counts based on currently loaded projects
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
    if (!activeTag) return projects
    return projects.filter(p => p.tech_tags?.includes(activeTag))
  }, [projects, activeTag])

  // Bento Hero logic
  // Only the project with featured_position === 0 gets the hero treatment
  const heroProject = visibleProjects.length > 0 && visibleProjects[0].featured_position === 0 
    ? visibleProjects[0] 
    : null
    
  const gridProjects = heroProject ? visibleProjects.slice(1) : visibleProjects

  if (projects.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Check back soon for new creations.</p>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 py-4 mb-8 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2 items-center">
          <button
            onClick={() => setActiveTag(null)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeTag 
                ? 'bg-foreground text-background' 
                : 'bg-accent/5 text-foreground/70 hover:bg-accent/10 hover:text-foreground'
            }`}
          >
            All
          </button>
          {tagCounts.map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeTag === tag
                  ? 'bg-accent text-white border-accent'
                  : 'bg-background text-foreground/70 border-border hover:border-accent/50 hover:text-foreground'
              }`}
            >
              {tag} <span className="opacity-60 ml-1 text-xs">({count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {heroProject && (
          <ProjectCard 
            key={heroProject.id} 
            project={heroProject} 
            isHero={true} 
            onQuickView={setQuickViewProject} 
          />
        )}
        
        {gridProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onQuickView={setQuickViewProject} 
          />
        ))}
        
        {visibleProjects.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12 text-slate-500">
            No projects match the selected tag.
          </div>
        )}
      </div>

      <div ref={observerTarget} className="mt-8 flex justify-center py-4">
        {loading && (
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading more...</span>
          </div>
        )}
        {!hasMore && projects.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            You've reached the end
          </div>
        )}
      </div>
      
      <QuickViewDrawer 
        project={quickViewProject} 
        onClose={() => setQuickViewProject(null)} 
      />
    </div>
  )
}
