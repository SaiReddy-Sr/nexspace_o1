import { createClient } from '@/lib/supabase/server'
import ProblemFeed from '@/components/ProblemFeed'
import Link from 'next/link'

export default async function RequestsPage() {
  const supabase = await createClient()

  // Initial fetch for SSR
  const { data: initialProblems, error } = await supabase
    .from('problems')
    .select(`
      *,
      profiles:client_id (
        username,
        avatar_url
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(0, 9)

  if (error) {
    console.error('Error fetching initial problems:', error)
  }

  // Also check if current user is a client to optionally show a post button here
  const { data: { user } } = await supabase.auth.getUser()
  let isClient = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'client') {
      isClient = true
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Client Requests
            </h1>
            <p className="mt-6 text-lg text-foreground/70 max-w-2xl leading-relaxed">
              Browse open problems and feature requests from clients. Express your interest to start a conversation.
            </p>
          </div>
          
          {isClient && (
            <Link
              href="/requests/new"
              className="inline-flex justify-center items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent-hover transition-colors"
            >
              Post a Request
            </Link>
          )}
        </div>

        <ProblemFeed initialProblems={initialProblems || []} />
      </main>
    </div>
  )
}
