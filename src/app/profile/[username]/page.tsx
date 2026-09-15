import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProjectCard from '@/components/ProjectCard'
import ProblemCard from '@/components/ProblemCard'
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

  let items: any[] = []
  let totalUpvotes = 0

  if (profile.role === 'client') {
    const { data: problems } = await supabase
      .from('problems')
      .select(`
        *,
        profiles:client_id (
          username,
          avatar_url
        )
      `)
      .eq('client_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50)
    
    items = problems || []
  } else {
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

    items = projects || []
    totalUpvotes = items.reduce((sum, project) => sum + (project.vote_count || 0), 0) || 0;
  }

  const isOwner = user?.id === profile.id;
  const isLoggedIn = !!user;

  let isTracking = false
  if (isLoggedIn && !isOwner) {
    const { data: sync } = await supabase
      .from('profile_syncs')
      .select('id')
      .eq('synced_profile_id', profile.id)
      .eq('syncer_id', user.id)
      .single()
    if (sync) isTracking = true
  }

  // Fetch total trackers
  const { count: trackersCount } = await supabase
    .from('profile_syncs')
    .select('*', { count: 'exact', head: true })
    .eq('synced_profile_id', profile.id)

  const totalTrackers = trackersCount || 0;

  // Fetch total signals
  const { count: signalsCount } = await supabase
    .from('profile_syncs')
    .select('*', { count: 'exact', head: true })
    .eq('syncer_id', profile.id)

  const totalSignals = signalsCount || 0;

  return (
    <div className="w-full bg-background font-sans pb-24">
      <ProfileHeader 
        profile={profile} 
        isOwner={isOwner} 
        stats={{ 
          projects: profile.role === 'client' ? 0 : items.length, 
          requests: profile.role === 'client' ? items.length : 0,
          upvotes: totalUpvotes, 
          trackers: totalTrackers, 
          signals: totalSignals 
        }} 
        isTracking={isTracking}
        isLoggedIn={isLoggedIn}
      />

      {/* Projects / Requests Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 border-t border-white/10 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {profile.role === 'client' ? 'Requests' : 'Projects'}
          </h2>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] rounded-2xl border border-white/5 shadow-inner">
            <p className="text-foreground/50 font-medium">No {profile.role === 'client' ? 'requests' : 'projects'} yet.</p>
          </div>
        ) : (
          <div className={profile.role === 'client' ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {items.map((item: any) => (
              profile.role === 'client' ? (
                <ProblemCard key={item.id} problem={item} />
              ) : (
                <ProjectCard 
                  key={item.id} 
                  project={item} 
                  isOwner={isOwner} 
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
