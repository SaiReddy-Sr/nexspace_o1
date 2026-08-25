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
    <div className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Primary link covering the whole card */}
      <Link href={`/project/${project.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View project {project.title}</span>
      </Link>

      {isOwner && (
        <div className="absolute top-2 right-2 z-10">
          <Link
            href={`/dashboard/edit-project/${project.id}`}
            className="inline-flex items-center px-3 py-1 rounded-md bg-white/90 dark:bg-gray-800/90 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm transition-colors"
          >
            Edit
          </Link>
        </div>
      )}

      {/* Media section */}
      <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
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
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
          {project.title}
        </h3>
        
        {truncatedDescription && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {truncatedDescription}
          </p>
        )}

        {/* Tech tags */}
        {project.tech_tags && project.tech_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tech_tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
            {project.tech_tags.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                +{project.tech_tags.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Poster Info */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <Link
            href={`/profile/${project.profiles.username}`}
            className="relative z-10 flex items-center space-x-2 group/profile hover:opacity-80 transition-opacity"
          >
            {project.profiles.avatar_url ? (
              <img
                src={project.profiles.avatar_url}
                alt={project.profiles.username}
                className="w-6 h-6 rounded-full bg-gray-200"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {project.profiles.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              @{project.profiles.username}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
