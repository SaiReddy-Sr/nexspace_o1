import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MessageButton from './MessageButton'
import QuickViewTrigger from '@/components/QuickViewTrigger'
import UpvoteButton from '@/components/UpvoteButton'

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const projectId = params.id
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:developer_id (
        username,
        avatar_url
      )
    `)
    .eq('id', projectId)
    .single()

  if (error || !project) {
    notFound()
  }

  // Check auth state for the Message Developer button
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const isOwnProject = isLoggedIn && user.id === project.developer_id

  let hasVoted = false
  if (isLoggedIn) {
    const { data: vote } = await supabase
      .from('project_votes')
      .select('id')
      .eq('project_id', project.id)
      .eq('voter_id', user.id)
      .single()
    if (vote) hasVoted = true
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background font-sans pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Header / Profile Info */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href={`/profile/${project.profiles.username}`} className="group flex items-center space-x-4 transition-opacity hover:opacity-80">
            {project.profiles.avatar_url ? (
              <img
                src={project.profiles.avatar_url}
                alt={project.profiles.username}
                className="w-12 h-12 rounded-full border border-border shadow-sm object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center border border-border shadow-sm">
                <span className="text-xl font-bold text-foreground/50 uppercase">
                  {project.profiles.username.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground/50 uppercase tracking-widest">Created by</p>
              <p className="text-lg font-mono font-bold text-foreground group-hover:text-accent transition-colors">
                @{project.profiles.username}
              </p>
            </div>
          </Link>
        </div>

        {/* Title and Action */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap gap-3 items-center">
            <UpvoteButton
              projectId={project.id}
              initialVoteCount={project.vote_count || 0}
              initialHasVoted={hasVoted}
              isLoggedIn={isLoggedIn}
            />

            {project.live_url && (
              <QuickViewTrigger project={project} />
            )}
            
            <MessageButton 
              projectId={project.id}
              developerId={project.developer_id}
              isLoggedIn={isLoggedIn}
              isOwnProject={isOwnProject}
            />
          </div>
        </div>

        {/* Media */}
        {project.media_url && (
          <div className="rounded-xl overflow-hidden bg-border/30 border border-border shadow-sm mb-16">
            {project.media_type === 'video' ? (
              <video
                src={project.media_url}
                className="w-full h-auto max-h-[70vh] object-contain"
                controls
                autoPlay={false}
                muted
              />
            ) : (
              <img
                src={project.media_url}
                alt={project.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            )}
          </div>
        )}

        {/* Details section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            {project.description && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight">About the Project</h2>
                <div className="prose prose-invert max-w-none text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {project.description}
                </div>
              </section>
            )}
          </div>
          
          <div className="space-y-8">
            {project.tech_tags && project.tech_tags.length > 0 && (
              <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-5 tracking-tight">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-[4px] text-[11px] font-mono font-bold bg-accent/10 text-accent uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
            
            <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <h3 className="text-xs font-mono font-bold text-foreground/50 uppercase tracking-widest mb-3">
                Posted On
              </h3>
              <p className="text-foreground font-mono">
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit'
                })}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
