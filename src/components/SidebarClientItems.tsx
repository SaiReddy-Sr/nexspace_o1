'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, User, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function ClientSearchIcon({ isExpanded }: { isExpanded: boolean }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === '/') {
      const input = document.getElementById('global-search-input') || document.getElementById('mobile-search-input')
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => input.focus(), 300)
      }
    } else {
      router.push('/?focus=search')
    }
  }

  return (
    <button onClick={handleClick} className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg">
      <Search className={`w-6 h-6 ${isExpanded ? 'mb-1.5' : ''}`} strokeWidth={1.5} />
      {isExpanded && <span className="text-[10px] font-normal truncate w-full text-center px-1">Search</span>}
    </button>
  )
}

