'use server'

import { createClient } from '@/lib/supabase/server'

export async function toggleSaveToBrain(projectId: string, projectTitle: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if it's already saved
  const { data: existingBookmark } = await supabase
    .from('second_brain_nodes')
    .select('id')
    .eq('reference_project_id', projectId)
    .eq('user_id', user.id)
    .eq('type', 'project_bookmark')
    .single()

  if (existingBookmark) {
    // Remove from brain
    const { error } = await supabase
      .from('second_brain_nodes')
      .delete()
      .eq('id', existingBookmark.id)
    
    if (error) {
      console.error('Error removing from brain:', error)
      return { error: 'Failed to remove from brain' }
    }
    return { action: 'removed' }
  } else {
    // Add to brain
    const { error } = await supabase
      .from('second_brain_nodes')
      .insert({
        user_id: user.id,
        title: projectTitle,
        type: 'project_bookmark',
        reference_project_id: projectId
      })
    
    if (error) {
      console.error('Error saving to brain:', error)
      return { error: 'Failed to save to brain' }
    }
    
    return { action: 'saved' }
  }
}

export async function deleteNode(nodeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('second_brain_nodes')
    .delete()
    .eq('id', nodeId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting node:', error)
    return { error: 'Failed to delete node' }
  }
  
  return { success: true }
}
