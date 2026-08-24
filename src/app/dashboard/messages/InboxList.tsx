'use client'

import { useState } from 'react'
import ChatDrawer from '@/components/ChatDrawer'
import Link from 'next/link'

export interface ConversationItem {
  id: string
  project_id: string | null
  conversation_type: string
  last_message_at: string
  project_title: string | null
  other_user: {
    id: string
    username: string
    avatar_url: string | null
  }
}

interface InboxListProps {
  initialConversations: ConversationItem[]
  currentUserId: string
}

export default function InboxList({ initialConversations, currentUserId }: InboxListProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  function handleBlock(conversationId: string) {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId))
    if (activeConversationId === conversationId) {
      setActiveConversationId(null)
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center shadow-sm">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No messages yet</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
          When you start conversations with developers or clients, your message threads will appear here.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md transition-colors"
        >
          Explore Projects
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 shadow-sm overflow-hidden">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setActiveConversationId(conv.id)}
            className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              {conv.other_user.avatar_url ? (
                <img
                  src={conv.other_user.avatar_url}
                  alt={conv.other_user.username}
                  className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-lg border border-blue-200 dark:border-blue-800 flex-shrink-0">
                  {conv.other_user.username.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Thread Info */}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    @{conv.other_user.username}
                  </span>

                  {/* Conversation Type Badge */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    conv.conversation_type === 'client_to_dev'
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  }`}>
                    {conv.conversation_type === 'client_to_dev' ? 'Client Inquiry' : 'Dev to Dev'}
                  </span>
                </div>

                {/* Project title if available */}
                {conv.project_title && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Project: <span className="font-medium text-gray-700 dark:text-gray-300">{conv.project_title}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Last message timestamp */}
            <div className="text-right flex-shrink-0">
              <span className="text-xs text-gray-400">
                {new Date(conv.last_message_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {activeConversationId && (
        <ChatDrawer
          conversationId={activeConversationId}
          currentUserId={currentUserId}
          onClose={() => setActiveConversationId(null)}
          onBlock={handleBlock}
        />
      )}
    </>
  )
}
