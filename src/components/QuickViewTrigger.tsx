'use client'

interface Project {
  id: string
  title: string
  live_url: string | null
}

export default function QuickViewTrigger({ project }: { project: Project }) {
  if (!project.live_url) return null

  return (
    <a
      href={project.live_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center px-6 py-3 border border-border text-sm font-bold rounded-md text-foreground bg-card hover:border-accent hover:text-accent shadow-sm transition-all"
    >
      Open Live App
      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
