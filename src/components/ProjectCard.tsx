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
    <div className="group relative flex flex-col bg-[#1E1E2E] border border-white/10 rounded-2xl p-3 sm:p-4 transition-all hover:bg-[#252535] hover:border-white/20 shadow-sm overflow-hidden">
      
      {/* Primary link covering the whole row */}
      <Link href={`/project/${project.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View project {project.title}</span>
      </Link>

      {isOwner && (
        <div className="absolute top-6 right-6 z-20">
          <Link
            href={`/dashboard/edit-project/${project.id}`}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/80 text-xs font-medium text-white shadow-sm border border-white/10 hover:bg-white hover:text-black backdrop-blur-md transition-colors relative z-30"
          >
            Edit
          </Link>
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative flex-shrink-0 rounded-xl overflow-hidden bg-black/40 aspect-[16/9] w-full mb-4 border border-white/5">
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
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center p-6 text-center">
              <span className="text-white/60 font-semibold text-lg line-clamp-2">{project.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Title */}
        <h3 className="font-bold text-white text-[18px] mb-1.5 leading-tight line-clamp-1 relative z-20 pointer-events-none group-hover:text-accent transition-colors">
          {project.title}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-[14px] text-white/50 line-clamp-2 leading-relaxed mb-4">
            {project.description}
          </p>
        )}

        {/* Bottom Metadata & Attribution Row */}
        <div className="mt-auto pt-2 flex items-center justify-between relative z-20 pointer-events-none group-hover:pointer-events-auto border-t border-white/5">
          <Link href={`/profile/${project.profiles.username}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity truncate mr-3">
            {project.profiles.avatar_url ? (
              <img
                src={project.profiles.avatar_url}
                alt={project.profiles.username}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white/50">
                  {project.profiles.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-medium text-[13px] text-white/70 truncate">
              {project.profiles.username}
            </span>
          </Link>

          <div className="flex-shrink-0">
             <UpvoteButton
                projectId={project.id}
                initialVoteCount={project.vote_count || 0}
                initialHasVoted={hasVoted}
                isLoggedIn={isLoggedIn}
              />
          </div>
        </div>
      </div>
    </div>
  )
}
