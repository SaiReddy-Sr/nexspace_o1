'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, Save, Code2, FileText, Tag as TagIcon, X, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { createNode } from '@/app/brain/actions'
import { BrainCollection } from '@/types/brain'

export default function NewNotePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'note' | 'snippet'>('note')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [collections, setCollections] = useState<BrainCollection[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadCollections() {
      const { data } = await supabase
        .from('second_brain_collections')
        .select('*')
        .order('name', { ascending: true })
      if (data) setCollections(data as BrainCollection[])
    }
    loadCollections()
  }, [supabase])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required')
      return
    }

    setIsSaving(true)
    const result = await createNode({
      title,
      content,
      type,
      tags,
      collectionId: selectedCollectionId
    })

    if (result.error) {
      alert(result.error)
      setIsSaving(false)
      return
    }

    // revalidatePath already called in server action — just navigate back
    router.push('/brain')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Link href="/brain" className="text-white/50 hover:text-white inline-flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#1E1E2E] rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setType('note')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${type === 'note' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
            >
              <FileText className="w-4 h-4" />
              Note
            </button>
            <button
              onClick={() => setType('snippet')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${type === 'snippet' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
            >
              <Code2 className="w-4 h-4" />
              Snippet
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-white text-black hover:bg-white/90 px-5 py-2 rounded-xl font-medium inline-flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder={type === 'note' ? 'Note Title' : 'Snippet Title'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-4xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 border-none px-0"
        />

        {/* Collection Picker */}
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-white/40 flex-shrink-0" />
          <select
            value={selectedCollectionId ?? ''}
            onChange={(e) => setSelectedCollectionId(e.target.value || null)}
            className="bg-[#1E1E2E] border border-white/10 text-sm text-white/70 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent cursor-pointer"
          >
            <option value="">No collection</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
          {collections.length === 0 && (
            <Link href="/brain/collections" className="text-xs text-white/40 hover:text-accent transition-colors">
              Create a collection →
            </Link>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <TagIcon className="w-4 h-4 text-white/40" />
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1E1E2E] border border-white/10 text-xs font-medium text-white/80">
              {tag}
              <button onClick={() => removeTag(tag)} className="text-white/40 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag and press Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="bg-transparent text-sm text-white placeholder-white/40 focus:outline-none border-none min-w-[150px]"
          />
        </div>

        <div className="mt-8">
          <textarea
            placeholder={type === 'note' ? 'Start typing your note here (Markdown supported)...' : 'Paste your code snippet here...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full min-h-[400px] bg-[#1E1E2E]/50 border border-white/10 rounded-2xl p-6 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 resize-y transition-all ${type === 'snippet' ? 'font-mono text-sm leading-relaxed' : 'text-base leading-relaxed'}`}
          />
        </div>
      </div>
    </div>
  )
}
