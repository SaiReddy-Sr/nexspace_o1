import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MessageButton from './MessageButton'

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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950 font-sans pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Header / Profile Info */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href={`/profile/${project.profiles.username}`} className="group flex items-center space-x-3 transition-opacity hover:opacity-80">
            {project.profiles.avatar_url ? (
              <img
                src={project.profiles.avatar_url}
                alt={project.profiles.username}
                className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-800"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border border-gray-300 dark:border-gray-700">
                <span className="text-xl font-medium text-gray-500 dark:text-gray-400">
                  {project.profiles.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created by</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white group-hover:underline">
                @{project.profiles.username}
              </p>
            </div>
          </Link>
        </div>

        {/* Title and Action */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap gap-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors"
              >
                Visit Live App
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
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
          <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm mb-12">
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About the Project</h2>
                <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {project.description}
                </div>
              </section>
            )}
          </div>
          
          <div className="space-y-8">
            {project.tech_tags && project.tech_tags.length > 0 && (
              <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
            
            <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Posted On
              </h3>
              <p className="text-gray-900 dark:text-white font-medium">
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
