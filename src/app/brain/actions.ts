'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleSaveToBrain(projectId: string, projectTitle: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: existingBookmark } = await supabase
    .from('second_brain_nodes')
    .select('id')
    .eq('reference_project_id', projectId)
    .eq('user_id', user.id)
    .eq('type', 'project_bookmark')
    .single()

  if (existingBookmark) {
    const { error } = await supabase
      .from('second_brain_nodes')
      .delete()
      .eq('id', existingBookmark.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error removing from workspace:', error)
      return { error: 'Failed to remove from workspace' }
    }
    revalidatePath('/brain')
    return { action: 'removed' }
  } else {
    const { error } = await supabase
      .from('second_brain_nodes')
      .insert({
        user_id: user.id,
        title: projectTitle,
        type: 'project_bookmark',
        reference_project_id: projectId
      })

    if (error) {
      console.error('Error saving to workspace:', error)
      return { error: 'Failed to save to workspace' }
    }

    revalidatePath('/brain')
    return { action: 'saved' }
  }
}

export async function createNode(formData: {
  title: string
  content: string
  type: 'note' | 'snippet'
  tags: string[]
  collectionId: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: nodeData, error: nodeError } = await supabase
    .from('second_brain_nodes')
    .insert({
      user_id: user.id,
      title: formData.title,
      content: formData.content,
      type: formData.type,
      collection_id: formData.collectionId || null
    })
    .select()
    .single()

  if (nodeError || !nodeData) {
    console.error('Error creating node:', nodeError)
    return { error: 'Failed to save note' }
  }

  // Insert Tags
  if (formData.tags.length > 0) {
    for (const tagName of formData.tags) {
      let tagId: string | undefined

      const { data: existingTag } = await supabase
        .from('second_brain_tags')
        .select('id')
        .eq('name', tagName)
        .eq('user_id', user.id)
        .single()

      if (existingTag) {
        tagId = existingTag.id
      } else {
        const { data: newTag } = await supabase
          .from('second_brain_tags')
          .insert({ name: tagName, user_id: user.id })
          .select('id')
          .single()
        if (newTag) tagId = newTag.id
      }

      if (tagId) {
        await supabase
          .from('second_brain_node_tags')
          .insert({ node_id: nodeData.id, tag_id: tagId })
      }
    }
  }

  revalidatePath('/brain')
  return { success: true, nodeId: nodeData.id }
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

  revalidatePath('/brain')
  return { success: true }
}
