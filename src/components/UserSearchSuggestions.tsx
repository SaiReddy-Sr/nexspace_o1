'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from 'lucide-react'

interface Profile {
  id: string
  username: string
  avatar_url: string | null
}

interface UserSearchSuggestionsProps {
  query: string
  isFocused: boolean
  onClose: () => void
}

export function UserSearchSuggestions({ query, isFocused, onClose }: UserSearchSuggestionsProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!isFocused || query.trim().length < 1) {
      setUsers([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query.trim()}%`)
        .limit(5)
      
      if (!error && data) {
        setUsers(data)
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, isFocused, supabase])

  if (!isFocused || query.trim().length < 1) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-[#121212] border border-white/10 rounded-xl shadow-xl z-[100] overflow-hidden max-h-80">
      {loading && users.length === 0 ? (
        <div className="p-4 text-center text-sm text-foreground/50">Searching users...</div>
      ) : users.length > 0 ? (
        <div className="flex flex-col py-2">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              onClick={onClose}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur from closing before click registers
              className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white/50" />
                )}
              </div>
              <span className="text-[15px] font-medium text-white truncate">{user.username}</span>
            </Link>
          ))}
        </div>
      ) : !loading ? (
        <div className="p-4 text-center text-sm text-foreground/50">No users found</div>
      ) : null}
    </div>
  )
}
