import Link from 'next/link'

interface Profile {
  username: string
  avatar_url: string | null
}

interface Problem {
  id: string
  title: string
  description: string | null
  tags: string[]
  created_at: string
  status: string
  profiles: Profile
}

export default function ProblemCard({ problem }: { problem: Problem }) {
  const truncatedDescription = problem.description
    ? problem.description.length > 150
      ? problem.description.substring(0, 150) + '...'
      : problem.description
    : null

  return (
    <div className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-200 p-6">
      <Link href={`/requests/${problem.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View request {problem.title}</span>
      </Link>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
            {problem.title}
          </h3>
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {problem.status}
          </span>
        </div>
        
        {truncatedDescription && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {truncatedDescription}
          </p>
        )}

        {problem.tags && problem.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {problem.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {problem.tags.length > 5 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                +{problem.tags.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <Link
            href={`/profile/${problem.profiles.username}`}
            className="relative z-10 flex items-center space-x-2 group/profile hover:opacity-80 transition-opacity"
          >
            {problem.profiles.avatar_url ? (
              <img
                src={problem.profiles.avatar_url}
                alt={problem.profiles.username}
                className="w-6 h-6 rounded-full bg-gray-200"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {problem.profiles.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              @{problem.profiles.username}
            </span>
          </Link>
          
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(problem.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}
