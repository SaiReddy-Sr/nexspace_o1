import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProblemForm from './ProblemForm'

export default async function NewRequestPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login?next=/requests/new')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single()

  // Server-side explicit role check
  if (!profile || profile.role !== 'client') {
    if (profile?.username) {
      redirect(`/profile/${profile.username}`)
    }
    // Fallback if no profile is found at all
    redirect('/onboarding')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Post a Request
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Describe what you need built. Developers will express interest, and you can choose who to chat with.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
        <ProblemForm />
      </div>
    </div>
  )
}
