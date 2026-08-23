'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signupDeveloper(email: string, password: string, nextParam?: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const queryParams = new URLSearchParams({ role: 'developer' })
  if (nextParam) queryParams.set('next', nextParam)
  const onboardingUrl = `/onboarding?${queryParams.toString()}`

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { intended_role: 'developer' },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(onboardingUrl)}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}

export async function signupClient(email: string, nextParam?: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const queryParams = new URLSearchParams({ role: 'client' })
  if (nextParam) queryParams.set('next', nextParam)
  const onboardingUrl = `/onboarding?${queryParams.toString()}`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: { intended_role: 'client' },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(onboardingUrl)}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}
