import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Home, Briefcase, PlusCircle, MessageSquare } from 'lucide-react'
import { ClientSearchIcon, ClientProfileMenu } from './SidebarClientItems'

export default async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let username = null
  let role = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      username = profile.username
      role = profile.role
    }
  }

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border sm:top-0 sm:right-auto sm:w-16 sm:h-screen sm:border-t-0 sm:border-r sm:flex sm:flex-col sm:items-center py-2 sm:py-6 px-4 sm:px-0 flex justify-around sm:justify-start sm:gap-6">
      
      {/* Top section: Logo (desktop only) */}
      <Link href="/" className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white font-black hover:bg-accent-hover transition-colors shadow-sm group relative">
        N
        <div className="absolute left-full ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
          nexspace
        </div>
      </Link>

      {/* Main Nav Items */}
      <div className="flex sm:flex-col justify-around sm:justify-start items-center w-full sm:w-auto gap-1 sm:gap-4 flex-1">
        
        {/* Home */}
        <Link href="/" className="relative group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-accent/10 text-foreground/70 hover:text-accent transition-colors">
          <Home className="w-5 h-5" />
          <div className="absolute bottom-full mb-2 sm:bottom-auto sm:left-full sm:mb-0 sm:ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
            Home
          </div>
        </Link>

        {/* Search */}
        <ClientSearchIcon />

        {/* Requests */}
        <Link href="/requests" className="relative group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-accent/10 text-foreground/70 hover:text-accent transition-colors">
          <Briefcase className="w-5 h-5" />
          <div className="absolute bottom-full mb-2 sm:bottom-auto sm:left-full sm:mb-0 sm:ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
            Requests
          </div>
        </Link>

        {/* New Project (Developer) or Post Request (Client) */}
        {user && role === 'developer' && (
          <Link href="/dashboard/new-project" className="relative group flex items-center justify-center w-10 h-10 rounded-xl text-accent hover:bg-accent/10 transition-colors">
            <PlusCircle className="w-6 h-6" />
            <div className="absolute bottom-full mb-2 sm:bottom-auto sm:left-full sm:mb-0 sm:ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
              New Project
            </div>
          </Link>
        )}
        {user && role === 'client' && (
          <Link href="/requests/new" className="relative group flex items-center justify-center w-10 h-10 rounded-xl text-accent hover:bg-accent/10 transition-colors">
            <PlusCircle className="w-6 h-6" />
            <div className="absolute bottom-full mb-2 sm:bottom-auto sm:left-full sm:mb-0 sm:ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
              Post Request
            </div>
          </Link>
        )}

        {/* Messages */}
        {user && (
          <Link href="/dashboard/messages" className="relative group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-accent/10 text-foreground/70 hover:text-accent transition-colors">
            <MessageSquare className="w-5 h-5" />
            <div className="absolute bottom-full mb-2 sm:bottom-auto sm:left-full sm:mb-0 sm:ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
              Messages
            </div>
          </Link>
        )}

        {/* Spacer on desktop to push profile to bottom */}
        <div className="hidden sm:block flex-1" />

        {/* Profile */}
        <ClientProfileMenu user={user} username={username} />
      </div>
    </aside>
  )
}
