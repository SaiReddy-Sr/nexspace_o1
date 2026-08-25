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
}

export default function ProjectCard({ project, isOwner }: { project: Project, isOwner?: boolean }) {
  // Truncate description to 100 characters
  const truncatedDescription = project.description
    ? project.description.length > 100
      ? project.description.substring(0, 100) + '...'
      : project.description
    : null

  return (
    <div className="group relative flex flex-col bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg hover:border-accent/40 hover:-translate-y-1 transition-all duration-300">
      {/* Primary link covering the whole card */}
      <Link href={`/project/${project.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View project {project.title}</span>
      </Link>

      {isOwner && (
        <div className="absolute top-3 right-3 z-20">
          <Link
            href={`/dashboard/edit-project/${project.id}`}
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-background/80 text-xs font-medium text-foreground shadow-sm border border-border hover:bg-background hover:text-accent backdrop-blur-md transition-colors"
          >
            Edit
          </Link>
        </div>
      )}

      {/* Media section */}
      <div className="w-full aspect-video bg-border/30 flex items-center justify-center overflow-hidden">
        {project.media_url ? (
          project.media_type === 'video' ? (
            <video
              src={project.media_url}
              className="w-full h-full object-cover"
              muted
              loop
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
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-foreground line-clamp-1 tracking-tight">
          {project.title}
        </h3>
        
        {truncatedDescription && (
          <p className="mt-2 text-sm text-foreground/70 line-clamp-2 leading-relaxed">
            {truncatedDescription}
          </p>
        )}

        {/* Tech tags */}
        {project.tech_tags && project.tech_tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tech_tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-[4px] text-[11px] font-mono font-semibold bg-accent/10 text-accent uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
            {project.tech_tags.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-[4px] text-[11px] font-mono font-semibold bg-border/50 text-foreground/70 uppercase tracking-wider">
                +{project.tech_tags.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Poster Info */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <Link
            href={`/profile/${project.profiles.username}`}
            className="relative z-20 flex items-center space-x-2 group/profile"
          >
            {project.profiles.avatar_url ? (
              <img
                src={project.profiles.avatar_url}
                alt={project.profiles.username}
                className="w-6 h-6 rounded-full bg-border object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center">
                <span className="text-[10px] font-bold text-foreground/50">
                  {project.profiles.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs font-mono font-medium text-foreground group-hover/profile:text-accent transition-colors">
              @{project.profiles.username}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
