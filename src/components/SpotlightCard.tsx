import Link from 'next/link'
import { Sparkles, ExternalLink } from 'lucide-react'
import MessageButton from '@/app/project/[id]/MessageButton'

export default function SpotlightCard({ project, isLoggedIn }: { project: any, isLoggedIn: boolean }) {
  if (!project) return null

  return (
    <div className="group relative flex flex-col sm:flex-row gap-4 sm:gap-4 py-2 transition-colors mb-6">
      
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 rounded-xl overflow-hidden bg-[#212121] aspect-[16/9] w-full sm:w-[45%] sm:max-w-[420px]">
        <div className="relative z-1 flex items-center justify-center w-full h-full">
          {project.media_url ? (
            project.media_type === 'video' ? (
              <video
                src={project.media_url}
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
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
            <span className="text-white/30 text-sm font-medium">No media</span>
          )}
        </div>
        
        {/* Spotlight Badge overlay */}
        <div className="absolute top-2 right-2 z-20">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold text-white/90 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-white" />
            Spotlight
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1 pr-4 py-1">
        
        {/* Title */}
        <Link href={`/project/${project.id}`} className="hover:opacity-80 transition-opacity">
          <h2 className="text-[18px] sm:text-[20px] font-semibold text-white mb-1 leading-tight line-clamp-2">
            SPOTLIGHT: {project.title}
          </h2>
        </Link>

        {project.description && (
          <p className="text-white/50 text-[13px] leading-relaxed line-clamp-2 mb-4 max-w-xl">
            Leading ML Teams: {project.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-1">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors text-[13px]"
            >
              Explore API
            </a>
          )}
          
          <div className="[&>div>button]:px-4 [&>div>button]:py-1.5 [&>div>button]:rounded-full [&>div>button]:bg-white/10 [&>div>button]:text-white [&>div>button]:hover:bg-white/20 [&>div>button]:font-medium [&>div>button]:text-[13px] [&>a]:px-4 [&>a]:py-1.5 [&>a]:rounded-full [&>a]:bg-white/10 [&>a]:text-white [&>a]:hover:bg-white/20 [&>a]:font-medium [&>a]:text-[13px]">
            <MessageButton
              projectId={project.id}
              developerId={project.developer_id}
              isLoggedIn={isLoggedIn}
              isOwnProject={isLoggedIn && project.developer_id === (project.current_user_id || '')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
