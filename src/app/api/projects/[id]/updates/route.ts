import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const projectId = params.id
  
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('developer_id')
    .eq('id', projectId)
    .single()

  if (!project || project.developer_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { title, version, description } = body

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  // Insert update
  const { data: update, error: insertError } = await supabase
    .from('project_updates')
    .insert({
      project_id: projectId,
      developer_id: user.id,
      title,
      version: version || null,
      description: description || null
    })
    .select()
    .single()

  if (insertError || !update) {
    console.error('Error inserting project update:', insertError)
    return NextResponse.json({ error: 'Failed to post update' }, { status: 500 })
  }

  // BONUS: Notify all users tracking this developer!
  const { data: trackers } = await supabase
    .from('profile_syncs')
    .select('syncer_id')
    .eq('synced_profile_id', user.id)

  if (trackers && trackers.length > 0) {
    const notifications = trackers.map(tracker => ({
      user_id: tracker.syncer_id,
      actor_id: user.id,
      type: 'update',
      entity_id: projectId
    }))

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notifError) {
      console.error('Error notifying trackers:', notifError)
    }
  }

  return NextResponse.json({ success: true, data: update })
}
