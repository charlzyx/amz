// Content script - can interact with web pages
console.log('AMZ Chat content script loaded')

// 1. 注入 react-grab 脚本
function injectReactGrab() {
  const script = document.createElement('script')
  script.src = 'https://unpkg.com/react-grab@latest/dist/react-grab.umd.js'
  script.onload = () => {
    console.log('✅ react-grab injected successfully')

    // 暴露全局函数供页面调用
    ;(window as any).amzGrabReact = () => {
      if (typeof (window as any).ReactGrab !== 'undefined') {
        return (window as any).ReactGrab.capture()
      }
      return null
    }
  }
  script.onerror = () => {
    console.error('❌ Failed to inject react-grab')
  }
  ;(document.head || document.documentElement).appendChild(script)
}

// 2. 注入与侧边栏通信的脚本
function injectCommunicationScript() {
  const script = document.createElement('script')
  script.textContent = `
    (function() {
      console.log('📡 AMZ Communication script injected');

      // 监听来自 side panel 的消息
      window.addEventListener('message', (event) => {
        // 验证消息来源
        if (event.source !== window) return;

        const { type, data, id } = event.data;

        if (!type) return;

        console.log('📨 Received message:', type);

        switch (type) {
          case 'AMZ_GRAB_REACT':
            // 抓取 React 组件树
            if (typeof window.ReactGrab !== 'undefined') {
              try {
                const result = window.ReactGrab.capture();
                window.postMessage({
                  type: 'AMZ_REACT_DATA',
                  data: result,
                  id: id
                }, '*');
              } catch (err) {
                window.postMessage({
                  type: 'AMZ_ERROR',
                  data: { message: err.message },
                  id: id
                }, '*');
              }
            } else {
              window.postMessage({
                type: 'AMZ_ERROR',
                data: { message: 'ReactGrab not available' },
                id: id
              }, '*');
            }
            break;

          case 'AMZ_GET_TEXT':
            // 获取页面选中文本或全部文本
            const selectedText = window.getSelection()?.toString() || document.body.innerText;
            window.postMessage({
              type: 'AMZ_TEXT_DATA',
              data: { text: selectedText },
              id: id
            }, '*');
            break;

          case 'AMZ_GET_HTML':
            // 获取页面 HTML
            window.postMessage({
              type: 'AMZ_HTML_DATA',
              data: { html: document.documentElement.outerHTML },
              id: id
            }, '*');
            break;
        }
      });
    })();
  `
  ;(document.head || document.documentElement).appendChild(script)
}

// 3. 建立 content script 与 side panel 的通信通道
function setupSidePanelCommunication() {
  // 监听来自 side panel 的消息
  chrome.runtime.onMessage.addListener((request) => {
    console.log('📨 Content received:', request)

    const { type, data, id } = request

    // 转发到页面脚本
    window.postMessage({ type, data, id }, '*')

    // 返回 true 表示异步响应
    return true
  })

  // 监听来自页面脚本的响应，转发回 side panel
  window.addEventListener('message', (event) => {
    if (event.source !== window) return

    const { type, data, id } = event.data

    if (type.startsWith('AMZ_') && type !== 'AMZ_GRAB_REACT' && type !== 'AMZ_GET_TEXT' && type !== 'AMZ_GET_HTML') {
      // 转发回 side panel
      chrome.runtime.sendMessage({ type, data, id })
    }
  })
}

// 初始化
function init() {
  injectReactGrab()
  injectCommunicationScript()
  setupSidePanelCommunication()

  console.log('🚀 AMZ Chat content script initialized')
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
