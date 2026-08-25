'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProblemCard from './ProblemCard'

interface ProblemFeedProps {
  initialProblems: any[]
}

export default function ProblemFeed({ initialProblems }: ProblemFeedProps) {
  const [problems, setProblems] = useState<any[]>(initialProblems)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialProblems.length === 10)
  
  const observerTarget = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    const from = page * 10
    const to = from + 9

    const { data, error } = await supabase
      .from('problems')
      .select(`
        *,
        profiles:client_id (
          username,
          avatar_url
        )
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching problems:', error.message)
      setLoading(false)
      return
    }

    if (data && data.length > 0) {
      setProblems((prev) => {
        const existingIds = new Set(prev.map(p => p.id))
        const newItems = data.filter(p => !existingIds.has(p.id))
        return [...prev, ...newItems]
      })
      setPage((p) => p + 1)
      if (data.length < 10) {
        setHasMore(false)
      }
    } else {
      setHasMore(false)
    }

    setLoading(false)
  }, [page, loading, hasMore, supabase])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [loadMore, hasMore, loading])

  if (problems.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No requests yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Check back soon for new opportunities.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </div>

      <div ref={observerTarget} className="mt-8 flex justify-center py-4">
        {loading && (
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading more...</span>
          </div>
        )}
        {!hasMore && problems.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            You've reached the end
          </div>
        )}
      </div>
    </div>
  )
}
