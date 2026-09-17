import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

export const getTopRankedProjects = unstable_cache(
  async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
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
      .limit(10)

    if (error) {
      console.error('Error fetching top ranked projects:', error)
      return []
    }

    return data
  },
  ['top-ranked-projects'],
  { revalidate: 60, tags: ['projects'] }
)
