'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type SidebarContextType = {
  isExpanded: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('nexspace_sidebar_expanded')
    if (saved !== null) {
      setIsExpanded(saved === 'true')
    }
  }, [])

  const toggleSidebar = () => {
    setIsExpanded(prev => {
      const next = !prev
      localStorage.setItem('nexspace_sidebar_expanded', String(next))
      return next
    })
  }

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
