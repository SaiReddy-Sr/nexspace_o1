'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null
  onUploadComplete: (url: string) => void
}

export default function AvatarUploader({ currentAvatarUrl, onUploadComplete }: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    setIsUploading(true)
    try {
      // 1. Compress Image
      const options = {
        maxWidthOrHeight: 400, // avatars don't need to be huge
        fileType: 'image/webp' as const,
        maxSizeMB: 0.1,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      // 2. Auth Check
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('You must be logged in to upload an avatar.')
      }

      // 3. Upload to Storage
      // Store under user's folder in project-media bucket as per RLS policies
      const fileName = `avatar_${Date.now()}.webp`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // 4. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('project-media')
        .getPublicUrl(filePath)

      onUploadComplete(publicUrlData.publicUrl)
      
      // Clear input
      e.target.value = ''
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative h-24 w-24 rounded-full overflow-hidden border border-border bg-card">
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-foreground/30 text-sm">
            No image
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium py-1.5 px-4 rounded-full border border-border transition-colors">
          <span>{isUploading ? 'Uploading...' : 'Change Avatar'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>
    </div>
  )
}
