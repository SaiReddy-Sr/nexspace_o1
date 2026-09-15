'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, Heart, MessageCircle, Eye, GitCommit } from 'lucide-react'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import Link from 'next/link'
import { createPortal } from 'react-dom'

export function NotificationsDrawer({ isExpanded }: { isExpanded: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  useEffect(() => {
    setMounted(true)
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'upvote': return <Heart className="w-4 h-4 text-rose-500" />
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'track': return <Eye className="w-4 h-4 text-emerald-500" />
      case 'update': return <GitCommit className="w-4 h-4 text-purple-500" />
      case 'message': return <MessageCircle className="w-4 h-4 text-blue-400" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getMessage = (n: Notification) => {
    const actor = n.actor?.username || 'Someone'
    switch (n.type) {
      case 'upvote': return <span className="font-medium">{actor} upvoted your project.</span>
      case 'comment': return <span className="font-medium">{actor} commented on your project.</span>
      case 'track': return <span className="font-medium">{actor} is now tracking you.</span>
      case 'update': return <span className="font-medium">{actor} posted a new update.</span>
      case 'message': return <span className="font-medium">{actor} sent you a message.</span>
      default: return <span>New notification from {actor}.</span>
    }
  }

  const getLink = (n: Notification) => {
    switch (n.type) {
      case 'upvote':
      case 'comment':
      case 'update':
        return `/project/${n.entity_id}`
      case 'track':
        return `/profile/${n.actor?.username}`
      case 'message':
        return `/dashboard/messages`
      default:
        return '#'
    }
  }

  return (
    <>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative flex flex-col items-center justify-center w-full h-[74px] hover:bg-white/10 text-white transition-colors rounded-lg mx-1"
      >
        <div className="relative">
          <Bell className={`w-6 h-6 ${isExpanded ? 'mb-1.5' : ''}`} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-[#0f0f0f]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {isExpanded && <span className="text-[10px] font-normal truncate w-full text-center px-1">Alerts</span>}
      </button>

      {mounted && createPortal(
        <>
          {/* Drawer Overlay */}
          {isOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-[100] transition-opacity"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Drawer Content */}
          <div 
            className={`fixed inset-y-0 right-0 z-[101] w-full max-w-sm bg-[#181825] border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="p-2 text-foreground/50 hover:text-accent hover:bg-accent/10 rounded-full transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-foreground/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-foreground/50 p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Bell className="w-8 h-8 text-foreground/30" />
                  </div>
                  <p>You're all caught up!<br/>No new notifications.</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((notif) => (
                    <li key={notif.id} className={`group relative transition-colors ${!notif.is_read ? 'bg-accent/5' : 'hover:bg-white/5'}`}>
                      <Link 
                        href={getLink(notif)}
                        onClick={() => {
                          if (!notif.is_read) markAsRead(notif.id)
                          setIsOpen(false)
                        }}
                        className="flex items-start gap-4 p-4"
                      >
                        <div className="relative mt-1">
                          {notif.actor?.avatar_url ? (
                            <img src={notif.actor.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center">
                              <span className="text-sm font-bold uppercase">{notif.actor?.username?.charAt(0) || '?'}</span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#181825] border border-border">
                            {getIcon(notif.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground/90 leading-tight">
                            {getMessage(notif)}
                          </p>
                          <p className="text-xs text-foreground/50 mt-1">
                            {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
