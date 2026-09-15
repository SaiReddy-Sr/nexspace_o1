'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { toggleTrack } from '@/app/track-actions'

interface TrackButtonProps {
  targetProfileId: string
  initialIsTracking: boolean
  isLoggedIn: boolean
}

export default function TrackButton({ targetProfileId, initialIsTracking, isLoggedIn }: TrackButtonProps) {
  const [isTracking, setIsTracking] = useState(initialIsTracking)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 shadow-sm"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Track
      </Link>
    )
  }

  async function handleToggle() {
    setLoading(true)
    
    // Optimistic update
    setIsTracking(!isTracking)
    
    const result = await toggleTrack(targetProfileId)
    
    if (result.error) {
      // Revert on error
      setIsTracking(isTracking)
      alert(`Failed to track: ${result.error}`)
    } else {
      router.refresh()
    }
    
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-lg border shadow-sm ${
        isTracking
          ? 'bg-accent/20 text-accent border-accent/30 hover:bg-accent/30'
          : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
      } disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {isTracking ? 'Tracking' : 'Track'}
    </button>
  )
}
