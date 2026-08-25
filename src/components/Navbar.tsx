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
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 group">
              <span className="w-6 h-6 rounded bg-accent text-white flex items-center justify-center text-sm font-black group-hover:bg-accent-hover transition-colors shadow-sm">
                N
              </span>
              nexspace
            </Link>
            <Link href="/requests" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Requests
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {username ? (
                  <>
                    {role === 'developer' && (
                      <Link href="/dashboard/new-project" className="text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors px-4 py-2 rounded-md shadow-sm">
                        New Project
                      </Link>
                    )}
                    {role === 'client' && (
                      <Link href="/requests/new" className="text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors px-4 py-2 rounded-md shadow-sm">
                        Post a Request
                      </Link>
                    )}
                    <Link href="/dashboard/messages" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                      Messages
                    </Link>
                    <Link href={`/profile/${username}`} className="text-sm font-mono text-foreground/70 hover:text-foreground transition-colors">
                      @{username}
                    </Link>
                  </>
                ) : (
                  <Link href="/onboarding" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                    Complete Profile
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-medium rounded-md bg-accent px-4 py-2 text-white hover:bg-accent-hover transition-colors shadow-sm">
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
