'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveFeaturedOrder(projectIds: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Unauthorized')

  if (projectIds.length === 0) {
    const { error } = await supabase
      .from('projects')
      .update({ featured: false, featured_position: null })
      .eq('featured', true)
    if (error) throw error
  } else {
    const { error: unfeatureError } = await supabase
      .from('projects')
      .update({ featured: false, featured_position: null })
      .eq('featured', true)
      .not('id', 'in', `(${projectIds.join(',')})`)
    if (unfeatureError) throw unfeatureError

    for (let i = 0; i < projectIds.length; i++) {
      const { error } = await supabase
        .from('projects')
        .update({ featured: true, featured_position: i })
        .eq('id', projectIds[i])
      if (error) throw error
    }
  }

  revalidatePath('/')
  revalidatePath('/admin/featured')
}
