import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Home, Briefcase, PlusCircle, MessageSquare, Settings } from 'lucide-react'
import { ClientSearchIcon } from './SidebarClientItems'

export default async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let role = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      role = profile.role
    }
  }

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f] border-t border-white/10 sm:top-16 sm:bottom-0 sm:left-0 sm:right-auto sm:w-[72px] sm:h-[calc(100vh-64px)] sm:border-t-0 sm:border-r sm:border-white/10 sm:rounded-none sm:flex sm:flex-col sm:items-center py-2 sm:py-3 px-2 sm:px-0 flex justify-around sm:justify-start gap-1 sm:gap-2 overflow-y-auto">
      
      {/* Main Nav Items */}
      <div className="flex sm:flex-col justify-around sm:justify-start items-center w-full sm:w-full flex-1 gap-0 sm:gap-2">
        
        {/* Home */}
        <Link href="/" className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg mx-1">
          <Home className="w-6 h-6 mb-1.5" strokeWidth={1.5} />
          <span className="text-[10px] font-normal truncate w-full text-center px-1">Home</span>
        </Link>

        {/* Search */}
        <div className="w-full mx-1">
          <ClientSearchIcon />
        </div>

        {/* Requests */}
        <Link href="/requests" className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg mx-1">
          <Briefcase className="w-6 h-6 mb-1.5" strokeWidth={1.5} />
          <span className="text-[10px] font-normal truncate w-full text-center px-1">Requests</span>
        </Link>

        {/* New Project (Developer) or Post Request (Client) */}
        {user && role === 'developer' && (
          <Link href="/dashboard/new-project" className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg mx-1">
            <PlusCircle className="w-6 h-6 mb-1.5" strokeWidth={1.5} />
            <span className="text-[10px] font-normal truncate w-full text-center px-1">New</span>
          </Link>
        )}
        {user && role === 'client' && (
          <Link href="/requests/new" className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg mx-1">
            <PlusCircle className="w-6 h-6 mb-1.5" strokeWidth={1.5} />
            <span className="text-[10px] font-normal truncate w-full text-center px-1">New</span>
          </Link>
        )}

        {/* Messages */}
        {user && (
          <Link href="/dashboard/messages" className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg mx-1">
            <MessageSquare className="w-6 h-6 mb-1.5" strokeWidth={1.5} />
            <span className="text-[10px] font-normal truncate w-full text-center px-1">Messages</span>
          </Link>
        )}

        {/* Spacer on desktop to push settings to bottom */}
        <div className="hidden sm:block flex-1" />

        {/* Settings */}
        <div className="sm:pb-2 w-full mx-1">
          <Link href="/settings" className="group flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg">
            <Settings className="w-6 h-6 mb-1.5" strokeWidth={1.5} />
            <span className="text-[10px] font-normal truncate w-full text-center px-1">Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
