import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProjectCard from '@/components/ProjectCard'

export default async function ProfilePage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const username = params.username
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    notFound()
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('developer_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const isOwner = user?.id === profile.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-12">
        <div className="h-32 w-32 rounded-full bg-border flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm border border-border">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={username} className="h-full w-full object-cover" />
          ) : (
            <span className="text-foreground/50 text-4xl font-bold uppercase">
              {username.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {profile.full_name || username}
          </h1>
          <p className="text-lg text-foreground/70 mt-1 font-mono">@{username}</p>
          
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
            <span className="inline-flex items-center rounded bg-accent/10 px-3 py-1 text-xs font-mono font-bold text-accent uppercase tracking-wider">
              {profile.role === 'developer' ? 'Developer' : 'Client'}
            </span>
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Website ↗
              </a>
            )}
          </div>

          {profile.bio && (
            <p className="mt-5 text-foreground/80 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div className="border-t border-border pt-12">
        <h2 className="text-2xl font-bold text-foreground mb-8 tracking-tight">
          Projects
        </h2>
        
        {!projects || projects.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
            <p className="text-foreground/50 font-medium">No projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project: any) => (
              <ProjectCard 
                key={project.id} 
                project={{...project, profiles: { username: profile.username, avatar_url: profile.avatar_url }}} 
                isOwner={isOwner} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
