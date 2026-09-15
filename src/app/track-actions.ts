'use server'

import { createClient } from '@/lib/supabase/server'

export async function toggleTrack(targetProfileId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Cannot track oneself
  if (user.id === targetProfileId) {
    return { error: 'Cannot track your own profile' }
  }

  // Check if track exists
  const { data: existingSync } = await supabase
    .from('profile_syncs')
    .select('id')
    .eq('synced_profile_id', targetProfileId)
    .eq('syncer_id', user.id)
    .single()

  if (existingSync) {
    // Un-track
    const { error } = await supabase
      .from('profile_syncs')
      .delete()
      .eq('id', existingSync.id)
    
    if (error) {
      console.error('Error removing track:', error)
      return { error: error.message || 'Failed to remove track' }
    }
    return { success: true, action: 'removed' }
  } else {
    // Track
    const { error } = await supabase
      .from('profile_syncs')
      .insert({
        synced_profile_id: targetProfileId,
        syncer_id: user.id
      })
    
    if (error) {
      console.error('Error creating track:', error)
      return { error: error.message || 'Failed to track' }
    }

    // Insert Notification
    await supabase.from('notifications').insert({
      user_id: targetProfileId,
      actor_id: user.id,
      type: 'track',
      entity_id: user.id // using syncer id as entity just to have a reference if needed
    })

    return { success: true, action: 'added' }
  }
}
