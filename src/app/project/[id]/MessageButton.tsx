'use client'

import { useState } from 'react'
import Link from 'next/link'
import { startConversation } from './actions'
import ChatDrawer from '@/components/ChatDrawer'

interface MessageButtonProps {
  projectId: string
  developerId: string
  isLoggedIn: boolean
  isOwnProject: boolean
}

export default function MessageButton({ projectId, developerId, isLoggedIn, isOwnProject }: MessageButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeConversation, setActiveConversation] = useState<{
    conversationId: string
    currentUserId: string
  } | null>(null)

  if (isOwnProject) {
    return null
  }

  if (!isLoggedIn) {
    return (
      <Link
        href={`/signup?next=${encodeURIComponent(`/project/${projectId}`)}`}
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors w-full sm:w-auto"
      >
        Message Developer
      </Link>
    )
  }

  async function handleMessage() {
    setLoading(true)
    setError('')
    
    const result = await startConversation(projectId, developerId)
    
    if (result.error) {
      setError(result.error)
    } else if (result.success && result.conversationId && result.currentUserId) {
      setActiveConversation({
        conversationId: result.conversationId,
        currentUserId: result.currentUserId,
      })
    }
    
    setLoading(false)
  }

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <button
          onClick={handleMessage}
          disabled={loading}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {loading ? 'Starting...' : activeConversation ? 'Open Chat' : 'Message Developer'}
        </button>
        {error && (
          <span className="text-sm text-red-600 dark:text-red-400 font-medium">
            {error}
          </span>
        )}
      </div>

      {activeConversation && (
        <ChatDrawer
          conversationId={activeConversation.conversationId}
          currentUserId={activeConversation.currentUserId}
          onClose={() => setActiveConversation(null)}
        />
      )}
    </>
  )
}
