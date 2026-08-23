'use client'

// TEMPORARY — remove in Phase 4 once the real project-posting form exists.

import { useState } from 'react'
import ProjectMediaUploader from '@/components/ProjectMediaUploader'

export default function MediaTestClient() {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)

  function handleUploadComplete(url: string, type: 'image' | 'video') {
    setUploadedUrl(url)
    setMediaType(type)
  }

  return (
    <div className="flex flex-col items-center mt-8 space-y-8">
      <ProjectMediaUploader onUploadComplete={handleUploadComplete} />
      
      {uploadedUrl && (
        <div className="mt-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md w-full max-w-2xl text-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upload Successful!</h3>
          <p className="mb-4 text-sm text-blue-600 dark:text-blue-400 break-all">
            <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
              {uploadedUrl}
            </a>
          </p>
          
          <div className="flex justify-center bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
            {mediaType === 'image' ? (
              <img 
                src={uploadedUrl} 
                alt="Uploaded media preview" 
                className="max-w-full max-h-[500px] object-contain rounded-md shadow-sm"
              />
            ) : (
              <video 
                src={uploadedUrl} 
                controls 
                className="max-w-full max-h-[500px] object-contain rounded-md shadow-sm"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
