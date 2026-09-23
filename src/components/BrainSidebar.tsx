'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Folder, Tag, Hash, FileText } from 'lucide-react'

export default function BrainSidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'All Notes', href: '/brain', icon: BookOpen },
    { name: 'Collections', href: '/brain/collections', icon: Folder },
    { name: 'Tags', href: '/brain/tags', icon: Tag },
  ]

  return (
    <div className="w-64 bg-[#111118] border-r border-white/10 h-[calc(100vh-64px)] flex flex-col hidden md:flex sticky top-16">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4 px-2">Second Brain</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-[#1E1E2E] rounded-xl p-4 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <FileText className="w-16 h-16" />
          </div>
          <p className="text-xs text-white/60 relative z-10 leading-relaxed">
            Your Second Brain is private. Only you can see your saved notes, snippets, and bookmarks.
          </p>
        </div>
      </div>
    </div>
  )
}
