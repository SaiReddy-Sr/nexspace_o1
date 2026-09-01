'use client'

import Link from 'next/link'

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

export default function ProjectCard({ project, isOwner, onQuickView }: { project: Project, isOwner?: boolean, onQuickView?: (project: Project) => void }) {
  const isTopFeatured = project.featured_position === 1

  return (
    <div className={`group relative flex flex-col sm:flex-row gap-4 sm:gap-6 py-4 sm:py-6 rounded-2xl hover:bg-foreground/5 transition-colors border-b border-white/5 last:border-b-0 ${isTopFeatured ? 'bg-foreground/[0.02] border-white/10 shadow-sm px-4 -mx-4' : ''}`}>
      
      {/* Primary link covering the whole row */}
      {onQuickView ? (
        <button onClick={(e) => { e.preventDefault(); onQuickView(project); }} className="absolute inset-0 z-10 text-left cursor-zoom-in rounded-2xl">
          <span className="sr-only">View project {project.title}</span>
        </button>
      ) : (
        <Link href={`/project/${project.id}`} className="absolute inset-0 z-10 rounded-2xl">
          <span className="sr-only">View project {project.title}</span>
        </Link>
      )}

      {isOwner && (
        <div className="absolute top-4 right-4 z-20">
          <Link
            href={`/dashboard/edit-project/${project.id}`}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-background/80 text-xs font-medium text-foreground shadow-sm border border-border hover:bg-foreground hover:text-background backdrop-blur-md transition-colors relative z-30"
          >
            Edit
          </Link>
        </div>
      )}

      {/* Thumbnail */}
      <div
        className={`relative flex-shrink-0 rounded-xl overflow-hidden bg-card border border-border aspect-video ${
          isTopFeatured ? 'w-full sm:w-[40%] sm:max-w-[420px]' : 'w-full sm:w-[35%] sm:max-w-[360px]'
        }`}
      >
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
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0 py-1 flex-1">
        
        {/* Title */}
        <h3 className={`font-bold text-foreground line-clamp-2 ${isTopFeatured ? 'text-2xl mb-2' : 'text-xl mb-1'}`}>
          {project.title}
        </h3>

        {/* Attribution Row */}
        <div className="flex items-center space-x-2 mt-1 mb-3 relative z-20 pointer-events-none group-hover:pointer-events-auto">
          <Link href={`/profile/${project.profiles.username}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
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
            <span className="font-medium text-sm text-foreground/70 truncate">
              {project.profiles.username}
            </span>
          </Link>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-foreground/70 line-clamp-2 mb-4 max-w-3xl leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tech_tags && project.tech_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {project.tech_tags.slice(0, 4).map((tag, idx) => (
              <span key={idx} className="px-2 py-1 rounded-md bg-foreground/5 text-xs font-medium text-foreground/70">
                {tag}
              </span>
            ))}
            {project.tech_tags.length > 4 && (
              <span className="px-2 py-1 rounded-md bg-foreground/5 text-xs font-medium text-foreground/70">
                +{project.tech_tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
