import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeaderSearchInput, HeaderClientMenu, HeaderLogo } from './HeaderClientItems'
import { HeaderHamburger } from './HeaderHamburger'

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
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f0f0f] z-[60] flex items-center justify-between px-4 sm:px-4 shadow-sm">
      {/* Left: Hamburger & Logo */}
      <div className="flex items-center gap-4">
        <HeaderHamburger />
        <HeaderLogo />
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-2xl px-4 hidden sm:block ml-10">
        <HeaderSearchInput />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link 
          href={createLink}
          className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-colors"
        >
          <span className="mr-2 text-foreground/70">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          Create
        </Link>
        
        {/* Mobile Create Button (+) */}
        {user && (
          <Link 
            href={createLink}
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent hover:bg-accent/30 transition-colors mr-1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </Link>
        )}

        <HeaderClientMenu user={user} username={username} avatarUrl={avatar_url} />
      </div>
    </header>
  )
}
