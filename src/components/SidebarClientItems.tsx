'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, User, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function ClientSearchIcon() {
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === '/') {
      const input = document.getElementById('home-search-input')
      if (input) {
        input.focus()
      }
    } else {
      router.push('/?focus=search')
    }
  }

  return (
    <button onClick={handleClick} className="relative group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-accent/10 text-foreground/70 hover:text-accent transition-colors">
      <Search className="w-5 h-5" />
      <div className="absolute bottom-full mb-2 sm:bottom-auto sm:left-full sm:mb-0 sm:ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 hidden sm:block">
        Search
      </div>
    </button>
  )
}

export function ClientProfileMenu({ user, username }: { user: any, username: string | null }) {
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
      <Link href="/login" className="relative group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-accent/10 text-foreground/70 hover:text-accent transition-colors">
        <LogIn className="w-5 h-5" />
        <div className="absolute bottom-full mb-2 sm:bottom-auto sm:left-full sm:mb-0 sm:ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
          Log in / Sign up
        </div>
      </Link>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-accent/10 text-foreground/70 hover:text-accent transition-colors"
      >
        <User className="w-5 h-5" />
        {!open && (
          <div className="absolute bottom-full mb-2 sm:bottom-auto sm:left-full sm:mb-0 sm:ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
            Profile
          </div>
        )}
      </button>
      
      {open && (
        <div className="absolute bottom-[calc(100%+0.5rem)] right-0 sm:bottom-0 sm:right-auto sm:left-[calc(100%+0.5rem)] bg-background border border-border rounded-xl shadow-lg p-2 min-w-[140px] z-50 flex flex-col gap-1">
           {username ? (
             <Link href={`/profile/${username}`} onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-md transition-colors text-left w-full block">
               View Profile
             </Link>
           ) : (
             <Link href="/onboarding" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-accent hover:bg-accent/10 rounded-md transition-colors text-left w-full block">
               Complete Profile
             </Link>
           )}
           <button onClick={handleLogout} className="px-3 py-2 text-sm text-foreground/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors text-left w-full">
             Log out
           </button>
        </div>
      )}
    </div>
  )
}
