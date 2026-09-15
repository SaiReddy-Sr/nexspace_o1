'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'

const MarkdownViewer = dynamic(() => import('./MarkdownViewer'))

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background shadow-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all flex flex-col">
      {/* Header Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border bg-card/50 px-2 pt-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-4 py-2 text-sm font-bold transition-colors rounded-t-lg ${activeTab === 'write' ? 'bg-background border-t border-l border-r border-border text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
            style={{ marginBottom: activeTab === 'write' ? '-1px' : '0' }}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-bold transition-colors rounded-t-lg ${activeTab === 'preview' ? 'bg-background border-t border-l border-r border-border text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
            style={{ marginBottom: activeTab === 'preview' ? '-1px' : '0' }}
          >
            Preview
          </button>
        </div>
        
        {/* Toolbar */}
        {activeTab === 'write' && (
          <div className="flex items-center gap-1 pb-2 pr-2 flex-wrap">
            <button type="button" onClick={() => insertText('**', '**')} className="flex-shrink-0 p-1.5 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded font-serif font-bold transition-colors w-7 h-7 flex items-center justify-center" title="Bold">
              B
            </button>
            <button type="button" onClick={() => insertText('*', '*')} className="flex-shrink-0 p-1.5 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded font-serif italic transition-colors w-7 h-7 flex items-center justify-center" title="Italic">
              I
            </button>
            <div className="w-px h-4 bg-border mx-1 flex-shrink-0"></div>
            <button type="button" onClick={() => insertText('[', '](url)')} className="flex-shrink-0 p-1.5 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded transition-colors" title="Link">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            </button>
            <button type="button" onClick={() => insertText('```\n', '\n```')} className="flex-shrink-0 p-1.5 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded transition-colors" title="Code Block">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            </button>
            <button type="button" onClick={() => insertText('\nhttps://www.youtube.com/watch?v=...\n')} className="flex-shrink-0 p-1.5 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded transition-colors" title="Video Embed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
          </div>
        )}
      </div>

      {/* Editor / Preview Area */}
      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[350px] p-4 bg-transparent resize-y outline-none text-foreground text-sm font-mono leading-relaxed"
        />
      ) : (
        <div className="min-h-[350px] p-4 bg-transparent overflow-y-auto">
          {value.trim() ? (
            <MarkdownViewer content={value} />
          ) : (
            <p className="text-foreground/40 italic">Nothing to preview...</p>
          )}
        </div>
      )}
    </div>
  )
}
