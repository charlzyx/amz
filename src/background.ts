chrome.runtime.onInstalled.addListener(() => {
  console.log('AMZ Chat extension installed')
})

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open side panel
  chrome.sidePanel.open({ windowId: tab.windowId })
})

// 存储消息响应的回调
const messageCallbacks = new Map<string, (response: any) => void>()

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background received message:', message.type)

  const { type, data, id } = message

  switch (type) {
    case 'AMZ_SEND_TO_TAB':
      // 来自 side panel：转发到当前标签页的 content script
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: data.type,
          data: data.data,
          id: id
        })
      }
      break

    case 'AMZ_RESPONSE':
      // 来自 content script：响应给 side panel
      const callback = messageCallbacks.get(id)
      if (callback) {
        callback(data)
        messageCallbacks.delete(id)
      }
      break

    default:
      // 其他消息直接转发
      console.log('Message received:', message)
      sendResponse({ received: true })
      break
  }

  // 返回 true 表示异步响应
  return true
})

// 提供给 side panel 使用的消息发送函数
export async function sendToTab(tabId: number, message: any): Promise<any> {
  return new Promise((resolve) => {
    const id = Date.now().toString()

    messageCallbacks.set(id, resolve)

    chrome.tabs.sendMessage(tabId, {
      type: message.type,
      data: message.data,
      id: id
    })

    // 5秒超时
    setTimeout(() => {
      messageCallbacks.delete(id)
      resolve({ error: 'Timeout' })
    }, 5000)
  })
}
