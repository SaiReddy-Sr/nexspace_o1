'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvatarUploader from './AvatarUploader'
import BannerUploader from './BannerUploader'

interface Profile {
  id: string
  full_name: string | null
  bio: string | null
  website_url: string | null
  avatar_url: string | null
  banner_url: string | null
  username: string
}

interface EditProfileModalProps {
  profile: Profile
  onClose: () => void
  onSave: () => void // trigger refresh
}

export default function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
          website_url: websiteUrl,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
        })
        .eq('id', profile.id)

      if (updateError) throw updateError
      
      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#181825] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#1E1E2E] shrink-0">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Removed horizontal padding from scroll container, placed on inner container instead */}
        <div className="overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          <div className="px-6 py-6">
            <form id="edit-profile-form" onSubmit={handleSave} className="space-y-6">
              
              {/* Banner Section */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">Profile Banner</label>
                <BannerUploader 
                  currentBannerUrl={bannerUrl} 
                  onUploadComplete={(url) => setBannerUrl(url)} 
                />
              </div>

              {/* Avatar Section */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">Profile Picture</label>
                <AvatarUploader 
                  currentAvatarUrl={avatarUrl} 
                  onUploadComplete={(url) => setAvatarUrl(url)} 
                />
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#1E1E2E] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#1E1E2E] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors min-h-[100px] resize-y"
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full bg-[#1E1E2E] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-[#1E1E2E] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
