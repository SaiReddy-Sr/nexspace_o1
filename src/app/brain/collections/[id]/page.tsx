'use client'

import { useState, useEffect, use } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { BrainNode, BrainCollection } from '@/types/brain'
import NodeCard from '@/components/NodeCard'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const collectionId = resolvedParams.id

  const [collection, setCollection] = useState<BrainCollection | null>(null)
  const [nodes, setNodes] = useState<BrainNode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchData() {
      const { data: collectionData } = await supabase
        .from('second_brain_collections')
        .select('*')
        .eq('id', collectionId)
        .single()
      
      if (collectionData) {
        setCollection(collectionData as BrainCollection)
      }

      const { data: nodesData } = await supabase
        .from('second_brain_nodes')
        .select('*')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false })
      
      if (nodesData) {
        setNodes(nodesData as BrainNode[])
      }

      setIsLoading(false)
    }

    fetchData()
  }, [collectionId, supabase])

  const deleteCollection = async () => {
    if (!confirm('Are you sure you want to delete this collection? Notes inside will not be deleted, but they will be removed from this collection.')) return

    await supabase.from('second_brain_collections').delete().eq('id', collectionId)
    router.push('/brain/collections')
  }

  if (isLoading) {
    return <div className="p-8 text-center text-white/50 animate-pulse">Loading collection...</div>
  }

  if (!collection) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-white mb-4">Collection not found</h1>
        <Link href="/brain/collections" className="text-accent hover:underline">Return to Collections</Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 text-sm font-medium text-white/50 mb-2">
        <Link href="/brain/collections" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Collections
        </Link>
        <span>/</span>
        <span className="text-white">{collection.name}</span>
      </div>

      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold tracking-tight text-white">{collection.name}</h1>
        <button 
          onClick={deleteCollection}
          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          title="Delete Collection"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {nodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#1E1E2E]/30 rounded-2xl border border-white/5 border-dashed">
          <h3 className="text-lg font-medium text-white mb-2">This collection is empty</h3>
          <p className="text-white/50">
            Create new notes and assign them to this collection, or edit existing ones to move them here.
          </p>
        </div>
      )}
    </div>
  )
}
