# AMZ Chat

Chrome 侧边栏聊天扩展，使用 TypeScript 和 @lobechat/ui 构建。

## 功能

- 🔒 Chrome 侧边栏聊天界面
- 💬 多会话管理
- 🤖 与 relay server 通信（react-grab 格式）
- 🎨 使用 @lobechat/ui 组件库
- 💾 本地会话存储

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite + CRXJS
- **UI 库**: @lobehub/ui + TailwindCSS
- **状态管理**: Zustand
- **通信格式**: react-grab relayserver 格式

## 安装依赖

```bash
pnpm install
```

## 开发

```bash
pnpm dev
```

然后在 Chrome 中加载 `dist` 目录作为未打包的扩展。

## 构建

```bash
pnpm build
```

## 消息格式

### Relay Server → Client

```typescript
interface RelayServerMessage {
  type: 'message' | 'error' | 'status' | 'tool_call' | 'tool_result'
  payload: {
    message?: Message
    error?: string
    status?: string
    toolCall?: any
    toolResult?: any
  }
  timestamp: number
}
```

### Client → Relay Server

```typescript
interface RelayClientMessage {
  type: 'send_message' | 'reset' | 'ping'
  payload: {
    message?: string
    sessionId?: string
  }
  timestamp: number
}
```

## 使用

1. 点击扩展图标打开侧边栏
2. 开始聊天或创建新会话
3. 消息将发送到 relay server（待配置）

## 许可证

MIT
