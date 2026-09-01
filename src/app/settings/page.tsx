import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './SettingsForm'

export const metadata = {
  title: 'Settings - NexSpace',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex flex-col min-h-full bg-background font-sans">
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-sm text-foreground/70">
            Update your profile and preferences.
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <SettingsForm initialProfile={profile} />
        </div>
      </main>
    </div>
  )
}
