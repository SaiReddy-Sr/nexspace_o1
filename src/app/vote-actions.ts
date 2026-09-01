'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleVote(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if vote exists
  const { data: existingVote } = await supabase
    .from('project_votes')
    .select('id')
    .eq('project_id', projectId)
    .eq('voter_id', user.id)
    .single()

  if (existingVote) {
    // Un-vote
    const { error } = await supabase
      .from('project_votes')
      .delete()
      .eq('id', existingVote.id)
    
    if (error) {
      console.error('Error unvoting:', error)
      return { error: 'Failed to remove vote' }
    }
    return { success: true, action: 'removed' }
  } else {
    // Vote
    const { error } = await supabase
      .from('project_votes')
      .insert({
        project_id: projectId,
        voter_id: user.id
      })
    
    if (error) {
      console.error('Error voting:', error)
      return { error: 'Failed to cast vote' }
    }
    return { success: true, action: 'added' }
  }
}
