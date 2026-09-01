import { createClient } from '@/lib/supabase/server'
import ProjectFeed from '@/components/ProjectFeed'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let role = null
  let initialUserVotes: string[] = []
  
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) role = profile.role

    const { data: votes } = await supabase
      .from('project_votes')
      .select('project_id')
      .eq('voter_id', user.id)
    
    if (votes) {
      initialUserVotes = votes.map(v => v.project_id)
    }
  }

  const { data: initialProjects, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:developer_id (
        username,
        avatar_url
      )
    `)
    .order('featured_position', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(0, 9)

  if (error) {
    console.error('Error fetching initial projects:', error)
  }

  return (
    <div className="flex flex-col min-h-full bg-background font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Explore
          </h1>
          <p className="mt-1 text-sm text-foreground/70">
            Discover web apps built by the community.
          </p>
        </div>

        {/* Feed Section */}
        <ProjectFeed initialProjects={initialProjects || []} user={user} role={role} initialUserVotes={initialUserVotes} />
      </main>
    </div>
  )
}
