'use client'

import { useState } from 'react'
import QuickViewDrawer from './QuickViewDrawer'

interface Project {
  id: string
  title: string
  live_url: string | null
}

export default function QuickViewTrigger({ project }: { project: Project }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!project.live_url) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-6 py-3 border border-border text-sm font-bold rounded-md text-foreground bg-card hover:border-accent hover:text-accent shadow-sm transition-all"
      >
        Quick View App
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {isOpen && (
        <QuickViewDrawer project={project} onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}
