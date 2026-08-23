'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signupDeveloper(email: string, password: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/onboarding?role=developer')}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}

export async function signupClient(email: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/onboarding?role=client')}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}
