# Chat System - 聊天系统

基于 Python WebSocket 的实时聊天系统。

## 文件结构

```
chat_system/
├── server.py    # Python WebSocket服务器
├── client.js    # JavaScript客户端
└── README.md    # 说明文档
```

## 功能特性

- ✅ 实时消息发送和接收
- ✅ 支持自定义用户名
- ✅ 消息历史记录（最多保存100条）
- ✅ 系统消息通知（用户加入/离开）
- ✅ 自动重连功能
- ✅ 广播消息到所有在线用户

## 运行方式

### 1. 启动服务器

确保已安装 Python 3.7+ 和 websockets 库：

```bash
pip install websockets
```

启动服务器：

```bash
python chat_system/server.py
```

服务器将在 `ws://localhost:8765` 运行。

### 2. 启动前端

确保前端页面能够访问到 `chat_system/client.js` 文件。

当页面加载完成后，聊天系统会自动初始化并连接到服务器。

## 技术实现

### 服务器端 (Python)

- 使用 `websockets` 库实现 WebSocket 协议
- 支持多个客户端同时连接
- 自动维护消息历史记录
- 消息广播功能

### 客户端 (JavaScript)

- 封装为 `ChatClient` 类
- 支持事件回调机制
- 自动重连功能
- 支持获取历史消息

## API 说明

### 服务器消息格式

**客户端发送的消息：**
```json
{
    "type": "message",
    "text": "Hello World"
}
```

**服务器广播的消息：**
```json
{
    "type": "message",
    "username": "Player_abc123",
    "text": "Hello World",
    "timestamp": "2024-01-01T12:00:00"
}
```

## 使用示例

```javascript
// 创建聊天客户端
const chatClient = new ChatClient();

// 设置用户名
chatClient.setUsername('MyPlayer');

// 监听消息
chatClient.onMessage((username, text) => {
    console.log(`${username}: ${text}`);
});

// 连接服务器
chatClient.connect('ws://localhost:8765');

// 发送消息
chatClient.sendMessage('Hello everyone!');
```

## 注意事项

1. 确保服务器和客户端在同一网络中可访问
2. 服务器默认监听 localhost，如需外部访问请修改绑定地址
3. 消息历史记录最多保存100条，超出后自动删除最早的消息