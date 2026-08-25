import { createClient } from '@/lib/supabase/server'
import ProjectFeed from '@/components/ProjectFeed'

export default async function Home() {
  const supabase = await createClient()

  const { data: initialProjects, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:developer_id (
        username,
        avatar_url
      )
    `)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(0, 9)

  if (error) {
    console.error('Error fetching initial projects:', error)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950 font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Discover amazing projects.
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            Explore web apps built by the community. Find inspiration, discover talent, and connect with developers.
          </p>
        </div>

        {/* Feed Section */}
        <ProjectFeed initialProjects={initialProjects || []} />
      </main>
    </div>
  )
}
