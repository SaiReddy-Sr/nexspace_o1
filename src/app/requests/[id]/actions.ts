'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function expressInterest(problemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'developer') {
    return { error: 'Only developers can express interest' }
  }

  const { error } = await supabase.from('problem_interests').insert({
    problem_id: problemId,
    developer_id: user.id
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Already expressed interest' }
    }
    return { error: error.message }
  }

  revalidatePath(`/requests/${problemId}`)
  return { success: true }
}

export async function startConversationFromProblem(problemId: string, developerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not logged in' }

  // Must be the owner of the problem to start conversation
  const { data: problem } = await supabase.from('problems').select('client_id').eq('id', problemId).single()
  
  if (!problem || problem.client_id !== user.id) {
    return { error: 'Unauthorized. Only the client can start a conversation.' }
  }

  // Check if conversation already exists
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('problem_id', problemId)
    .eq('initiator_id', user.id)
    .eq('recipient_id', developerId)
    .single()

  if (existingConv) {
    return { success: true, conversationId: existingConv.id, currentUserId: user.id }
  }

  // Create new conversation
  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({
      problem_id: problemId,
      initiator_id: user.id,
      recipient_id: developerId,
      conversation_type: 'client_to_dev'
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, conversationId: newConv.id, currentUserId: user.id }
}
