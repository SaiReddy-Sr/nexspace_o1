'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signupWithPassword(email: string, password: string, role: 'developer' | 'client', nextParam?: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const queryParams = new URLSearchParams({ role })
  if (nextParam) queryParams.set('next', nextParam)
  const onboardingUrl = `/onboarding?${queryParams.toString()}`

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { intended_role: role },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(onboardingUrl)}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}

export async function signupWithMagicLink(email: string, role: 'developer' | 'client', nextParam?: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const queryParams = new URLSearchParams({ role })
  if (nextParam) queryParams.set('next', nextParam)
  const onboardingUrl = `/onboarding?${queryParams.toString()}`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: { intended_role: role },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(onboardingUrl)}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}
