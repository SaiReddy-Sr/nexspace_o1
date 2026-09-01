'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Trash2, MessageSquare } from 'lucide-react'
import { addComment, deleteComment } from '@/app/project/[id]/comment-actions'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  rating: number | null
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

interface ProjectCommentsProps {
  projectId: string
  comments: Comment[]
  currentUser: any
}

export default function ProjectComments({ projectId, comments, currentUser }: ProjectCommentsProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    setError('')

    const result = await addComment(projectId, content, rating)
    
    if (result.error) {
      setError(result.error)
    } else {
      setContent('')
      setRating(null)
    }
    
    setIsSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    const result = await deleteComment(commentId, projectId)
    if (result.error) {
      alert(result.error)
    }
  }

  return (
    <div className="mt-16 border-t border-border pt-12">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-foreground" />
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Reviews & Comments</h2>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-12 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start mb-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center overflow-hidden flex-shrink-0">
              {currentUser.user_metadata?.avatar_url ? (
                <img src={currentUser.user_metadata.avatar_url} alt="You" className="w-full h-full object-cover" />
              ) : (
                <span className="text-foreground/50 font-bold uppercase">{currentUser.email?.charAt(0) || 'U'}</span>
              )}
            </div>
            
            <div className="flex-1 w-full">
              {/* Rating Selector */}
              <div className="flex items-center gap-1 mb-3">
                <span className="text-sm text-foreground/70 mr-2 font-medium">Rating (optional):</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star === rating ? null : star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-5 h-5 ${
                        (hoveredRating || rating || 0) >= star 
                          ? 'fill-yellow-500 text-yellow-500' 
                          : 'text-border'
                      } transition-colors`} 
                    />
                  </button>
                ))}
              </div>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Leave a review or comment..."
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y min-h-[100px]"
                required
              />
              
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-12 bg-card p-6 rounded-xl border border-border text-center">
          <p className="text-foreground/70 mb-4">You must be logged in to leave a review or comment.</p>
          <Link 
            href={`/login?next=/project/${projectId}`}
            className="inline-flex items-center justify-center px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-md transition-colors"
          >
            Log In
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-foreground/50 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Link href={`/profile/${comment.profiles?.username}`} className="w-10 h-10 rounded-full bg-border flex items-center justify-center overflow-hidden flex-shrink-0 border border-border/50 hover:opacity-80 transition-opacity">
                {comment.profiles?.avatar_url ? (
                  <img src={comment.profiles.avatar_url} alt={comment.profiles.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-foreground/50 font-bold uppercase">{comment.profiles?.username?.charAt(0) || 'U'}</span>
                )}
              </Link>
              
              <div className="flex-1">
                <div className="bg-card p-4 rounded-xl border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={`/profile/${comment.profiles?.username}`} className="font-bold text-foreground hover:text-accent transition-colors">
                        @{comment.profiles?.username}
                      </Link>
                      <span className="text-xs text-foreground/40 ml-3 font-mono">
                        {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    
                    {currentUser?.id === comment.user_id && (
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="text-foreground/40 hover:text-red-500 transition-colors p-1"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {comment.rating && (
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 ${star <= comment.rating! ? 'fill-yellow-500 text-yellow-500' : 'text-border'}`} 
                        />
                      ))}
                    </div>
                  )}
                  
                  <p className="text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
