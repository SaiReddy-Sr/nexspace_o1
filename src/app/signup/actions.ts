'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { getURL } from '@/utils/url'



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

  // Clean the token of any whitespace or non-numeric characters
  const cleanToken = token.replace(/\D/g, '')

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: cleanToken,
    type: 'email',
  })

  if (error) {
    return { error: error.message }
  }

  const queryParams = new URLSearchParams({ role })
  if (nextParam) queryParams.set('next', nextParam)
  const onboardingUrl = `/onboarding?${queryParams.toString()}`

  redirect(onboardingUrl)
}
