'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp } from 'lucide-react'
import { toggleVote } from '@/app/vote-actions'

interface UpvoteButtonProps {
  projectId: string
  initialVoteCount: number
  initialHasVoted: boolean
  isLoggedIn: boolean
}

export default function UpvoteButton({ projectId, initialVoteCount, initialHasVoted, isLoggedIn }: UpvoteButtonProps) {
  const router = useRouter()
  
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      router.push(`/signup?next=${encodeURIComponent(`/project/${projectId}`)}`)
      return
    }

    if (isLoading) return

    // Optimistic UI
    const previousHasVoted = hasVoted
    const previousVoteCount = voteCount

    setHasVoted(!hasVoted)
    setVoteCount(hasVoted ? Math.max(0, voteCount - 1) : voteCount + 1)
    setIsLoading(true)

    try {
      const result = await toggleVote(projectId)
      if (result.error) {
        // Revert on error
        setHasVoted(previousHasVoted)
        setVoteCount(previousVoteCount)
      }
    } catch (err) {
      // Revert on error
      setHasVoted(previousHasVoted)
      setVoteCount(previousVoteCount)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors relative z-30 ${
        hasVoted
          ? 'bg-accent/10 border-accent/20 text-accent hover:bg-accent/20'
          : 'bg-background/80 border-border text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
      } backdrop-blur-md`}
      title={hasVoted ? 'Remove upvote' : 'Upvote'}
    >
      <ChevronUp className={`w-4 h-4 ${hasVoted ? 'stroke-[3]' : 'stroke-[2.5]'}`} />
      <span className="text-xs font-bold font-mono">
        {voteCount}
      </span>
    </button>
  )
}
