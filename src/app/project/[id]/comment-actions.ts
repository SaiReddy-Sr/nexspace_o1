'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(projectId: string, content: string, rating: number | null) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to comment.' }
  }

  if (!content.trim()) {
    return { error: 'Comment content cannot be empty.' }
  }

  const { error } = await supabase
    .from('project_comments')
    .insert({
      project_id: projectId,
      user_id: user.id,
      content: content.trim(),
      rating: rating
    })

  if (error) {
    console.error('Error adding comment:', error)
    return { error: error.message || 'Failed to add comment.' }
  }

  // Fetch project to get developer_id
  const { data: projectData } = await supabase
    .from('projects')
    .select('developer_id')
    .eq('id', projectId)
    .single()

  if (projectData && projectData.developer_id !== user.id) {
    // Insert notification
    await supabase.from('notifications').insert({
      user_id: projectData.developer_id,
      actor_id: user.id,
      type: 'comment',
      entity_id: projectId
    })
  }

  revalidatePath(`/project/${projectId}`)
  return { success: true }
}

export async function deleteComment(commentId: string, projectId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated.' }
  }

  const { error } = await supabase
    .from('project_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id) // RLS also protects this, but good to be explicit

  if (error) {
    console.error('Error deleting comment:', error)
    return { error: 'Failed to delete comment.' }
  }

  revalidatePath(`/project/${projectId}`)
  return { success: true }
}
