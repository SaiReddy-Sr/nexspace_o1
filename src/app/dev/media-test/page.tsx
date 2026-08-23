import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MediaTestClient from './MediaTestClient'

// TEMPORARY — remove in Phase 4 once the real project-posting form exists.

export default async function MediaTestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Media Upload Test Harness
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This is a temporary page to test the ProjectMediaUploader component.
        </p>
      </div>

      <MediaTestClient />
    </div>
  )
}
