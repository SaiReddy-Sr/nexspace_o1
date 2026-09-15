import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type NotificationType = 'upvote' | 'comment' | 'track' | 'update' | 'message'

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: NotificationType
  entity_id: string | null
  is_read: boolean
  created_at: string
  actor?: {
    username: string
    avatar_url: string | null
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let channel: any;

    const fetchNotifications = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch initial notifications
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id (username, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setNotifications(data as Notification[])
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
      setLoading(false)

      // Subscribe to real-time changes with a unique channel name to avoid Strict Mode conflicts
      channel = supabase
        .channel(`notifications-${user.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const newNotif = payload.new as Notification
            // Fetch the actor's profile info because it doesn't come in the payload
            const { data: actorData } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', newNotif.actor_id)
              .single()

            if (actorData) {
              newNotif.actor = actorData
            }

            setNotifications((prev) => [newNotif, ...prev])
            setUnreadCount((count) => count + 1)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as Notification
            setNotifications((prev) => {
              const newArr = prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
              setUnreadCount(newArr.filter((x) => !x.is_read).length)
              return newArr
            })
          }
        )
        .subscribe()
    }

    fetchNotifications()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead }
}
