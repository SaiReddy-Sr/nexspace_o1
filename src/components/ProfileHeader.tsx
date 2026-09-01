'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EditProfileModal from './EditProfileModal'
import { Calendar, Link as LinkIcon, MapPin } from 'lucide-react'

interface ProfileHeaderProps {
  profile: any
  isOwner: boolean
}

export default function ProfileHeader({ profile, isOwner }: ProfileHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const router = useRouter()

  const handleSave = () => {
    // Refresh the current route to fetch updated data
    router.refresh()
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="relative mb-12">
      {/* Cover Photo / Header background */}
      <div className="h-32 sm:h-44 w-full bg-[#181825] border-b border-white/5 relative overflow-hidden">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="Profile Banner" className="w-full h-full object-cover" />
        ) : (
          <>
            {/* Subtle dot pattern and gradient */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
          </>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-center sm:items-end justify-between">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 w-full sm:w-auto">
            {/* Avatar */}
            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-background bg-[#1E1E2E] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg relative z-10">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
              ) : (
                <span className="text-white/40 text-5xl font-bold uppercase">
                  {profile.username.charAt(0)}
                </span>
              )}
            </div>
            
            {/* Action buttons (Mobile only: positioned under avatar) */}
            <div className="w-full flex justify-center sm:hidden mt-3">
              {isOwner && (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-5 py-2 rounded-full border border-white/20 bg-[#1E1E2E] hover:bg-white/10 text-sm font-bold text-white transition-colors shadow-sm"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Action buttons (Desktop) */}
          <div className="hidden sm:flex mb-4">
            {isOwner && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-6 py-2.5 rounded-full border border-white/20 bg-[#1E1E2E]/80 hover:bg-white/10 text-sm font-bold text-white transition-colors backdrop-blur-sm shadow-sm"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-4 sm:mt-5 text-center sm:text-left flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
              {profile.full_name || profile.username}
            </h1>
            <span className="inline-flex items-center rounded-md bg-accent/20 px-2 py-0.5 text-[11px] font-mono font-bold text-accent uppercase tracking-wider">
              {profile.role === 'developer' ? 'Dev' : 'Client'}
            </span>
          </div>
          
          <p className="text-neutral-400 font-mono text-[14px] mt-1.5">@{profile.username}</p>

          <div className="mt-4 text-neutral-300 text-[15px] max-w-3xl leading-relaxed whitespace-pre-wrap">
            {profile.bio || "No bio yet."}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-5 text-[14px] text-neutral-400 font-medium">
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-accent hover:text-accent-hover transition-colors">
                <LinkIcon className="w-4 h-4" />
                <span className="truncate max-w-[250px]">{profile.website_url.replace(/^https?:\/\//, '')}</span>
              </a>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 opacity-70" />
              <span>Joined {joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setIsEditModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  )
}
