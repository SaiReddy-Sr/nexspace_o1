'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, Save, Code2, FileText, Tag as TagIcon, X } from 'lucide-react'
import Link from 'next/link'

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // Next 15 `params` is a Promise, need to unwrap via `use()`
  const resolvedParams = use(params)
  const nodeId = resolvedParams.id

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'note' | 'snippet'>('note')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadNode() {
      const { data: node, error } = await supabase
        .from('second_brain_nodes')
        .select('*')
        .eq('id', nodeId)
        .single()
      
      if (node && !error) {
        setTitle(node.title)
        setContent(node.content || '')
        setType(node.type as 'note' | 'snippet')
      }

      // Load tags
      const { data: nodeTags } = await supabase
        .from('second_brain_node_tags')
        .select('second_brain_tags(name)')
        .eq('node_id', nodeId)
      
      if (nodeTags) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loadedTags = nodeTags.map((t: any) => t.second_brain_tags?.name).filter(Boolean)
        setTags(loadedTags)
      }

      setIsLoading(false)
    }

    loadNode()
  }, [nodeId, supabase])

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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('You must be logged in')
      setIsSaving(false)
      return
    }

    // 1. Update Node
    const { error: nodeError } = await supabase
      .from('second_brain_nodes')
      .update({
        title,
        content,
        type,
        updated_at: new Date().toISOString()
      })
      .eq('id', nodeId)
      .eq('user_id', user.id)

    if (nodeError) {
      console.error('Error saving node:', nodeError)
      alert('Failed to save note')
      setIsSaving(false)
      return
    }

    // 2. Delete existing node tags
    await supabase.from('second_brain_node_tags').delete().eq('node_id', nodeId)

    // 3. Re-insert Tags (if any)
    if (tags.length > 0) {
      for (const tagName of tags) {
        let tagId
        const { data: existingTag } = await supabase
          .from('second_brain_tags')
          .select('id')
          .eq('name', tagName)
          .eq('user_id', user.id)
          .single()

        if (existingTag) {
          tagId = existingTag.id
        } else {
          const { data: newTag } = await supabase
            .from('second_brain_tags')
            .insert({ name: tagName, user_id: user.id })
            .select('id')
            .single()
          if (newTag) tagId = newTag.id
        }

        if (tagId) {
          await supabase
            .from('second_brain_node_tags')
            .insert({
              node_id: nodeId,
              tag_id: tagId
            })
        }
      }
    }

    router.push('/brain')
    router.refresh()
  }

  if (isLoading) {
    return <div className="p-8 text-center text-white/50 animate-pulse">Loading node...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Link href="/brain" className="text-white/50 hover:text-white inline-flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Brain
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
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder={type === 'note' ? "Note Title" : "Snippet Title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-4xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 border-none px-0"
        />

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
            placeholder={type === 'note' ? "Start typing your note here (Markdown supported)..." : "Paste your code snippet here..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full min-h-[400px] bg-[#1E1E2E]/50 border border-white/10 rounded-2xl p-6 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 resize-y transition-all ${type === 'snippet' ? 'font-mono text-sm leading-relaxed' : 'text-base leading-relaxed'}`}
          />
        </div>
      </div>
    </div>
  )
}
