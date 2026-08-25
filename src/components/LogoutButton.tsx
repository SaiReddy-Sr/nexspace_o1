'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
    >
      Log out
    </button>
  )
}
