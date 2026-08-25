'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createProblem(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'client') {
    throw new Error('Only clients can post requests.')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tagsStr = formData.get('tags') as string

  if (!title) {
    return { error: 'Title is required.' }
  }

  const tags = tagsStr
    ? tagsStr.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
    : []

  const { data, error } = await supabase.from('problems').insert({
    client_id: user.id,
    title,
    description: description || null,
    tags: tags,
  }).select('id').single()

  if (error) {
    return { error: error.message }
  }

  redirect(`/requests/${data.id}`)
}
