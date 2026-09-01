import { createClient } from '@/lib/supabase/server'

export async function getTopRankedProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      vote_count,
      profiles:developer_id (
        username,
        avatar_url
      )
    `)
    .order('vote_count', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching top ranked projects:', error)
    return []
  }

  return data
}
