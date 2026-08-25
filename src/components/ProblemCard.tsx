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
    <div className="group relative flex flex-col bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 p-6">
      <Link href={`/requests/${problem.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View request {problem.title}</span>
      </Link>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-foreground line-clamp-2 tracking-tight pr-4">
            {problem.title}
          </h3>
          <span className="inline-flex shrink-0 items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-mono font-medium text-accent">
            {problem.status}
          </span>
        </div>
        
        {truncatedDescription && (
          <p className="mt-2 text-sm text-foreground/70 line-clamp-3 leading-relaxed">
            {truncatedDescription}
          </p>
        )}

        {problem.tags && problem.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {problem.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-[4px] text-[11px] font-mono font-semibold bg-accent/10 text-accent uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
            {problem.tags.length > 5 && (
              <span className="inline-flex items-center px-2 py-1 rounded-[4px] text-[11px] font-mono font-semibold bg-border/50 text-foreground/70 uppercase tracking-wider">
                +{problem.tags.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
          <Link
            href={`/profile/${problem.profiles.username}`}
            className="relative z-20 flex items-center space-x-2 group/profile"
          >
            {problem.profiles.avatar_url ? (
              <img
                src={problem.profiles.avatar_url}
                alt={problem.profiles.username}
                className="w-6 h-6 rounded-full bg-border object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center">
                <span className="text-[10px] font-bold text-foreground/50">
                  {problem.profiles.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs font-mono font-medium text-foreground group-hover/profile:text-accent transition-colors">
              @{problem.profiles.username}
            </span>
          </Link>
          
          <span className="text-xs font-mono text-foreground/50">
            {new Date(problem.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}
