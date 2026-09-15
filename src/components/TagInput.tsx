'use client'

import { useState, KeyboardEvent } from 'react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagInput({ tags, onChange, placeholder = "Add a tag..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTag = inputValue.trim().replace(/^,+|,+$/g, '')
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      setInputValue('')
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-background border border-border rounded-xl focus-within:border-accent focus-within:ring-1 focus-within:ring-accent shadow-sm transition-all min-h-[52px]">
      {tags.map((tag, index) => (
        <span 
          key={index}
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-accent/10 text-accent border border-accent/20 uppercase tracking-wider"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="ml-1.5 hover:text-white hover:bg-accent rounded-full transition-colors focus:outline-none p-0.5"
            aria-label={`Remove ${tag}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[150px] bg-transparent outline-none text-sm text-foreground placeholder-foreground/40 font-mono px-2 py-1"
        placeholder={tags.length === 0 ? placeholder : "Type and press Enter..."}
      />
    </div>
  )
}
