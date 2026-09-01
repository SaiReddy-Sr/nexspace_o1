'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const username = formData.get('username') as string
  const role = formData.get('role') as string
  const avatarUrl = formData.get('avatar_url') as string

  if (!username) {
    return { error: 'Username is required' }
  }
  
  if (!role || (role !== 'developer' && role !== 'client')) {
    return { error: 'Valid role is required' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      username, 
      role, 
      avatar_url: avatarUrl || null 
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
