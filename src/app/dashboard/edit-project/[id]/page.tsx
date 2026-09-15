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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Edit Project
        </h1>
        <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto sm:mx-0">
          Update your project details, upload new media, and keep the community in the loop.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0"></div>
        <div className="p-6 sm:p-10 lg:p-12">
          <EditProjectForm project={project} />
        </div>
      </div>
    </div>
  )
}
