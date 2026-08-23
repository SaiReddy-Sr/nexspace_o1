import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage(props: { searchParams: Promise<{ role?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // Fallback chain: URL query param -> user metadata -> 'developer'
  const role = searchParams.role || user.user_metadata?.intended_role || 'developer'

  // Check if profile already exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (profile) {
    redirect(`/profile/${profile.username}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Complete your profile
          </h2>
        </div>
        <OnboardingForm role={role} />
      </div>
    </div>
  )
}
