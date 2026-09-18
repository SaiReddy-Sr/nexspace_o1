'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'



export async function loginWithOtp(email: string): Promise<{ error?: string, success?: boolean }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Ensure login doesn't accidentally sign up users
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function verifyOtp(email: string, token: string): Promise<{ error?: string }> {
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

  redirect('/onboarding')
}
