'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'

interface BannerUploaderProps {
  currentBannerUrl?: string | null
  onUploadComplete: (url: string) => void
}

export default function BannerUploader({ currentBannerUrl, onUploadComplete }: BannerUploaderProps) {
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
      // 1. Compress Image (Banner optimized)
      const options = {
        maxWidthOrHeight: 1200, // banners need to be wider
        fileType: 'image/webp' as const,
        maxSizeMB: 0.3, // slightly larger limit for banner
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      // 2. Auth Check
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('You must be logged in to upload a banner.')
      }

      // 3. Upload to Storage
      const fileName = `banner_${Date.now()}.webp`
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
      setError(err.message || 'Failed to upload banner.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="relative h-24 w-full rounded-xl overflow-hidden border border-white/10 bg-[#1E1E2E]">
        {currentBannerUrl ? (
          <img src={currentBannerUrl} alt="Banner Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:12px_12px]"></div>
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

      <div className="flex justify-start">
        <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium py-1.5 px-3 rounded-lg border border-white/10 transition-colors">
          <span>{isUploading ? 'Uploading...' : 'Change Banner'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
        {error && <p className="text-red-500 text-xs ml-3 self-center">{error}</p>}
      </div>
    </div>
  )
}
