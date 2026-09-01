'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/lib/cropImage'

interface ImageUploaderProps {
  currentImageUrl?: string | null
  onUploadComplete: (url: string) => void
  type: 'avatar' | 'banner'
}

const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export default function ImageUploader({ currentImageUrl, onUploadComplete, type }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Cropper state
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)

  const supabase = createClient()
  const isAvatar = type === 'avatar'
  
  const containerClasses = isAvatar 
    ? "relative h-24 w-24 rounded-full overflow-hidden border-2 border-white/10 bg-[#1E1E2E] shrink-0"
    : "relative h-24 w-full rounded-xl overflow-hidden border border-white/10 bg-[#1E1E2E]"
    
  const placeholderClasses = isAvatar
    ? "h-full w-full bg-white/5 flex items-center justify-center text-xs text-white/30"
    : "absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:12px_12px]"

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    
    // File Validation
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Please select an image under ${MAX_FILE_SIZE_MB}MB.`)
      e.target.value = ''
      return
    }

    // Set file to state and prepare crop preview
    setFileToUpload(file)
    const reader = new FileReader()
    reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function uploadCroppedImage() {
    if (!imageSrc || !croppedAreaPixels || !fileToUpload) return

    setIsUploading(true)
    setError(null)
    
    try {
      // 1. Get cropped image blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      
      // Convert blob back to File for browser-image-compression
      const croppedFile = new File([croppedBlob], fileToUpload.name, {
        type: 'image/jpeg',
      })

      // 2. Compress Image
      const options = {
        maxWidthOrHeight: isAvatar ? 800 : 1200,
        fileType: 'image/webp' as const,
        maxSizeMB: isAvatar ? 0.1 : 0.3,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(croppedFile, options)

      // 3. Auth Check
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error(`You must be logged in to upload a ${type}.`)
      }

      // 4. Upload to Storage
      const fileName = `${type}_${Date.now()}.webp`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // 5. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('project-media')
        .getPublicUrl(filePath)

      onUploadComplete(publicUrlData.publicUrl)
      
      // Clear cropper state
      setImageSrc(null)
      setFileToUpload(null)
    } catch (err: any) {
      setError(err.message || `Failed to upload ${type}.`)
    } finally {
      setIsUploading(false)
    }
  }

  function cancelCrop() {
    setImageSrc(null)
    setFileToUpload(null)
    setError(null)
  }

  return (
    <>
      {/* Cropper Modal Overlay */}
      {imageSrc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-[#181825] rounded-xl border border-white/10 w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-[#1E1E2E]">
              <h3 className="text-lg font-medium text-white">Crop {type}</h3>
              <button onClick={cancelCrop} className="text-white/50 hover:text-white p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="relative h-[60vh] w-full bg-black/50">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={isAvatar ? 1 : 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-4 bg-[#1E1E2E] border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3 w-full sm:w-1/2">
                <span className="text-xs text-white/50">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={cancelCrop}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={uploadCroppedImage}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save & Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Uploader UI */}
      <div className={`flex ${isAvatar ? 'items-center space-x-6' : 'flex-col space-y-3'}`}>
        <div className={containerClasses}>
          {currentImageUrl ? (
            <img src={currentImageUrl} alt={`${type} preview`} className="h-full w-full object-cover" />
          ) : (
            <div className={placeholderClasses}>
              {isAvatar ? 'No image' : ''}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium py-1.5 px-3 rounded-lg border border-white/10 transition-colors">
              <span>{isUploading ? 'Uploading...' : `${currentImageUrl ? 'Change' : 'Upload'} ${type.charAt(0).toUpperCase() + type.slice(1)}`}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            {error && <p className="text-red-500 text-xs ml-3 bg-red-500/10 px-2 py-1 rounded">{error}</p>}
          </div>
          <p className="text-[10px] text-white/40 mt-1.5 ml-1">Max {MAX_FILE_SIZE_MB}MB. Will be cropped & compressed.</p>
        </div>
      </div>
    </>
  )
}
