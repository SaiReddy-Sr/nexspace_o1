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
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f0f0f] z-[60] flex items-center justify-between px-4 sm:px-4 shadow-sm">
      {/* Left: Hamburger & Logo */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white hidden sm:block">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <Link href="/" className="flex items-center gap-1.5 group">
          <div className="flex items-center justify-center w-7 h-7 text-accent font-black">
            {/* Custom N logo svg approximation based on image */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full"><path d="M4 19L11 5L15 15L20 5" strokeLinejoin="round" strokeLinecap="round"/><circle cx="5" cy="18" r="1.5" fill="currentColor"/><circle cx="11" cy="6" r="1.5" fill="currentColor"/></svg>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block text-foreground">
            NexSpace
          </span>
        </Link>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-2xl px-4 hidden sm:block ml-10">
        <HeaderSearchInput />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <Link 
          href={createLink}
          className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-colors"
        >
          <span className="mr-2 text-foreground/70">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          Create
        </Link>

        <HeaderClientMenu user={user} username={username} avatarUrl={avatar_url} />
      </div>
    </header>
  )
}
