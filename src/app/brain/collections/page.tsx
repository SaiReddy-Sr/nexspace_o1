'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Folder, Plus } from 'lucide-react'
import Link from 'next/link'
import { BrainCollection } from '@/types/brain'

export default function CollectionsPage() {
  const [collections, setCollections] = useState<BrainCollection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchCollections() {
      const { data, error } = await supabase
        .from('second_brain_collections')
        .select('*')
        .order('name', { ascending: true })
      
      if (!error && data) {
        setCollections(data as BrainCollection[])
      }
      setIsLoading(false)
    }

    fetchCollections()
  }, [supabase])

  const createCollection = async () => {
    const name = prompt('Enter collection name:')
    if (!name) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('second_brain_collections')
      .insert({ name, user_id: user.id })
      .select()
      .single()

    if (!error && data) {
      setCollections([...collections, data as BrainCollection].sort((a, b) => a.name.localeCompare(b.name)))
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Collections</h1>
          <p className="text-white/60 mt-1">Organize your saved notes and bookmarks into folders.</p>
        </div>
        <button 
          onClick={createCollection}
          className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Collection
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1E1E2E]/50 border border-white/5 rounded-xl p-4 h-32 animate-pulse"></div>
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link 
              key={collection.id} 
              href={`/brain/collections/${collection.id}`}
              className="bg-[#1E1E2E] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all flex items-center gap-4 group"
            >
              <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                <Folder className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors">{collection.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#1E1E2E]/30 rounded-2xl border border-white/5 border-dashed">
          <h3 className="text-lg font-medium text-white mb-2">No collections yet</h3>
          <p className="text-white/50 mb-6 max-w-sm mx-auto">
            Create a collection to start organizing your saved workspace.
          </p>
          <button 
            onClick={createCollection}
            className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Create your first collection
          </button>
        </div>
      )}
    </div>
  )
}
