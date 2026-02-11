/**
 * Message types matching react-grab relayserver to client format
 */
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
  metadata?: {
    model?: string
    tokens?: number
    [key: string]: any
  }
}

export interface ChatSession {
  id: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  model?: string
}

export interface RelayServerMessage {
  type: 'message' | 'error' | 'status' | 'tool_call' | 'tool_result'
  payload: {
    message?: Message & {
      isChunk?: boolean      // 是否为流式片段
      chunkIndex?: number    // 片段索引（从0开始）
      done?: boolean         // 是否结束
    }
    error?: string
    status?: string
    toolCall?: any
    toolResult?: any
  }
  timestamp: number
}

export interface RelayClientMessage {
  type: 'send_message' | 'reset' | 'ping'
  payload: {
    message?: string
    sessionId?: string
  }
  timestamp: number
}
