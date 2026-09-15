export type ChatPeer = {
  id: string
  name: string
  avatarUrl: string | null
  role: string
  track: string | null
  trackLabel: string | null
}

export type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  kind: string
  body: string
  mediaUrl: string | null
  mediaKey: string | null
  mediaName: string | null
  mediaMime: string | null
  mediaSize: number | null
  mediaDuration: number | null
  createdAt: string
  readAt: string | null
  clientId?: string | null
  pending?: boolean
  failed?: boolean
}

export type ChatConversation = {
  id: string
  track: string
  trackLabel: string
  peer: ChatPeer
  unread: number
  lastMessageAt: string | null
  lastMessageText: string | null
  lastMessage: {
    id: string
    kind: string
    body: string
    senderId: string
    createdAt: string
  } | null
  updatedAt: string
}

export type ConversationsPayload = {
  conversations: ChatConversation[]
  students: ChatPeer[]
  tutors: ChatPeer[]
  role: "student" | "tutor"
  userId: string
}

export type ChatRealtimeEvent = {
  name: string
  conversationId?: string
  message?: ChatMessage
  preview?: string
  senderId?: string
  [key: string]: unknown
}

export type InboxRow =
  | {
      key: string
      kind: "conversation"
      conversation: ChatConversation
      peer: ChatPeer
    }
  | {
      key: string
      kind: "peer"
      peer: ChatPeer
      conversation: null
    }
