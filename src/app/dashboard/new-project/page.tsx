import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewProjectForm from './NewProjectForm'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single()

  // Server-side explicit role check
  if (!profile || profile.role !== 'developer') {
    if (profile?.username) {
      redirect(`/profile/${profile.username}`)
    }
    // Fallback if no profile is found at all
    redirect('/onboarding')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Post a New Project
        </h1>
        <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto sm:mx-0">
          Share your latest creation with the community. Upload high-quality media and add descriptive tags to make it stand out.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0"></div>
        <div className="p-6 sm:p-10 lg:p-12">
          <NewProjectForm />
        </div>
      </div>
    </div>
  )
}
