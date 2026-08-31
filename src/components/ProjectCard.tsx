'use client'

import Link from 'next/link'
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
  profiles: Profile
}

export default function ProjectCard({ project, isOwner, onQuickView }: { project: Project, isOwner?: boolean, onQuickView?: (project: Project) => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div className="group relative flex flex-col min-w-0">
      {/* Image Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
        className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-card border border-border shadow-lg shadow-black/40 group-hover:shadow-2xl group-hover:shadow-accent/20 group-hover:border-accent/50 group-hover:-translate-y-1 transition-all duration-300"
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
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-background/60 text-xs font-medium text-foreground shadow-sm border border-border hover:bg-foreground hover:text-background backdrop-blur-md transition-colors relative z-30"
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
            <span className="text-foreground/50 text-sm font-medium">No media</span>
          )}
          
          {/* Subtle gradient overlay at bottom for contrast / framing */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Attribution Row */}
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
            <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-foreground/50">
                {project.profiles.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-bold text-sm text-foreground truncate min-w-0 group-hover/profile:text-accent transition-colors">
            {project.profiles.username}
          </span>
          <span className="text-sm text-foreground/50 truncate min-w-0 flex-shrink">
            {project.title}
          </span>
        </Link>
      </div>
    </div>
  )
}
