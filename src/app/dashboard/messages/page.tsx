import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InboxList, { ConversationItem } from './InboxList'

export default async function MessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent('/dashboard/messages')}`)
  }

  // Fetch blocked user IDs for current user
  const { data: blocks } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', user.id)

  const blockedIds = new Set((blocks || []).map((b) => b.blocked_id))

  // Fetch conversations where logged in user is participant
  const { data: rawConversations, error } = await supabase
    .from('conversations')
    .select(`
      id,
      project_id,
      initiator_id,
      recipient_id,
      conversation_type,
      last_message_at,
      projects:project_id ( title ),
      initiator:initiator_id ( id, username, avatar_url ),
      recipient:recipient_id ( id, username, avatar_url )
    `)
    .or(`initiator_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  if (error) {
    console.error('Error loading conversations:', error)
  }

  const conversations: ConversationItem[] = (rawConversations || [])
    .map((c) => {
      const isInitiator = c.initiator_id === user.id
      const otherProfileObj = isInitiator ? c.recipient : c.initiator
      const otherProfile = otherProfileObj as unknown as { id: string; username: string; avatar_url: string | null }
      const projectObj = c.projects as unknown as { title: string } | null

      return {
        id: c.id,
        project_id: c.project_id,
        conversation_type: c.conversation_type,
        last_message_at: c.last_message_at,
        project_title: projectObj?.title || null,
        other_user: {
          id: otherProfile?.id || '',
          username: otherProfile?.username || 'User',
          avatar_url: otherProfile?.avatar_url || null,
        }
      }
    })
    .filter((c) => !blockedIds.has(c.other_user.id))

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950 font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Messages
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your conversations with developers and clients
            </p>
          </div>
        </div>

        <InboxList initialConversations={conversations} currentUserId={user.id} />
      </div>
    </div>
  )
}
