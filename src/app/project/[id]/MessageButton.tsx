'use client'

import { useState } from 'react'
import Link from 'next/link'
import { startConversation } from './actions'

interface MessageButtonProps {
  projectId: string
  developerId: string
  isLoggedIn: boolean
  isOwnProject: boolean
}

export default function MessageButton({ projectId, developerId, isLoggedIn, isOwnProject }: MessageButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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
    setMessage('')
    
    const result = await startConversation(projectId, developerId)
    
    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setMessage(result.message || 'Success!')
    }
    
    setLoading(false)
  }

  if (message) {
    return (
      <div className="inline-flex items-center justify-center px-6 py-3 border border-green-200 bg-green-50 text-green-800 text-base font-medium rounded-md w-full sm:w-auto dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {message}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleMessage}
        disabled={loading}
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        {loading ? 'Starting...' : 'Message Developer'}
      </button>
      {error && (
        <span className="text-sm text-red-600 dark:text-red-400 font-medium">
          {error}
        </span>
      )}
    </div>
  )
}
