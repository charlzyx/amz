// Chrome Extension 类型扩展
declare global {
  interface Window {
    amzGrabReact?: () => any
    ReactGrab?: {
      capture: () => any
    }
  }

  namespace chrome {
    namespace runtime {
      type MessageHandler = (
        request: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void
      ) => boolean | void
    }
  }
}

// 消息类型定义
export interface AMZMessage {
  type: string
  data?: any
  id?: string
}

export interface ReactGrabData {
  components?: any[]
  state?: any
  props?: any
}

export interface AMZResponse {
  type: string
  data?: any
  id?: string
  error?: string
}

export {}
