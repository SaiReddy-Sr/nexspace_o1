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
        <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={username} className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-4xl uppercase">
              {username.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {profile.full_name || username}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">@{username}</p>
          
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {profile.role === 'developer' ? 'Developer' : 'Client'}
            </span>
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Website ↗
              </a>
            )}
          </div>

          {profile.bio && (
            <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Projects
        </h2>
        
        {!projects || projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No projects yet.</p>
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
