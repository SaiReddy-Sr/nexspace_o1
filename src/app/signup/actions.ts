'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { getURL } from '@/utils/url'

export async function signupWithPassword(email: string, password: string, role: 'developer' | 'client', nextParam?: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const queryParams = new URLSearchParams({ role })
  if (nextParam) queryParams.set('next', nextParam)
  const onboardingUrl = `/onboarding?${queryParams.toString()}`

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { intended_role: role },
      emailRedirectTo: `${getURL()}auth/callback?next=${encodeURIComponent(onboardingUrl)}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}

export async function signupWithOtp(email: string, role: 'developer' | 'client'): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: { intended_role: role },
      shouldCreateUser: true,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}

import { redirect } from 'next/navigation'

export async function verifyOtp(email: string, token: string, role: 'developer' | 'client', nextParam?: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email', // Note: for signInWithOtp, the type is usually 'email' or 'magiclink' depending on supabase version, but 'email' is standard for 6-digit OTP.
  })

  if (error) {
    return { error: error.message }
  }

  const queryParams = new URLSearchParams({ role })
  if (nextParam) queryParams.set('next', nextParam)
  const onboardingUrl = `/onboarding?${queryParams.toString()}`

  redirect(onboardingUrl)
}
