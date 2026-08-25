import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage(props: { searchParams: Promise<{ role?: string; next?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // Fallback chain: URL query param -> user metadata -> 'developer'
  const role = searchParams.role || user.user_metadata?.intended_role || 'developer'
  const nextParam = searchParams.next

  // Check if profile already exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (profile) {
    if (nextParam) {
      redirect(nextParam)
    }
    redirect(`/profile/${profile.username}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Complete your profile
          </h2>
        </div>
        <OnboardingForm role={role} nextParam={nextParam} />
      </div>
    </div>
  )
}
