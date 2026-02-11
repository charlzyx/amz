# 浏览器页面注入脚本说明

## 概述

本扩展包含两个主要的页面注入脚本：

1. **react-grab 注入脚本** - 用于抓取 React 组件树
2. **页面通信脚本** - 实现侧边栏与页面的双向通信

## 功能特性

### 1. react-grab 注入

自动注入 `react-grab` 库到页面，提供 React 组件树抓取功能。

**自动注入时机：**
- 页面加载时自动注入
- 从 CDN 加载：`https://unpkg.com/react-grab@latest/dist/react-grab.umd.js`

**全局方法：**
```javascript
window.amzGrabReact() // 抓取当前页面的 React 组件树
```

### 2. 页面通信脚本

使用 `postMessage` API 实现页面与侧边栏的双向通信。

**支持的命令：**

| 命令 | 说明 | 返回数据 |
|------|------|----------|
| `AMZ_GRAB_REACT` | 抓取 React 组件树 | React 组件树数据 |
| `AMZ_GET_TEXT` | 获取页面文本 | `{ text: string }` |
| `AMZ_GET_HTML` | 获取页面 HTML | `{ html: string }` |

## 使用方法

### 在 side panel 中使用

```tsx
import { usePageCommunication } from './hooks/usePageCommunication'

function MyComponent() {
  const { grabReactTree, getPageText, isLoading, error } = usePageCommunication()

  const handleGrab = async () => {
    try {
      const reactData = await grabReactTree()
      console.log('React tree:', reactData)
    } catch (err) {
      console.error('Failed to grab React tree:', err)
    }
  }

  return (
    <div>
      <button onClick={handleGrab}>
        {isLoading ? '抓取中...' : '抓取 React 组件'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  )
}
```

### 在控制台中使用

```javascript
// 抓取 React 组件树
window.postMessage({ type: 'AMZ_GRAB_REACT' }, '*')

// 获取页面文本
window.postMessage({ type: 'AMZ_GET_TEXT' }, '*')

// 获取页面 HTML
window.postMessage({ type: 'AMZ_GET_HTML' }, '*')

// 自带 ID 跟踪（用于异步响应）
window.postMessage({ type: 'AMZ_GRAB_REACT', id: '123' }, '*')
```

## 消息流程

```
Side Panel → Background → Content Script → Page Script → React Components
    ↓              ↓              ↓
    ←←←←←← Response ←←←←←←←←←←←←←←←←←
```

1. **Side Panel** 发送消息到 Background
2. **Background** 转发消息到当前标签页的 Content Script
3. **Content Script** 通过 postMessage 发送到 Page Script
4. **Page Script** 执行操作（如调用 ReactGrab）
5. **响应** 沿原路返回

## 消息类型定义

### 请求消息

```typescript
interface AMZMessage {
  type: string    // 消息类型（如 'AMZ_GRAB_REACT'）
  data?: any      // 附加数据
  id?: string     // 消息 ID（用于异步响应）
}
```

### 响应消息

```typescript
interface AMZResponse {
  type: string    // 响应类型（如 'AMZ_REACT_DATA'）
  data?: any      // 响应数据
  id?: string     // 对应的请求 ID
  error?: string  // 错误信息
}
```

## 扩展功能

### 添加新的消息类型

1. 在 `src/content.ts` 的 `injectCommunicationScript` 中添加新的 case：

```typescript
case 'AMZ_CUSTOM_COMMAND':
  // 你的自定义逻辑
  window.postMessage({
    type: 'AMZ_CUSTOM_RESPONSE',
    data: { result: '...' },
    id: id
  }, '*')
  break
```

2. 在 `usePageCommunication.ts` 中添加对应的便捷方法：

```typescript
const customCommand = useCallback(async (param: string) => {
  return sendMessage({
    type: 'AMZ_CUSTOM_COMMAND',
    data: { param }
  })
}, [sendMessage])
```

3. 在 `PageCommunication` hook 返回值中添加该方法：

```typescript
return {
  // ...
  customCommand
}
```

## 注意事项

1. **CSP 限制**：某些网站可能限制外部脚本注入
2. **React 版本**：react-grab 适用于 React 16.8+ 的应用
3. **跨域限制**：注入脚本只能访问同源页面内容
4. **性能影响**：抓取大型 React 应用可能会有性能开销

## 调试

打开扩展调试模式：

1. 进入 `chrome://extensions/`
2. 开启"开发者模式"
3. 找到"AMZ Chat"扩展
4. 查看各个页面的控制台日志：
   - Background page
   - Service worker
   - 各个标签页的 content script

查看日志标识：
- 🚀 初始化成功
- ✅ react-grab 注入成功
- ❌ 注入失败
- 📨 收到消息
- 📡 脚本注入

## 故障排查

**问题**：react-grab 无法使用

**解决方案**：
1. 检查页面是否使用 React
2. 检查控制台是否有 CSP 错误
3. 尝试手动调用 `window.amzGrabReact()`

**问题**：消息无响应

**解决方案**：
1. 检查 content script 是否加载
2. 检查页面脚本是否注入
3. 查看 Background 和 Content script 的控制台日志
