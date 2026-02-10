chrome.runtime.onInstalled.addListener(() => {
  console.log('AMZ Chat extension installed')
})

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open side panel
  chrome.sidePanel.open({ windowId: tab.windowId })
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message)
  // Handle relay server communication here
  sendResponse({ received: true })
})
