import { createContext, useContext, useState, ReactNode } from 'react'

interface Message {
  id: number
  content: string
  role: 'user' | 'assistant' | 'system'
  created_at: string
  conversation_id?: number
  user_id?: number
}

interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
  user_id: number
  message_count?: number
  last_message_at?: string
  server_group_id?: number
  server_group_name?: string
}

interface ChatContextType {
  conversations: Conversation[]
  currentConversationId: number | null
  messages: Map<number, Message[]>
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversationId: (id: number | null) => void
  addConversation: (conversation: Conversation) => void
  removeConversation: (id: number) => void
  updateConversation: (id: number, updates: Partial<Conversation>) => void
  setMessagesForConversation: (conversationId: number, messages: Message[]) => void
  addMessageToConversation: (conversationId: number, message: Message) => void
  getMessagesForConversation: (conversationId: number) => Message[]
  clearAllMessages: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversationsState] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Map<number, Message[]>>(new Map())

  const setConversations = (convs: Conversation[]) => {
    setConversationsState(convs)
  }

  const addConversation = (conversation: Conversation) => {
    setConversationsState(prev => [conversation, ...prev])
  }

  const removeConversation = (id: number) => {
    setConversationsState(prev => prev.filter(c => c.id !== id))
    setMessages(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
  }

  const updateConversation = (id: number, updates: Partial<Conversation>) => {
    setConversationsState(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    )
  }

  const setMessagesForConversation = (conversationId: number, msgs: Message[]) => {
    setMessages(prev => {
      const newMap = new Map(prev)
      newMap.set(conversationId, msgs)
      return newMap
    })
  }

  const addMessageToConversation = (conversationId: number, message: Message) => {
    setMessages(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(conversationId) || []
      newMap.set(conversationId, [...existing, message])
      return newMap
    })
  }

  const getMessagesForConversation = (conversationId: number): Message[] => {
    return messages.get(conversationId) || []
  }

  const clearAllMessages = () => {
    setMessages(new Map())
  }

  const value = {
    conversations,
    currentConversationId,
    messages,
    setConversations,
    setCurrentConversationId,
    addConversation,
    removeConversation,
    updateConversation,
    setMessagesForConversation,
    addMessageToConversation,
    getMessagesForConversation,
    clearAllMessages,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}