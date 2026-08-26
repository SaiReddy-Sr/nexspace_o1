import { createClient } from '@/lib/supabase/server'
import ProjectFeed from '@/components/ProjectFeed'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let role = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) role = profile.role
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        
        {/* Header Section */}
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Discover amazing projects.
          </h1>
          <p className="mt-6 text-lg text-foreground/70 max-w-2xl leading-relaxed">
            Explore web apps built by the community. Find inspiration, discover talent, and connect with developers.
          </p>
        </div>

        {/* Feed Section */}
        <ProjectFeed initialProjects={initialProjects || []} user={user} role={role} />
      </main>
    </div>
  )
}
