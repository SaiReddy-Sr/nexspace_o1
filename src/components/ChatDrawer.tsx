'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/types/supabase'
import { sendMessage, blockUser, reportUser } from '@/app/dashboard/messages/actions'

interface ChatDrawerProps {
  conversationId: string
  currentUserId: string
  onClose: () => void
  onBlock?: (conversationId: string) => void
}

type MessageRow = Tables<'messages'>

export default function ChatDrawer({ conversationId, currentUserId, onClose, onBlock }: ChatDrawerProps) {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [otherParticipant, setOtherParticipant] = useState<{ id: string; username: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)
  const [blocking, setBlocking] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    // Fetch conversation info for participant details
    async function fetchConversationDetails() {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          initiator_id,
          recipient_id,
          initiator:initiator_id ( username ),
          recipient:recipient_id ( username )
        `)
        .eq('id', conversationId)
        .single()

      if (!error && data && isMounted) {
        const isInitiator = data.initiator_id === currentUserId
        const otherId = isInitiator ? data.recipient_id : data.initiator_id
        const otherProfile = isInitiator ? data.recipient : data.initiator
        const username = (otherProfile as unknown as { username: string })?.username || 'Participant'
        setOtherParticipant({ id: otherId, username })
      }
    }

    // Fetch initial messages for this conversation
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        if (isMounted) setError('Failed to load messages.')
      } else if (data && isMounted) {
        setMessages(data)
      }
      if (isMounted) setLoading(false)
    }

    fetchConversationDetails()
    fetchMessages()

    // Open exactly one realtime channel scoped to this conversation
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const insertedMessage = payload.new as MessageRow
          setMessages((prev) => {
            if (prev.some((m) => m.id === insertedMessage.id)) {
              return prev
            }
            return [...prev, insertedMessage]
          })
        }
      )
      .subscribe()

    // Unconditional cleanup on unmount
    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content || sending) return

    setSending(true)
    setError(null)
    setNewMessage('')

    const result = await sendMessage(conversationId, content)

    setSending(false)

    if (result.error) {
      setError(result.error)
      setNewMessage(content)
    }
  }

  async function handleBlock() {
    if (!otherParticipant || blocking) return
    if (!window.confirm(`Are you sure you want to block @${otherParticipant.username}?`)) return

    setBlocking(true)
    setError(null)

    const result = await blockUser(conversationId, otherParticipant.id)
    setBlocking(false)
    setMenuOpen(false)

    if (result.error) {
      setError(result.error)
    } else {
      if (onBlock) {
        onBlock(conversationId)
      }
      onClose()
    }
  }

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!otherParticipant || reportSubmitting) return

    setReportSubmitting(true)
    setError(null)

    const result = await reportUser(conversationId, otherParticipant.id, reportReason)
    setReportSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setReportSuccess(true)
      setReportReason('')
      setTimeout(() => {
        setShowReportModal(false)
        setReportSuccess(false)
        setMenuOpen(false)
      }, 1500)
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-card shadow-2xl border-l border-border flex flex-col transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background relative">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          <div>
            <h2 className="text-base font-mono font-bold text-foreground">
              {otherParticipant ? `@${otherParticipant.username}` : 'Chat'}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Header Action Menu */}
          {otherParticipant && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-md text-foreground/50 hover:text-foreground hover:bg-background focus:outline-none transition-colors"
                aria-label="Options"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-card rounded-md shadow-lg border border-border z-50 py-1 text-sm font-mono font-bold">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      setShowReportModal(true)
                    }}
                    className="w-full text-left px-4 py-2 text-foreground/80 hover:bg-background hover:text-foreground transition-colors"
                  >
                    Report
                  </button>
                  <button
                    onClick={handleBlock}
                    disabled={blocking}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-background transition-colors"
                  >
                    {blocking ? 'Blocking...' : 'Block'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-foreground/50 hover:text-foreground hover:bg-background focus:outline-none transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Report Modal / Panel Overlay */}
      {showReportModal && (
        <div className="p-4 bg-background/95 border-b border-border backdrop-blur-sm">
          <h3 className="text-sm font-mono font-bold text-foreground mb-2">
            Report @{otherParticipant?.username}
          </h3>
          {reportSuccess ? (
            <div className="text-xs text-green-500 font-mono font-bold py-2">
              Report submitted. Thank you.
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-2">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason for report (optional)"
                rows={2}
                className="w-full text-xs font-mono p-2 rounded border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none transition-colors"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-2.5 py-1 text-xs font-mono font-bold text-foreground/50 hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="px-3 py-1 text-xs font-mono font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded disabled:opacity-50 transition-colors"
                >
                  {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full text-foreground/50 text-sm font-mono font-bold">
            <svg className="animate-spin h-5 w-5 mr-2 text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-foreground/50 space-y-2 font-mono">
            <svg className="w-12 h-12 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-bold">No messages yet.</p>
            <p className="text-xs text-gray-400">Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-accent text-white rounded-br-none'
                      : 'bg-background text-foreground rounded-bl-none border border-border'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] font-mono font-bold text-foreground/40 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-500 text-xs font-mono font-bold">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-border bg-background flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 px-4 py-2 text-sm font-mono bg-card text-foreground rounded-full border border-transparent focus:border-accent focus:outline-none transition-colors disabled:opacity-50 placeholder-foreground/40"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="p-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors focus:outline-none shadow-sm"
          aria-label="Send message"
        >
          <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
