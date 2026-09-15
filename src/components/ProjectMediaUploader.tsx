'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'

interface ProjectMediaUploaderProps {
  onUploadComplete: (url: string, mediaType: 'image' | 'video') => void
}

export default function ProjectMediaUploader({ onUploadComplete }: ProjectMediaUploaderProps) {
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    
    if (!isVideo && !isImage) {
      setError('Please select an image or a video.')
      return
    }

    let fileToUpload = file
    let ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'webp')

    if (isVideo) {
      // Validate video size <= 8MB
      const maxSizeInBytes = 8 * 1024 * 1024
      if (file.size > maxSizeInBytes) {
        setError('Video file is too large. Maximum size is 8MB.')
        return
      }
    }

    if (isImage) {
      // Validate image size <= 10MB before compression
      const maxImageSizeInBytes = 10 * 1024 * 1024
      if (file.size > maxImageSizeInBytes) {
        setError('Image file is too large. Maximum size is 10MB.')
        return
      }

      setIsCompressing(true)
      try {
        const options = {
          maxWidthOrHeight: 1200,
          fileType: 'image/webp' as const,
          maxSizeMB: 0.2,
          useWebWorker: true,
        }
        fileToUpload = await imageCompression(file, options)
        ext = 'webp'
      } catch (err: any) {
        setIsCompressing(false)
        setError(err.message || 'Error compressing image.')
        return
      }
      setIsCompressing(false)
    }

    setIsUploading(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('You must be logged in to upload media.')
      }

      // Generate path: {auth.uid()}/{crypto.randomUUID()}.{ext}
      const fileName = `${crypto.randomUUID()}.${ext}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('project-media')
        .getPublicUrl(filePath)

      onUploadComplete(publicUrlData.publicUrl, isImage ? 'image' : 'video')

      // Clear input
      e.target.value = ''
    } catch (err: any) {
      setError(err.message || 'Failed to upload file.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <label className="block text-sm font-bold text-foreground/90 mb-1">
          Upload Project Media
        </label>
        <p className="text-xs text-foreground/60">
          Supported: Images (up to 10MB, auto-optimized) or Video (max 8MB).
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 to-accent/20 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative bg-background border border-border rounded-xl p-4 sm:p-6 text-center hover:border-accent/50 transition-colors">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={isCompressing || isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          />
          <div className="flex flex-col items-center justify-center pointer-events-none">
            <svg className="w-10 h-10 text-foreground/40 mb-3 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-medium text-foreground/80 group-hover:text-accent transition-colors">
              {isCompressing ? 'Compressing Image...' : isUploading ? 'Uploading Media...' : 'Click or drag file to upload'}
            </span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-red-500">{error}</p>
        </div>
      )}
    </div>
  )
}
