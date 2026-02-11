# AMZ Chat 扩展加载指南

## 开发服务器状态

✅ Dev server 运行中 (端口 5174)
📦 构建输出: `amz/dist/`

## 加载扩展到浏览器

### 方法 1: 通过浏览器扩展页面加载（推荐）

1. 打开 Brave 或 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角 **"开发者模式"** 开关
4. 点击 **"加载已解压的扩展程序"** 按钮
5. 选择 `/Users/chao/.openclaw/workspace/amz/dist` 目录
6. 扩展会出现在列表中

### 方法 2: 通过命令行加载

```bash
# macOS
/Applications/Brave\ Browser.app/Contents/MacOS/Brave\ Browser --load-extension=/Users/chao/.openclaw/workspace/amz/dist

# Chrome
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --load-extension=/Users/chao/.openclaw/workspace/amz/dist
```

## 使用扩展

加载完成后：

1. **点击工具栏图标**：AMZ Chat 侧边栏会打开
2. **开始聊天**：输入消息并按回车
3. **管理会话**：使用左侧会话列表
4. **查看 React 组件树**：页面会自动注入 react-grab

## 热重载

开发模式下，代码修改会自动重新编译。刷新侧边栏即可看到更新。

## 预览

打开 `preview.html` 查看静态预览：

```bash
open /Users/chao/.openclaw/workspace/amz/preview.html
```
