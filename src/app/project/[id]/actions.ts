'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startConversation(projectId: string, developerId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not logged in' }
  }

  // Get viewer's profile for role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Profile not found' }
  }

  if (user.id === developerId) {
    return { error: 'Cannot message yourself' }
  }

  const conversationType = profile.role === 'client' ? 'client_to_dev' : 'dev_to_dev'

  // We rely on the unique constraint (project_id, initiator_id, recipient_id)
  // to avoid duplicates. We try inserting first.
  const { error: insertError } = await supabase
    .from('conversations')
    .insert({
      project_id: projectId,
      initiator_id: user.id,
      recipient_id: developerId,
      conversation_type: conversationType,
    })

  if (insertError) {
    // 23505 is the PostgreSQL unique_violation error code.
    // If it already exists, we gracefully handle it and just return success.
    if (insertError.code === '23505') {
      return { success: true, message: 'Conversation already exists!' }
    }
    return { error: insertError.message }
  }

  revalidatePath(`/project/${projectId}`)
  return { success: true, message: 'Conversation started! Full messaging is coming in the next update.' }
}
