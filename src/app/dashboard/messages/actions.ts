'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const trimmedContent = content.trim()
  if (!trimmedContent) {
    return { error: 'Message content cannot be empty' }
  }

  // 1. Fetch conversation to find participants
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('initiator_id, recipient_id')
    .eq('id', conversationId)
    .single()

  if (convError || !conversation) {
    return { error: 'Conversation not found' }
  }

  const { initiator_id, recipient_id } = conversation
  if (user.id !== initiator_id && user.id !== recipient_id) {
    return { error: 'You are not a participant in this conversation' }
  }

  const otherParticipantId = user.id === initiator_id ? recipient_id : initiator_id

  // 2. Check for an existing block between the two participants (either direction)
  const { data: block, error: blockError } = await supabase
    .from('blocks')
    .select('id')
    .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherParticipantId}),and(blocker_id.eq.${otherParticipantId},blocked_id.eq.${user.id})`)
    .maybeSingle()

  if (blockError) {
    console.error('Error checking block status:', blockError)
  }

  if (block) {
    return { error: 'Messaging is disabled because one of the users has been blocked.' }
  }

  // 3. Insert the message
  const { error: insertError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmedContent,
    })

  if (insertError) {
    return { error: insertError.message }
  }

  return { success: true }
}

export async function blockUser(conversationId: string, blockedId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  if (user.id === blockedId) {
    return { error: 'Cannot block yourself' }
  }

  const { error: insertError } = await supabase
    .from('blocks')
    .insert({
      blocker_id: user.id,
      blocked_id: blockedId,
    })

  if (insertError) {
    if (insertError.code === '23505') {
      return { success: true, message: 'User is already blocked.' }
    }
    return { error: insertError.message }
  }

  revalidatePath('/dashboard/messages')
  return { success: true }
}

export async function reportUser(conversationId: string, reportedUserId: string, reason: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error: insertError } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      conversation_id: conversationId,
      reason: reason.trim() || null,
    })

  if (insertError) {
    return { error: insertError.message }
  }

  return { success: true }
}
