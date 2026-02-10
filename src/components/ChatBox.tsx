import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, MessageSquare, Trash2, Plus } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { Message } from '../types/message'
import { useTheme } from '@lobehub/ui'

export const ChatBox: React.FC = () => {
  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    setCurrentSession,
    addMessage,
    clearSession,
    setConnected,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()

  const currentSession = sessions.find((s) => s.id === currentSessionId)
  const messages = currentSession?.messages || []

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Simulate connection to relay server
    setConnected(true)

    // Create session if none exists
    if (sessions.length === 0) {
      createSession()
    } else if (!currentSessionId) {
      setCurrentSession(sessions[0].id)
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || !currentSessionId) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    addMessage(currentSessionId, {
      role: 'user',
      content: userMessage,
    })

    setLoading(true)

    try {
      // Send message to relay server (to be implemented)
      const response = await sendMessageToRelay(userMessage, currentSessionId)

      // Add assistant response
      addMessage(currentSessionId, {
        role: 'assistant',
        content: response.content,
        metadata: response.metadata,
      })
    } catch (error) {
      addMessage(currentSessionId, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const sendMessageToRelay = async (
    message: string,
    sessionId: string
  ): Promise<{ content: string; metadata?: any }> => {
    // This will connect to react-grab relay server
    // For now, return a mock response
    return {
      content: `Echo: ${message}`,
      metadata: { model: 'mock' },
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewSession = () => {
    createSession()
  }

  const handleDeleteSession = (id: string) => {
    if (window.confirm('Delete this session?')) {
      deleteSession(id)
    }
  }

  const handleClearSession = () => {
    if (currentSessionId && window.confirm('Clear all messages?')) {
      clearSession(currentSessionId)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">AMZ Chat</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNewSession}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="New session"
          >
            <Plus className="w-4 h-4" />
          </button>
          {currentSession && (
            <button
              onClick={handleClearSession}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Clear session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Session list sidebar */}
        <div className="w-48 border-r border-border overflow-y-auto">
          <div className="p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setCurrentSession(session.id)}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  currentSessionId === session.id
                    ? 'bg-accent'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="text-sm font-medium truncate">
                  Session {new Date(session.createdAt).toLocaleTimeString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {session.messages.length} messages
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSession(session.id)
                  }}
                  className="mt-1 text-xs text-destructive hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-4" />
                <p>Start a conversation</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    {message.metadata && (
                      <div className="text-xs mt-1 opacity-70">
                        {message.metadata.model}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
