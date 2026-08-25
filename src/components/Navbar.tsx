import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './LogoutButton'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let username = null
  let role = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      username = profile.username
      role = profile.role
    }
  }

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              nexspace
            </Link>
            <Link href="/requests" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
              Requests
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {username ? (
                  <>
                    {role === 'developer' && (
                      <Link href="/dashboard/new-project" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md">
                        New Project
                      </Link>
                    )}
                    {role === 'client' && (
                      <Link href="/requests/new" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md">
                        Post a Request
                      </Link>
                    )}
                    <Link href="/dashboard/messages" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                      Messages
                    </Link>
                    <Link href={`/profile/${username}`} className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                      @{username}
                    </Link>
                  </>
                ) : (
                  <Link href="/onboarding" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Complete Profile
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-medium rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
