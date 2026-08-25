import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EditProjectForm from './EditProjectForm'

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const projectId = params.id;
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

  // Server-side guard: redirect away if the logged-in user is not the owner of this project
  if (project.developer_id !== user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Edit Project
        </h1>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
        <EditProjectForm project={project} />
      </div>
    </div>
  )
}
