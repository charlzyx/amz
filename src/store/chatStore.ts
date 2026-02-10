import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message, ChatSession } from '../types/message'

interface ChatState {
  sessions: ChatSession[]
  currentSessionId: string | null
  isConnected: boolean

  // Actions
  createSession: () => string
  deleteSession: (id: string) => void
  setCurrentSession: (id: string | null) => void
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  updateLastMessage: (sessionId: string, content: string) => void
  clearSession: (id: string) => void
  setConnected: (connected: boolean) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isConnected: false,

      createSession: () => {
        const id = `session_${Date.now()}`
        const newSession: ChatSession = {
          id,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSessionId: id,
        }))
        return id
      },

      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          currentSessionId:
            state.currentSessionId === id ? null : state.currentSessionId,
        }))
      },

      setCurrentSession: (id) => {
        set({ currentSessionId: id })
      },

      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== sessionId) return session

            const newMessage: Message = {
              ...message,
              id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
            }

            return {
              ...session,
              messages: [...session.messages, newMessage],
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      updateLastMessage: (sessionId, content) => {
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== sessionId) return session

            const messages = [...session.messages]
            if (messages.length > 0) {
              messages[messages.length - 1] = {
                ...messages[messages.length - 1],
                content,
              }
            }

            return {
              ...session,
              messages,
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      clearSession: (id) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? { ...session, messages: [], updatedAt: Date.now() }
              : session
          ),
        }))
      },

      setConnected: (connected) => {
        set({ isConnected: connected })
      },
    }),
    {
      name: 'amz-chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
)
