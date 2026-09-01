import { createClient } from '@/lib/supabase/server'
import { SidebarClient } from './SidebarClient'

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

  return <SidebarClient role={role} user={user} />
}
