'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function checkUsernameAvailability(username: string) {
  if (!username) return true
  const supabase = await createClient()
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('username', username.toLowerCase())

  return count === 0
}

export async function createProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  const username = formData.get('username') as string
  const full_name = formData.get('full_name') as string
  const bio = formData.get('bio') as string
  const role = formData.get('role') as string // 'developer' or 'client'
  const avatar_url = formData.get('avatar_url') as string
  const banner_url = formData.get('banner_url') as string

  // Server-side validation
  if (!username) {
    return { error: 'Username is required' }
  }

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    role,
    username,
    full_name: full_name || null,
    bio: bio || null,
    avatar_url: avatar_url || null,
    banner_url: banner_url || null,
  })

  if (error) {
    if (error.code === '23505') { // unique violation
      return { error: 'Username is already taken' }
    }
    return { error: error.message }
  }

  const nextParam = formData.get('next') as string

  if (nextParam) {
    redirect(nextParam)
  }

  redirect(`/profile/${username}`)
}
