'use client'

import { useEffect, useRef } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { useSearch } from '@/lib/SearchContext'
import { UserSearchSuggestions } from './UserSearchSuggestions'

export function MobileSearchBar() {
  const { searchQuery, setSearchQuery, isMobileSearchOpen, setIsMobileSearchOpen } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isMobileSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isMobileSearchOpen])

  if (!isMobileSearchOpen) return null

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] z-[100] sm:hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Top Header */}
      <div className="flex items-center gap-2 p-3 border-b border-white/10">
        <button 
          onClick={() => setIsMobileSearchOpen(false)}
          className="p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="relative flex-1">
          <input 
            ref={inputRef}
            id="mobile-search-input-overlay"
            type="text" 
            placeholder="Search NexSpace..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-white/10 rounded-full py-2.5 px-4 pl-10 text-[16px] text-white placeholder-white/40 focus:outline-none focus:border-accent transition-all shadow-inner"
          />
          <Search className="w-[18px] h-[18px] text-white/70 absolute left-3.5 top-3.5" />
        </div>
      </div>
      
      {/* Suggestions Container */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {searchQuery.trim() && (
          <div className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider mt-4">Users</div>
        )}
        <div className="relative w-full">
          <UserSearchSuggestions 
            query={searchQuery} 
            isFocused={true} 
            onClose={() => setIsMobileSearchOpen(false)} 
          />
        </div>
        {!searchQuery.trim() && (
          <div className="flex flex-col items-center justify-center h-48 text-center text-white/40">
            <Search className="w-8 h-8 mb-3 opacity-50" />
            <p>Type to search for users and projects</p>
          </div>
        )}
      </div>
    </div>
  )
}
