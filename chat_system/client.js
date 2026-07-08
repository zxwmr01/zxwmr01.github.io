// 聊天系统客户端 - 极简版（带强制反馈）
class ChatClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.username = 'Anonymous';
        this.connectUrl = 'ws://localhost:8765';
        
        this.onMessageCallback = null;
        this.onSystemMessageCallback = null;
        this.onConnectedCallback = null;
        this.onDisconnectedCallback = null;
        this.onConnectFailedCallback = null;
        
        // 强制日志记录
        this.logs = [];
    }

    log(msg) {
        this.logs.push(new Date().toLocaleTimeString() + ': ' + msg);
        console.log('[Chat]', msg);
        
        // 尝试在页面显示
        try {
            var el = document.getElementById('chat-status');
            if (el) el.textContent = msg;
            
            var logEl = document.getElementById('chat-logs');
            if (logEl) {
                var div = document.createElement('div');
                div.textContent = msg;
                logEl.appendChild(div);
                logEl.scrollTop = logEl.scrollHeight;
            }
        } catch(e) {}
    }

    init(playerName) {
        this.log('init() called with name: ' + playerName);
        this.username = playerName || 'Player';
        
        // 立即尝试连接
        this.log('Attempting WebSocket...');
        this.connect();
    }

    connect() {
        // 检查WebSocket支持
        if (typeof WebSocket === 'undefined') {
            this.log('ERROR: WebSocket not available');
            this.fail('No WebSocket');
            return;
        }
        
        this.log('Creating new WebSocket...');

        try {
            var ws = new WebSocket(this.connectUrl);
            
            // 3秒超时
            var timer = setTimeout(() => {
                this.log('Connection timeout');
                try { ws.close(); } catch(e) {}
                this.fail('Timeout');
            }, 3000);

            ws.onopen = () => {
                clearTimeout(timer);
                this.socket = ws;
                this.isConnected = true;
                this.log('CONNECTED!');
                
                // 发送登录
                try {
                    ws.send(JSON.stringify({type:'login', username:this.username}));
                    this.log('Login sent as: ' + this.username);
                } catch(e) {
                    this.log('Send login failed: ' + e.message);
                }
                
                if (this.onConnectedCallback) {
                    try { this.onConnectedCallback(); } catch(e) {}
                }
            };

            ws.onmessage = (e) => {
                try {
                    var m = JSON.parse(e.data);
                    if (m.type === 'message' && this.onMessageCallback) {
                        this.onMessageCallback(m.username, m.text);
                    } else if (m.type === 'system' && this.onSystemMessageCallback) {
                        this.onSystemMessageCallback(m.text);
                    }
                } catch(err) {
                    this.log('Parse error: ' + err.message);
                }
            };

            ws.onerror = () => {
                clearTimeout(timer);
                this.log('WebSocket ERROR event');
                try { ws.close(); } catch(e) {}
                this.fail('Error');
            };

            ws.onclose = (e) => {
                this.log('Closed: code=' + e.code + ' reason=' + e.reason);
                this.isConnected = false;
                this.socket = null;
                if (this.onDisconnectedCallback) {
                    try { this.onDisconnectedCallback(); } catch(ex) {}
                }
            };

        } catch(e) {
            this.log('Exception: ' + e.message);
            this.fail('Exception: ' + e.message);
        }
    }

    fail(reason) {
        this.log('FAILED: ' + reason);
        if (this.onConnectFailedCallback) {
            try { this.onConnectFailedCallback(reason); } catch(e) {}
        }
    }

    sendMessage(text) {
        if (!this.isConnected || !this.socket || !text || !text.trim()) return;
        try {
            this.socket.send(JSON.stringify({type:'message', text:text.trim()}));
        } catch(e) {}
    }

    setUsername(name) {
        this.username = name;
        if (this.isConnected && this.socket) {
            try {
                this.socket.send(JSON.stringify({type:'login', username:name}));
            } catch(e) {}
        }
    }

    onMessage(cb) { this.onMessageCallback = cb; }
    onSystemMessage(cb) { this.onSystemMessageCallback = cb; }
    onConnected(cb) { this.onConnectedCallback = cb; }
    onDisconnected(cb) { this.onDisconnectedCallback = cb; }
    onConnectFailed(cb) { this.onConnectFailedCallback = cb; }

    disconnect() {
        try { if(this.socket) this.socket.close(); } catch(e) {}
        this.socket = null;
        this.isConnected = false;
    }
}