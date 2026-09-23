'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Folder, FileText } from 'lucide-react'

export default function BrainSidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'All Saved', href: '/brain', icon: BookOpen },
    { name: 'Collections', href: '/brain/collections', icon: Folder },
    { name: 'New Note/Snippet', href: '/brain/new', icon: FileText },
  ]

  const isActive = (href: string) =>
    href === '/brain'
      ? pathname === '/brain'
      : pathname.startsWith(href)

  return (
    <>
      {/* ── Mobile: horizontal tab strip pinned below the main header ── */}
      <div className="md:hidden w-full bg-[#111118] border-b border-white/10 px-4 py-2 sticky top-16 z-30">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors flex-shrink-0 ${
                isActive(item.href)
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Desktop: vertical sidebar ── */}
      <div className="hidden md:flex w-64 bg-[#111118] border-r border-white/10 h-[calc(100vh-64px)] flex-col sticky top-16 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4 px-2">
            Saved Workspace
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-[#1E1E2E] rounded-xl p-4 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <FileText className="w-16 h-16" />
            </div>
            <p className="text-xs text-white/60 relative z-10 leading-relaxed">
              Your Saved Workspace is private. Organize code snippets, technical notes, and bookmarked projects.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
