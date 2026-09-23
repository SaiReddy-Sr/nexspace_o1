'use client'

import Link from 'next/link'
import { Home, Briefcase, PlusCircle, MessageSquare, Settings, BookMarked } from 'lucide-react'
import { ClientSearchIcon } from './SidebarClientItems'
import { NotificationsDrawer } from './NotificationsDrawer'
import { useSidebar } from '@/lib/SidebarContext'

export function SidebarClient({ role, user }: { role: string | null, user: any }) {
  const { isExpanded } = useSidebar()
  
  const widthClass = isExpanded ? 'sm:w-[72px]' : 'sm:w-[56px]'

  return (
    <aside className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f] border-t border-white/10 sm:top-16 sm:bottom-0 sm:left-0 sm:right-auto ${widthClass} sm:h-[calc(100vh-64px)] sm:border-t-0 sm:border-r sm:border-white/10 sm:rounded-none sm:flex sm:flex-col sm:items-center pt-2 pb-6 sm:py-3 px-2 sm:px-0 flex justify-around sm:justify-start gap-1 sm:gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-[width] duration-300 ease-in-out`}>
      
      {/* Main Nav Items */}
      <div className="flex sm:flex-col justify-around sm:justify-start items-center w-full sm:w-full flex-1 gap-0 sm:gap-2">
        
        {/* Home */}
        <Link 
          href="/" 
          className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg mx-1"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        >
          <Home className={`w-6 h-6 ${isExpanded ? 'mb-1.5' : ''}`} strokeWidth={1.5} />
          {isExpanded && <span className="text-[10px] font-normal truncate w-full text-center px-1">Home</span>}
        </Link>

        {/* Requests */}
        <Link href="/requests" className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg mx-1">
          <Briefcase className={`w-6 h-6 ${isExpanded ? 'mb-1.5' : ''}`} strokeWidth={1.5} />
          {isExpanded && <span className="text-[10px] font-normal truncate w-full text-center px-1">Requests</span>}
        </Link>

        {/* Search (Moved to Middle) */}
        <div className="w-full mx-1">
          <ClientSearchIcon isExpanded={isExpanded} />
        </div>

        {/* Notifications (Drawer) */}
        {user && (
          <div className="w-full">
            <NotificationsDrawer isExpanded={isExpanded} />
          </div>
        )}

        {/* Messages */}
        {user && (
          <Link href="/dashboard/messages" className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg mx-1">
            <MessageSquare className={`w-6 h-6 ${isExpanded ? 'mb-1.5' : ''}`} strokeWidth={1.5} />
            {isExpanded && <span className="text-[10px] font-normal truncate w-full text-center px-1">Messages</span>}
          </Link>
        )}

        {/* Saved Workspace */}
        {user && (
          <Link href="/brain" className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg mx-1">
            <BookMarked className={`w-6 h-6 ${isExpanded ? 'mb-1.5' : ''}`} strokeWidth={1.5} />
            {isExpanded && <span className="text-[10px] font-normal truncate w-full text-center px-1">Workspace</span>}
          </Link>
        )}

        {/* Spacer on desktop to push settings to bottom */}
        <div className="hidden sm:block flex-1" />

        {/* Settings */}
        <div className="sm:pb-2 w-full mx-1">
          <Link href="/settings" className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg">
            <Settings className={`w-6 h-6 ${isExpanded ? 'mb-1.5' : ''}`} strokeWidth={1.5} />
            {isExpanded && <span className="text-[10px] font-normal truncate w-full text-center px-1">Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  )
}
