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

export default function ProjectCard({ project, isOwner, isHero, onQuickView }: { project: Project, isOwner?: boolean, isHero?: boolean, onQuickView?: (project: Project) => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const truncatedDescription = project.description
    ? project.description.length > (isHero ? 200 : 100)
      ? project.description.substring(0, isHero ? 200 : 100) + '...'
      : project.description
    : null

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`group relative flex bg-[#151518] rounded-xl shadow-sm border border-white/10 overflow-hidden hover:shadow-lg transition-all duration-300 ${
        isHero
          ? 'flex-col md:flex-row col-span-1 sm:col-span-2 lg:col-span-3 border-accent/40 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
          : 'flex-col hover:-translate-y-1'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, color-mix(in srgb, var(--color-accent) 15%, transparent), transparent 40%)`,
        }}
      />
      
      {/* Primary link covering the whole card */}
      <Link href={`/project/${project.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View project {project.title}</span>
      </Link>

      {isOwner && (
        <div className="absolute top-3 right-3 z-20">
          <Link
            href={`/dashboard/edit-project/${project.id}`}
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-background/80 text-xs font-medium text-foreground shadow-sm border border-border hover:bg-background hover:text-accent backdrop-blur-md transition-colors relative z-30"
          >
            Edit
          </Link>
        </div>
      )}

      {/* Media section */}
      <div className={`relative z-10 flex items-center justify-center overflow-hidden bg-black/40 ${isHero ? 'w-full md:w-[60%] aspect-video md:aspect-auto h-64 md:h-[400px]' : 'w-full aspect-video'}`}>
        {project.media_url ? (
          project.media_type === 'video' ? (
            <video
              src={project.media_url}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay={isHero} // Autoplay muted video for hero
              playsInline
            />
          ) : (
            <img
              src={project.media_url}
              alt={project.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )
        ) : (
          <span className="text-gray-400 dark:text-gray-600 text-sm">No media</span>
        )}
      </div>

      {/* Content section */}
      <div className={`relative z-10 flex flex-col flex-1 p-5 ${isHero ? 'md:p-8 justify-center' : ''}`}>
        {isHero && (
          <div className="mb-4 inline-flex">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent/20 text-accent uppercase tracking-wider border border-accent/30 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              #1 Featured
            </span>
          </div>
        )}
        <h3 className={`font-bold text-foreground tracking-tight ${isHero ? 'text-3xl line-clamp-2' : 'text-lg line-clamp-1'}`}>
          {project.title}
        </h3>
        
        {truncatedDescription && (
          <p className={`mt-3 text-foreground/70 leading-relaxed ${isHero ? 'text-base line-clamp-4' : 'text-sm line-clamp-2'}`}>
            {truncatedDescription}
          </p>
        )}

        {/* Tech tags */}
        {project.tech_tags && project.tech_tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tech_tags.slice(0, isHero ? 6 : 4).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-[4px] text-[11px] font-mono font-semibold bg-accent/10 text-accent uppercase tracking-wider border border-accent/20"
              >
                {tag}
              </span>
            ))}
            {project.tech_tags.length > (isHero ? 6 : 4) && (
              <span className="inline-flex items-center px-2 py-1 rounded-[4px] text-[11px] font-mono font-semibold bg-white/5 text-foreground/70 uppercase tracking-wider">
                +{project.tech_tags.length - (isHero ? 6 : 4)}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Poster Info */}
        <div className={`mt-6 pt-4 border-t border-white/10 flex items-center justify-between ${isHero ? 'md:mt-8' : ''}`}>
          <Link
            href={`/profile/${project.profiles.username}`}
            className="relative z-30 flex items-center space-x-2 group/profile"
          >
            {project.profiles.avatar_url ? (
              <img
                src={project.profiles.avatar_url}
                alt={project.profiles.username}
                className={`rounded-full bg-border object-cover ${isHero ? 'w-8 h-8' : 'w-6 h-6'}`}
              />
            ) : (
              <div className={`rounded-full bg-white/10 flex items-center justify-center ${isHero ? 'w-8 h-8' : 'w-6 h-6'}`}>
                <span className="text-xs font-bold text-foreground/50">
                  {project.profiles.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className={`font-mono font-medium text-foreground group-hover/profile:text-accent transition-colors ${isHero ? 'text-sm' : 'text-xs'}`}>
              @{project.profiles.username}
            </span>
          </Link>

          {/* Quick view trigger placeholder (implemented in Part 4) */}
          {onQuickView && project.live_url && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(project); }}
              className="relative z-30 text-xs font-medium text-accent hover:text-white transition-colors bg-accent/10 hover:bg-accent px-3 py-1.5 rounded-md"
            >
              Quick View
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
