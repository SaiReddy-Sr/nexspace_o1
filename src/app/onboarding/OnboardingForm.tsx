'use client'

import { useState, useEffect, useRef } from 'react'
import { createProfile, checkUsernameAvailability } from './actions'
import dynamic from 'next/dynamic'

const ImageUploader = dynamic(() => import('@/components/ImageUploader'))

export default function OnboardingForm({ role, nextParam }: { role: string; nextParam?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!username) {
      setIsUsernameAvailable(null)
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    setIsCheckingUsername(true)
    timeoutRef.current = setTimeout(async () => {
      const isAvailable = await checkUsernameAvailability(username)
      setIsUsernameAvailable(isAvailable)
      setIsCheckingUsername(false)
    }, 400)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [username])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    
    // Append image URLs to form data
    if (avatarUrl) formData.append('avatar_url', avatarUrl)
    if (bannerUrl) formData.append('banner_url', bannerUrl)
    
    const { error: profileError } = await createProfile(formData)
    if (profileError) {
      setError(profileError)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={async (e) => {
      e.preventDefault()
      await handleSubmit(new FormData(e.currentTarget))
    }} className="mt-8 space-y-6">
      <input type="hidden" name="role" value={role} />
      {nextParam && <input type="hidden" name="next" value={nextParam} />}
      
      <div className="space-y-6 rounded-md shadow-sm">
        {/* Profile Banner */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Profile Banner
          </label>
          <ImageUploader 
            type="banner" 
            currentImageUrl={bannerUrl} 
            onUploadComplete={(url) => setBannerUrl(url)} 
          />
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Profile Picture
          </label>
          <ImageUploader 
            type="avatar" 
            currentImageUrl={avatarUrl} 
            onUploadComplete={(url) => setAvatarUrl(url)} 
          />
        </div>

        {/* User Details */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-foreground">
            Username *
          </label>
          <div className="relative mt-2">
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              pattern="[a-zA-Z0-9_-]+"
              title="Only letters, numbers, underscores, and dashes are allowed."
              className={`block w-full appearance-none rounded-md border ${
                isUsernameAvailable === false ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 
                isUsernameAvailable === true ? 'border-green-500 focus:ring-green-500 focus:border-green-500' :
                'border-border focus:ring-accent focus:border-accent'
              } px-3 py-2 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-1 sm:text-sm bg-background transition-colors pr-10`}
              placeholder="johndoe"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {isCheckingUsername ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
              ) : isUsernameAvailable === true ? (
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : isUsernameAvailable === false ? (
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : null}
            </div>
          </div>
          {isUsernameAvailable === false && (
            <p className="mt-1.5 text-sm text-red-500 font-medium">This username is already taken.</p>
          )}
          {isUsernameAvailable === true && (
            <p className="mt-1.5 text-sm text-green-500 font-medium">Username available!</p>
          )}
        </div>
        
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-foreground">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors"
            placeholder="John Doe"
          />
        </div>

        {role === 'developer' && (
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-foreground">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              className="mt-2 block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm bg-background transition-colors resize-y"
              placeholder="Full-stack developer building..."
            />
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-center text-red-500 font-medium">
          {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || isUsernameAvailable === false || isCheckingUsername}
          className="group relative flex w-full justify-center rounded-md bg-accent py-2.5 px-4 text-sm font-bold text-white hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </div>
    </form>
  )
}
