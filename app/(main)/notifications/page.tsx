'use client'

import { useState } from 'react'
import { Bell, Heart, UserPlus, MessageCircle, ShoppingBag } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BottomNav } from '@/components/layout/BottomNav'
import { timeAgo } from '@/lib/utils'

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    message: 'alexcreates and 24 others liked your video',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    time: new Date(Date.now() - 300000).toISOString(),
    isRead: false,
  },
  {
    id: '2',
    type: 'follow',
    message: 'sarahstyle started following you',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    time: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
  },
  {
    id: '3',
    type: 'comment',
    message: 'techwithtom commented: "This is so cool!! 🔥"',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom',
    time: new Date(Date.now() - 7200000).toISOString(),
    isRead: true,
  },
  {
    id: '4',
    type: 'order',
    message: 'Your order from Sarah Style Shop has shipped! 📦',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shop',
    time: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
  },
]

const typeIcons = {
  like: Heart,
  follow: UserPlus,
  comment: MessageCircle,
  order: ShoppingBag,
}

const typeColors = {
  like: 'text-[#FE2C55]',
  follow: 'text-[#69C9D0]',
  comment: 'text-blue-400',
  order: 'text-green-400',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  return (
    <div className="min-h-[100dvh] bg-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black border-b border-white/10 px-4 py-3 pt-safe">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">Notifications</h1>
          <button
            onClick={() => setNotifications((n) => n.map((i) => ({ ...i, isRead: true })))}
            className="text-[#69C9D0] text-sm"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {notifications.map((notif) => {
          const Icon = typeIcons[notif.type as keyof typeof typeIcons] || Bell
          const color = typeColors[notif.type as keyof typeof typeColors] || 'text-white'
          return (
            <div
              key={notif.id}
              className={`flex items-start gap-3 px-4 py-4 ${!notif.isRead ? 'bg-white/5' : ''}`}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="w-11 h-11">
                  <AvatarImage src={notif.avatar} />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-black rounded-full flex items-center justify-center`}>
                  <Icon className={`w-3 h-3 ${color}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-snug">{notif.message}</p>
                <p className="text-white/40 text-xs mt-1">{timeAgo(notif.time)}</p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 bg-[#FE2C55] rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
