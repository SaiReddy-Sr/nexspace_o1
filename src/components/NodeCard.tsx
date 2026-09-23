'use client'

import Link from 'next/link'
import { FileText, Code2, Bookmark, ExternalLink, Trash2, Edit2 } from 'lucide-react'
import { BrainNode } from '@/types/brain'
import { deleteNode } from '@/app/brain/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NodeCard({ node }: { node: BrainNode }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const getIcon = () => {
    switch (node.type) {
      case 'note': return <FileText className="w-5 h-5 text-blue-400" />
      case 'snippet': return <Code2 className="w-5 h-5 text-green-400" />
      case 'project_bookmark': return <Bookmark className="w-5 h-5 text-purple-400" />
      default: return <FileText className="w-5 h-5 text-white/50" />
    }
  }

  const getTypeLabel = () => {
    switch (node.type) {
      case 'note': return 'Note'
      case 'snippet': return 'Snippet'
      case 'project_bookmark': return 'Bookmark'
      default: return 'Item'
    }
  }

  return (
    <div className="bg-[#1E1E2E] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all flex flex-col h-full relative group">
      <Link href={`/brain/node/${node.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View node {node.title}</span>
      </Link>
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{getTypeLabel()}</span>
        </div>
        {node.type === 'project_bookmark' && node.reference_project_id && (
          <Link 
            href={`/project/${node.reference_project_id}`} 
            className="text-white/40 hover:text-white relative z-20 transition-colors"
            title="View original project"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{node.title}</h3>
      
      {node.content && (
        <p className="text-sm text-white/70 line-clamp-3 mb-4 flex-grow">
          {node.type === 'snippet' ? 'Code snippet...' : node.content}
        </p>
      )}

      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/40">
          {new Date(node.created_at).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2 relative z-20">
          <Link 
            href={`/brain/edit/${node.id}`}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button 
            onClick={async (e) => {
              e.preventDefault();
              if (confirm('Are you sure you want to delete this?')) {
                setIsDeleting(true)
                await deleteNode(node.id)
                router.refresh()
              }
            }}
            disabled={isDeleting}
            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
