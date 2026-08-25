'use client'

import { useState } from 'react'
import Link from 'next/link'
import { startConversationFromProblem } from './actions'
import ChatDrawer from '@/components/ChatDrawer'

interface InterestedDeveloper {
  id: string
  developer_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export default function ClientActions({ problemId, interestedDevelopers }: { problemId: string, interestedDevelopers: InterestedDeveloper[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [activeConversation, setActiveConversation] = useState<{
    conversationId: string
    currentUserId: string
  } | null>(null)

  async function handleStartChat(developerId: string) {
    setLoadingId(developerId)
    setError('')
    
    const result = await startConversationFromProblem(problemId, developerId)
    
    if (result.error) {
      setError(result.error)
    } else if (result.success && result.conversationId && result.currentUserId) {
      setActiveConversation({
        conversationId: result.conversationId,
        currentUserId: result.currentUserId,
      })
    }
    
    setLoadingId(null)
  }

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Interested Developers ({interestedDevelopers.length})
      </h3>
      
      {interestedDevelopers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No developers have expressed interest yet. Check back later!
        </p>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-4">
              {error}
            </div>
          )}
          
          {interestedDevelopers.map((interest) => (
            <div key={interest.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <Link
                href={`/profile/${interest.profiles.username}`}
                className="flex items-center space-x-3 group"
              >
                {interest.profiles.avatar_url ? (
                  <img
                    src={interest.profiles.avatar_url}
                    alt={interest.profiles.username}
                    className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {interest.profiles.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-base font-medium text-gray-900 dark:text-white group-hover:underline">
                  @{interest.profiles.username}
                </span>
              </Link>
              
              <button
                onClick={() => handleStartChat(interest.developer_id)}
                disabled={loadingId === interest.developer_id}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
              >
                {loadingId === interest.developer_id ? 'Starting...' : 'Start Conversation'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeConversation && (
        <ChatDrawer
          conversationId={activeConversation.conversationId}
          currentUserId={activeConversation.currentUserId}
          onClose={() => setActiveConversation(null)}
        />
      )}
    </div>
  )
}
