import Link from 'next/link'
import { Sparkles, ExternalLink } from 'lucide-react'
import MessageButton from '@/app/project/[id]/MessageButton'

export default function SpotlightCard({ project, isLoggedIn }: { project: any, isLoggedIn: boolean }) {
  if (!project) return null

  return (
    <div className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-3xl bg-card border border-border shadow-lg hover:border-accent/30 transition-all duration-300 mb-8 overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />

      {/* Media */}
      <div className="relative z-10 w-full md:w-[45%] aspect-video rounded-2xl overflow-hidden bg-background border border-border">
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
          <div className="w-full h-full flex items-center justify-center text-foreground/50 text-sm font-medium">No media</div>
        )}
        
        {/* Spotlight Badge overlay */}
        <div className="absolute top-4 right-4 z-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 text-xs font-bold text-foreground backdrop-blur-md shadow-sm border border-border">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Spotlight
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center min-w-0 flex-1 py-2">
        <Link href={`/project/${project.id}`} className="hover:opacity-80 transition-opacity">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3 leading-tight line-clamp-2">
            {project.title}
          </h2>
        </Link>

        {project.description && (
          <p className="text-foreground/70 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6 max-w-xl">
            {project.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-auto">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-accent text-white font-bold hover:bg-accent-hover transition-colors shadow-sm text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Live App
            </a>
          )}
          
          <div className="[&>div>button]:px-5 [&>div>button]:py-2.5 [&>div>button]:rounded-xl [&>div>button]:bg-transparent [&>div>button]:border [&>div>button]:border-border [&>div>button]:text-foreground [&>div>button]:hover:bg-foreground/5 [&>div>button]:font-bold [&>div>button]:text-sm [&>a]:px-5 [&>a]:py-2.5 [&>a]:rounded-xl [&>a]:bg-transparent [&>a]:border [&>a]:border-border [&>a]:text-foreground [&>a]:hover:bg-foreground/5 [&>a]:font-bold [&>a]:text-sm">
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
