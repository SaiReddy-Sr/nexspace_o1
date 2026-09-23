'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { toggleSaveToBrain } from '@/app/brain/actions'
import { createBrowserClient } from '@supabase/ssr'

export default function SaveToBrainButton({ 
  projectId, 
  projectTitle,
  isLoggedIn 
}: { 
  projectId: string;
  projectTitle: string;
  isLoggedIn: boolean 
}) {
  const [isSaved, setIsSaved] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      setIsInitializing(false)
      return
    }

    const checkSavedState = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsInitializing(false)
        return
      }

      const { data } = await supabase
        .from('second_brain_nodes')
        .select('id')
        .eq('reference_project_id', projectId)
        .eq('user_id', user.id)
        .eq('type', 'project_bookmark')
        .single()
      
      setIsSaved(!!data)
      setIsInitializing(false)
    }
    
    checkSavedState()
  }, [projectId, isLoggedIn])

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      alert('Please log in to save to your Second Brain')
      return
    }

    if (isPending) return

    setIsPending(true)
    
    // Optimistic UI update
    setIsSaved(prev => !prev)

    const result = await toggleSaveToBrain(projectId, projectTitle)

    if (result.error) {
      // Revert on error
      setIsSaved(prev => !prev)
      console.error(result.error)
    }

    setIsPending(false)
  }

  return (
    <button
      onClick={handleSave}
      disabled={isPending || isInitializing}
      className={`group flex items-center justify-center p-2 rounded-full transition-all duration-300
        ${isSaved 
          ? 'bg-purple-500/10 text-purple-400' 
          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/80'
        }
        ${(isPending || isInitializing) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
      `}
      title={isSaved ? "Remove from Brain" : "Save to Brain"}
    >
      <Bookmark 
        className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${isSaved ? 'fill-current scale-110' : ''}`} 
      />
    </button>
  )
}
