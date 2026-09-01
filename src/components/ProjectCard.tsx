'use client'

import Link from 'next/link'
import UpvoteButton from './UpvoteButton'

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
  vote_count: number
}

export default function ProjectCard({ project, isOwner, onQuickView, hasVoted = false, isLoggedIn = false }: { project: Project, isOwner?: boolean, onQuickView?: (project: Project) => void, hasVoted?: boolean, isLoggedIn?: boolean }) {
  const isTopFeatured = project.featured_position === 1

  return (
    <div className="group relative flex flex-col sm:flex-row gap-4 sm:gap-4 py-2 transition-colors">
      
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
        <div className="absolute top-2 right-2 z-20">
          <Link
            href={`/dashboard/edit-project/${project.id}`}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/80 text-xs font-medium text-white shadow-sm border border-white/10 hover:bg-white hover:text-black backdrop-blur-md transition-colors relative z-30"
          >
            Edit
          </Link>
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative flex-shrink-0 rounded-xl overflow-hidden bg-[#212121] aspect-[16/9] w-full sm:w-[45%] sm:max-w-[420px]">
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
            <span className="text-white/30 text-sm font-medium">No media</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0 py-1 flex-1 pr-4">
        
        {/* Title */}
        <h3 className="font-semibold text-white text-[18px] mb-1 leading-tight line-clamp-2">
          {project.title}
        </h3>

        {/* Mocked Stats */}
        <div className="text-[13px] text-white/50 mb-3">
          5.2k views • 2 weeks ago
        </div>

        {/* Attribution Row */}
        <div className="flex items-center mt-1 mb-2 relative z-20 pointer-events-none group-hover:pointer-events-auto">
          <Link href={`/profile/${project.profiles.username}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            {project.profiles.avatar_url ? (
              <img
                src={project.profiles.avatar_url}
                alt={project.profiles.username}
                className="w-6 h-6 rounded-full bg-white/10 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white/50">
                  {project.profiles.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-medium text-[13px] text-white/70 truncate">
              {project.profiles.username} <span className="text-white/40 ml-1">(Verified Partner)</span>
            </span>
          </Link>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-[13px] text-white/50 line-clamp-2 max-w-3xl leading-relaxed mt-2">
            {project.description}
          </p>
        )}

        <div className="mt-auto flex justify-end relative z-20 pointer-events-none group-hover:pointer-events-auto">
           <UpvoteButton
              projectId={project.id}
              initialVoteCount={project.vote_count || 0}
              initialHasVoted={hasVoted}
              isLoggedIn={isLoggedIn}
            />
        </div>
      </div>
    </div>
  )
}
