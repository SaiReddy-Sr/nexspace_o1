'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData, mediaUrl?: string, mediaType?: 'image' | 'video') {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'developer') {
    // Relying on server-side explicit check before insertion
    throw new Error('Only developers can create projects.')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const techTagsStr = formData.get('tech_tags') as string
  const liveUrl = formData.get('live_url') as string

  if (!title || !liveUrl) {
    return { error: 'Title and Live URL are required.' }
  }

  // Basic URL validation
  try {
    new URL(liveUrl)
  } catch (err) {
    return { error: 'Live URL must be a valid URL (e.g. https://example.com)' }
  }

  const techTags = techTagsStr
    ? techTagsStr.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
    : []

  const { error } = await supabase.from('projects').insert({
    developer_id: user.id,
    title,
    description: description || null,
    tech_tags: techTags,
    live_url: liveUrl,
    media_url: mediaUrl || null,
    media_type: mediaType || 'image',
  })

  if (error) {
    return { error: error.message }
  }

  redirect(`/profile/${profile.username}`)
}
