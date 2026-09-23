'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { BrainNode } from '@/types/brain'
import NodeCard from '@/components/NodeCard'
import Link from 'next/link'
import { Search, Plus, Tag as TagIcon } from 'lucide-react'
import { BrainTag } from '@/types/brain'

export default function BrainDashboard() {
  const [nodes, setNodes] = useState<BrainNode[]>([])
  const [tags, setTags] = useState<BrainTag[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchData() {
      const { data: nodesData, error: nodesError } = await supabase
        .from('second_brain_nodes')
        .select('*')
        .order('created_at', { ascending: false })
      
      const { data: tagsData } = await supabase
        .from('second_brain_tags')
        .select('*')
        .order('name', { ascending: true })
      
      if (!nodesError && nodesData) {
        setNodes(nodesData as BrainNode[])
      }
      if (tagsData) {
        setTags(tagsData as BrainTag[])
      }
      setIsLoading(false)
    }

    fetchData()
  }, [supabase])

  // Currently we just mock the node-tag filtering since we need a join table fetch for real tags,
  // but for the UI polish phase we can add the chips. If a tag is selected we would ideally filter nodes that have that tag.
  // For now, if a tag is selected, we filter on client-side if we had the tags, but we'll leave it as a visual filter.
  // (In a full implementation we would fetch `second_brain_node_tags` too).
  const filteredNodes = nodes.filter(node => 
    (node.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (node.content && node.content.toLowerCase().includes(searchQuery.toLowerCase())))
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Saved Workspace</h1>
          <p className="text-white/60 mt-1">Organize code snippets, technical notes, and bookmarked projects.</p>
        </div>
        <Link href="/brain/new" className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          New Note
        </Link>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/40" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-[#1E1E2E] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all sm:text-sm"
          placeholder="Search your workspace..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Interactive Tag Filter Chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedTag === null 
                ? 'bg-white text-black' 
                : 'bg-[#1E1E2E] text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedTag === tag.id
                  ? 'bg-accent text-black'
                  : 'bg-[#1E1E2E] text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <TagIcon className="w-3 h-3" />
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#1E1E2E]/50 border border-white/5 rounded-xl p-4 h-48 animate-pulse"></div>
          ))}
        </div>
      ) : filteredNodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#1E1E2E]/30 rounded-2xl border border-white/5 border-dashed">
          <h3 className="text-lg font-medium text-white mb-2">It's empty in here!</h3>
          <p className="text-white/50 mb-6 max-w-sm mx-auto">
            Start building your second brain by creating a note or bookmarking a project from the feed.
          </p>
        </div>
      )}
    </div>
  )
}
