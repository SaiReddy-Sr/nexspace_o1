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
    <div className="w-full max-w-sm">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Upload Media (Image or Video)
      </label>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        disabled={isCompressing || isUploading}
        className="block w-full text-sm text-gray-500 dark:text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          dark:file:bg-gray-800 dark:file:text-gray-200
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
      
      {(isCompressing || isUploading) && (
        <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
          {isCompressing ? 'Compressing...' : 'Uploading...'}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
