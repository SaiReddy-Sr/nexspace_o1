'use client'

import { useState } from 'react'
import { expressInterest } from './actions'

export default function InterestButton({ problemId, hasExpressedInterest }: { problemId: string, hasExpressedInterest: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isInterested, setIsInterested] = useState(hasExpressedInterest)

  async function handleInterest() {
    setLoading(true)
    setError('')
    
    const result = await expressInterest(problemId)
    
    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setIsInterested(true)
    }
    
    setLoading(false)
  }

  return (
    <div className="mt-8 flex flex-col items-start gap-2 border-t border-gray-200 dark:border-gray-800 pt-8">
      {isInterested ? (
        <button
          disabled
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 cursor-not-allowed w-full sm:w-auto"
        >
          Interest sent
        </button>
      ) : (
        <button
          onClick={handleInterest}
          disabled={loading}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {loading ? 'Sending...' : "I'm Interested"}
        </button>
      )}
      {error && (
        <span className="text-sm text-red-600 dark:text-red-400 font-medium">
          {error}
        </span>
      )}
    </div>
  )
}
