import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeaturedDashboard from './FeaturedDashboard'

export default async function AdminFeaturedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, featured, featured_position')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-white">Featured Ranking — Admin</h1>
      <FeaturedDashboard initialProjects={projects || []} />
    </div>
  )
}
