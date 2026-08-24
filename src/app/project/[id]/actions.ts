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

  // Check if conversation already exists between initiator and recipient for this project
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('project_id', projectId)
    .or(`and(initiator_id.eq.${user.id},recipient_id.eq.${developerId}),and(initiator_id.eq.${developerId},recipient_id.eq.${user.id})`)
    .maybeSingle()

  if (existingConv) {
    return { success: true, conversationId: existingConv.id, currentUserId: user.id }
  }

  // We rely on the unique constraint (project_id, initiator_id, recipient_id)
  // to avoid duplicates. We try inserting first.
  const { data: newConv, error: insertError } = await supabase
    .from('conversations')
    .insert({
      project_id: projectId,
      initiator_id: user.id,
      recipient_id: developerId,
      conversation_type: conversationType,
    })
    .select('id')
    .single()

  if (insertError) {
    // 23505 is the PostgreSQL unique_violation error code.
    if (insertError.code === '23505') {
      const { data: fetchedConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('project_id', projectId)
        .or(`and(initiator_id.eq.${user.id},recipient_id.eq.${developerId}),and(initiator_id.eq.${developerId},recipient_id.eq.${user.id})`)
        .single()
      if (fetchedConv) {
        return { success: true, conversationId: fetchedConv.id, currentUserId: user.id }
      }
    }
    return { error: insertError.message }
  }

  revalidatePath(`/project/${projectId}`)
  return { success: true, conversationId: newConv.id, currentUserId: user.id }
}
