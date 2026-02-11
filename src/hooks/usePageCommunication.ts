import { useState, useCallback } from 'react'

// 消息类型
export interface PageMessage {
  type: string
  data?: any
  id?: string
}

export interface PageResponse {
  type: string
  data?: any
  id?: string
  error?: string
}

/**
 * 页面通信 Hook
 * 用于 side panel 与页面脚本进行通信
 */
export function usePageCommunication() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 发送消息到当前激活的标签页
   */
  const sendMessage = useCallback(async (message: PageMessage): Promise<any> => {
    setIsLoading(true)
    setError(null)

    try {
      // 获取当前激活的标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab || !tab.id) {
        throw new Error('No active tab found')
      }

      // 生成消息 ID
      const id = Date.now().toString()

      // 创建 Promise 等待响应
      const promise = new Promise<PageResponse>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Message timeout'))
        }, 5000)

        const listener = (response: PageResponse) => {
          if (response.id === id) {
            clearTimeout(timeout)
            chrome.runtime.onMessage.removeListener(listener)
            if (response.error) {
              reject(new Error(response.error))
            } else {
              resolve(response)
            }
          }
        }

        chrome.runtime.onMessage.addListener(listener)
      })

      // 发送消息到 content script
      await chrome.tabs.sendMessage(tab.id, {
        type: message.type,
        data: message.data,
        id: id
      })

      // 等待响应
      const response = await promise
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 抓取 React 组件树
   */
  const grabReactTree = useCallback(async () => {
    return sendMessage({
      type: 'AMZ_GRAB_REACT'
    })
  }, [sendMessage])

  /**
   * 获取页面文本
   */
  const getPageText = useCallback(async (selectedOnly = false) => {
    return sendMessage({
      type: 'AMZ_GET_TEXT',
      data: { selectedOnly }
    })
  }, [sendMessage])

  /**
   * 获取页面 HTML
   */
  const getPageHTML = useCallback(async () => {
    return sendMessage({
      type: 'AMZ_GET_HTML'
    })
  }, [sendMessage])

  /**
   * 执行自定义消息
   */
  const sendCustomMessage = useCallback(async (type: string, data?: any) => {
    return sendMessage({
      type,
      data
    })
  }, [sendMessage])

  return {
    isLoading,
    error,
    sendMessage,
    grabReactTree,
    getPageText,
    getPageHTML,
    sendCustomMessage
  }
}
