'use client'

import { useSidebar } from '@/lib/SidebarContext'

export function HeaderHamburger() {
  const { isExpanded, toggleSidebar } = useSidebar()

  return (
    <button 
      onClick={toggleSidebar}
      className={`p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white hidden sm:block ${!isExpanded ? '-scale-x-100 bg-white/5' : ''}`}
      aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  )
}
