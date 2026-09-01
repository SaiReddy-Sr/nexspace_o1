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
    <button onClick={handleClick} className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg">
      <Search className="w-6 h-6 mb-1.5" strokeWidth={1.5} />
      <span className="text-[10px] font-normal truncate w-full text-center px-1">Search</span>
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
      <Link href="/login" className="group flex flex-col items-center justify-center w-16 h-14 sm:w-[76px] sm:h-[72px] rounded-xl hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-colors">
        <LogIn className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] mb-1" strokeWidth={2.0} />
        <span className="text-[10px] font-medium">Log in</span>
      </Link>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="group flex flex-col items-center justify-center w-16 h-14 sm:w-[76px] sm:h-[72px] rounded-xl hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-colors"
      >
        <User className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] mb-1" strokeWidth={2.0} />
        <span className="text-[10px] font-medium">Profile</span>
      </button>
      
      {open && (
        <div className="absolute bottom-[calc(100%+0.5rem)] right-0 sm:bottom-0 sm:right-auto sm:left-[calc(100%+0.5rem)] bg-card border border-white/10 rounded-xl shadow-lg p-2 min-w-[140px] z-50 flex flex-col gap-1">
           {username ? (
             <Link href={`/profile/${username}`} onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-foreground hover:bg-foreground/10 rounded-md transition-colors text-left w-full block">
               View Profile
             </Link>
           ) : (
             <Link href="/onboarding" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-accent hover:bg-foreground/10 rounded-md transition-colors text-left w-full block">
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
