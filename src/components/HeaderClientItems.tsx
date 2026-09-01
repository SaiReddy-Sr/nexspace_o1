'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, User, LogIn, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSearch } from '@/lib/SearchContext'

export function HeaderSearchInput() {
  const { searchQuery, setSearchQuery } = useSearch()

  return (
    <div className="flex w-full max-w-[600px] mx-auto hidden sm:flex">
      <div className="relative flex-1">
        <input 
          id="global-search-input"
          type="text" 
          placeholder="Search NexSpace..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#121212] border border-white/10 rounded-l-full py-2 px-4 text-[15px] text-white placeholder-white/40 focus:outline-none focus:border-accent focus:ml-0 transition-all shadow-inner"
        />
      </div>
      <button className="bg-white/10 border border-l-0 border-white/10 rounded-r-full px-5 flex items-center justify-center hover:bg-white/20 transition-colors">
        <Search className="w-[18px] h-[18px] text-white/70" />
      </button>
    </div>
  )
}

export function HeaderClientMenu({ user, username, avatarUrl }: { user: any, username: string | null, avatarUrl: string | null }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  async function handleLogout() {
    await supabase.auth.signOut()
    setOpen(false)
    router.refresh()
  }

  if (!user) {
    return (
      <Link href="/login" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-colors border border-border">
        <LogIn className="w-[18px] h-[18px]" strokeWidth={2.0} />
        <span className="sr-only">Log in</span>
      </Link>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-border overflow-hidden border border-border hover:opacity-80 transition-opacity"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={username || 'Profile'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-foreground/10 text-foreground/70">
            {username ? username.charAt(0).toUpperCase() : <User className="w-[18px] h-[18px]" />}
          </div>
        )}
      </button>
      
      {open && (
        <div className="absolute top-[calc(100%+0.5rem)] right-0 bg-card border border-white/10 rounded-xl shadow-lg p-2 min-w-[160px] z-50 flex flex-col gap-1">
           {username ? (
             <Link href={`/profile/${username}`} onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-foreground hover:bg-foreground/10 rounded-md transition-colors text-left w-full block">
               View Profile
             </Link>
           ) : (
             <Link href="/onboarding" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-accent hover:bg-foreground/10 rounded-md transition-colors text-left w-full block">
               Complete Profile
             </Link>
           )}
           <Link href="/settings" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-foreground hover:bg-foreground/10 rounded-md transition-colors text-left w-full flex items-center gap-2">
             <Settings className="w-4 h-4" /> Settings
           </Link>
           <button onClick={handleLogout} className="px-3 py-2 text-sm text-foreground/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors text-left w-full">
             Log out
           </button>
        </div>
      )}
    </div>
  )
}
