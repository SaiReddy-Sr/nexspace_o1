import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProjectCard from '@/components/ProjectCard'
import ProfileHeader from '@/components/ProfileHeader'

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
    .select(`
      *,
      profiles:developer_id (
        username,
        avatar_url
      )
    `)
    .eq('developer_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const isOwner = user?.id === profile.id;

  return (
    <div className="w-full bg-background font-sans pb-24">
      <ProfileHeader profile={profile} isOwner={isOwner} />

      {/* Projects Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 border-t border-white/10 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Projects
          </h2>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>
        
        {!projects || projects.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] rounded-2xl border border-white/5 shadow-inner">
            <p className="text-foreground/50 font-medium">No projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                isOwner={isOwner} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
