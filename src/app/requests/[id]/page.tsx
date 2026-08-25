import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import InterestButton from './InterestButton'
import ClientActions from './ClientActions'

export default async function RequestDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const problemId = params.id;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the problem and client profile
  const { data: problem, error: problemError } = await supabase
    .from('problems')
    .select(`
      *,
      profiles:client_id (
        username,
        avatar_url
      )
    `)
    .eq('id', problemId)
    .single()

  if (problemError || !problem) {
    notFound()
  }

  let role: string | null = null
  let hasExpressedInterest = false
  let interestedDevelopers: any[] = []

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    role = profile?.role || null

    if (role === 'developer') {
      // Check if they expressed interest
      const { data: interest } = await supabase
        .from('problem_interests')
        .select('id')
        .eq('problem_id', problemId)
        .eq('developer_id', user.id)
        .single()
      
      if (interest) hasExpressedInterest = true
    }

    if (user.id === problem.client_id) {
      // Fetch list of interested developers
      const { data: interests } = await supabase
        .from('problem_interests')
        .select(`
          id,
          developer_id,
          profiles:developer_id (
            username,
            avatar_url
          )
        `)
        .eq('problem_id', problemId)
        .order('created_at', { ascending: true })
      
      if (interests) interestedDevelopers = interests
    }
  }

  const isOwner = user?.id === problem.client_id

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {problem.title}
          </h1>
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {problem.status}
          </span>
        </div>

        <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <Link href={`/profile/${problem.profiles.username}`} className="group flex items-center space-x-3">
            {problem.profiles.avatar_url ? (
              <img
                src={problem.profiles.avatar_url}
                alt={problem.profiles.username}
                className="w-12 h-12 rounded-full bg-gray-200 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xl font-medium text-gray-500 dark:text-gray-400">
                  {problem.profiles.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:underline">
                @{problem.profiles.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(problem.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {problem.description || "No description provided."}
          </p>
        </div>

        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {!user ? (
          <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
            <Link
              href={`/signup?next=${encodeURIComponent(`/requests/${problemId}`)}`}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors w-full sm:w-auto"
            >
              Sign up to Express Interest
            </Link>
          </div>
        ) : isOwner ? (
          <ClientActions problemId={problemId} interestedDevelopers={interestedDevelopers} />
        ) : role === 'developer' ? (
          <InterestButton problemId={problemId} hasExpressedInterest={hasExpressedInterest} />
        ) : null}
      </div>
    </div>
  )
}
