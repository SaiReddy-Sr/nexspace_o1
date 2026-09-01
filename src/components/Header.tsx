import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeaderSearchInput, HeaderClientMenu } from './HeaderClientItems'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let username = null
  let role = null
  let avatar_url = null
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role, avatar_url')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      username = profile.username
      role = profile.role
      avatar_url = profile.avatar_url
    }
  }

  // Determine Create button link and label
  let createLink = '/signup'
  let createLabel = 'Create'
  
  if (user) {
    if (role === 'developer') {
      createLink = '/dashboard/new-project'
      createLabel = 'New Project'
    } else if (role === 'client') {
      createLink = '/requests/new'
      createLabel = 'Post Request'
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-b border-white/5 z-[60] flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white font-black group-hover:bg-accent-hover transition-colors shadow-sm">
            N
          </div>
          <span className="font-extrabold text-xl tracking-tight hidden sm:block">
            NexSpace
          </span>
        </Link>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-2xl px-4 hidden sm:block">
        <HeaderSearchInput />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <Link 
          href={createLink}
          className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-bold bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-colors"
        >
          <span className="mr-2 opacity-70">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </span>
          {createLabel}
        </Link>

        <HeaderClientMenu user={user} username={username} avatarUrl={avatar_url} />
      </div>
    </header>
  )
}
