'use client'

import { useSidebar } from '@/lib/SidebarContext'

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar()
  
  const paddingClass = isExpanded ? 'sm:pl-[72px]' : 'sm:pl-[56px]'

  return (
    <main className={`flex-1 min-w-0 pb-16 sm:pb-0 min-h-[calc(100vh-64px)] flex flex-col w-full max-w-full transition-[padding] duration-300 ease-in-out ${paddingClass}`}>
      {children}
    </main>
  )
}
