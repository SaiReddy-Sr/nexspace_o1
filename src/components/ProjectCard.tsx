'use client'

import Link from 'next/link'
import UpvoteButton from './UpvoteButton'
import { useRef, useState } from 'react'

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
  featured?: boolean
  featured_position?: number | null
  vote_count: number
  profiles: Profile
}

export default function ProjectCard({ project, isOwner, onQuickView, hasVoted = false, isLoggedIn = false }: { project: Project, isOwner?: boolean, onQuickView?: (project: Project) => void, hasVoted?: boolean, isLoggedIn?: boolean }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div className="group relative flex flex-col">
      {/* Image Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#151518] border border-white/5 shadow-sm group-hover:shadow-lg transition-all duration-300"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />
        
        {/* Primary link covering the whole image */}
        {onQuickView ? (
          <button onClick={(e) => { e.preventDefault(); onQuickView(project); }} className="absolute inset-0 z-10 text-left cursor-zoom-in">
            <span className="sr-only">View project {project.title}</span>
          </button>
        ) : (
          <Link href={`/project/${project.id}`} className="absolute inset-0 z-10">
            <span className="sr-only">View project {project.title}</span>
          </Link>
        )}

        {isOwner && (
          <div className="absolute top-3 right-3 z-20">
            <Link
              href={`/dashboard/edit-project/${project.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/60 text-xs font-medium text-white shadow-sm border border-white/10 hover:bg-white hover:text-black backdrop-blur-md transition-colors relative z-30"
            >
              Edit
            </Link>
          </div>
        )}

        {/* Media */}
        <div className="relative z-1 flex items-center justify-center w-full h-full">
          {project.media_url ? (
            project.media_type === 'video' ? (
              <video
                src={project.media_url}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={project.media_url}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            )
          ) : (
            <span className="text-gray-600 text-sm">No media</span>
          )}
        </div>
      </div>

      {/* Attribution and Vote Row */}
      <div className="mt-3 flex items-center justify-between px-1">
        <Link
          href={`/profile/${project.profiles.username}`}
          className="relative z-20 flex items-center space-x-2 group/profile min-w-0"
        >
          {project.profiles.avatar_url ? (
            <img
              src={project.profiles.avatar_url}
              alt={project.profiles.username}
              className="w-6 h-6 rounded-full bg-border object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-foreground/50">
                {project.profiles.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-bold text-sm text-white truncate max-w-[100px] group-hover/profile:text-accent transition-colors">
            {project.profiles.username}
          </span>
          <span className="text-sm text-foreground/50 truncate max-w-[120px] sm:max-w-[180px]">
            {project.title}
          </span>
        </Link>

        <UpvoteButton
          projectId={project.id}
          initialVoteCount={project.vote_count || 0}
          initialHasVoted={hasVoted}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  )
}
