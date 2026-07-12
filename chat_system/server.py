#!/usr/bin/env python3
import asyncio
import websockets
import json
import uuid
import os
import ssl
from datetime import datetime, timedelta

# 存储所有连接的客户端
clients = {}

# 存储聊天历史（最多保存100条消息）
chat_history = []
MAX_HISTORY = 100

# 存储在线玩家列表
online_players = []

# 存储被禁言的玩家 {player_id: end_time}
muted_players = {}
MAX_MUTE_TIME = 300  # 最大禁言时间5分钟（秒）

# 日志文件配置
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chat_server.log")
MAX_LOG_SIZE = 10 * 1024 * 1024  # 10MB

def init_log_file():
    """初始化日志文件"""
    try:
        # 如果日志文件超过最大大小，则备份并创建新文件
        if os.path.exists(LOG_FILE) and os.path.getsize(LOG_FILE) > MAX_LOG_SIZE:
            backup_file = LOG_FILE + ".backup"
            if os.path.exists(backup_file):
                os.remove(backup_file)
            os.rename(LOG_FILE, backup_file)
        
        # 写入日志头
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(f"\n{'='*60}\n")
            f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Chat Server Started\n")
            f.write(f"{'='*60}\n\n")
            
        print(f"Log file initialized: {LOG_FILE}")
        return True
    except Exception as e:
        print(f"Error initializing log file: {e}")
        return False

def write_to_log(message):
    """写入消息到日志文件"""
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(log_entry)
            
        return True
    except Exception as e:
        print(f"Error writing to log file: {e}")
        return False

# 不文明词汇库
PROHIBITED_WORDS = [
    # 英文脏话
    'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard', 'crap',
    'dick', 'piss', 'hell', 'idiot', 'stupid', 'moron', 'jerk',
    'loser', 'suck', 'sucks', 'sucking', 'sucker',
    # 中文脏话（拼音/常见变体）
    'caoni', 'nmb', 'tmd', 'nnd', 'woc', 'wocao', 'cao',
    'sb', 'rzb', 'dsb', 'nc', 'nm', 'mlgb', 'laji',
    'shabi', 'zhangbi', 'goubi', 'jiba', 'niubi',
    # 中文脏话（汉字）
    '操', '草', '妈的', '妈卖批', '傻逼', '煞笔', '煞比', '傻B',
    '狗日', '狗日的', '王八蛋', '混蛋', '滚犊子', '去死', '废物',
    '垃圾', '贱人', '婊子', '娘炮', '二货', '脑残', '智障',
    '神经病', '有病', '找死', '作死', '尼玛', '你妈', '操你',
    '日你', '卧槽', '我靠', '我操', '干你', '草泥马', '草你妈',
    '他妈', '他吗', '特么', '他妈的', '特么的', '大爷的',
    '奶奶的', '爷爷的', '祖宗的', '靠', '艹', '屌', '逼',
    # 变体和组合
    'f**k', 'sh*t', 'f u c k', 's h i t'
]

def filter_prohibited_words(text):
    """
    过滤文本中的不文明词汇
    将检测到的不文明词汇替换为 ****
    
    Args:
        text (str): 原始文本
        
    Returns:
        tuple: (过滤后的文本, 是否包含不文明词汇, 检测到的词汇列表)
    """
    if not text:
        return text, False, []
    
    filtered_text = text
    detected_words = []
    has_prohibited = False
    
    for word in PROHIBITED_WORDS:
        # 判断是否为中文（包含中文字符）
        is_chinese = any('\u4e00' <= char <= '\u9fff' for char in word)
        
        if is_chinese:
            # 中文词汇：直接匹配
            if word in filtered_text:
                has_prohibited = True
                detected_words.append(word)
                replacement = '*' * len(word)
                filtered_text = filtered_text.replace(word, replacement)
        else:
            # 英文词汇：不区分大小写匹配
            word_lower = word.lower()
            if word_lower in filtered_text.lower():
                has_prohibited = True
                detected_words.append(word)
                replacement = '*' * len(word)
                import re
                filtered_text = re.sub(re.escape(word_lower), replacement, filtered_text, flags=re.IGNORECASE)
    
    return filtered_text, has_prohibited, detected_words

async def broadcast(message, sender_id=None):
    """向所有客户端广播消息"""
    if clients:
        await asyncio.gather(
            *[client.send(message) for client_id, client in clients.items() if client_id != sender_id]
        )

def log_message(username, text):
    """记录消息到日志（控制台+文件）"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_msg = f"[{timestamp}] {username}: {text}"
    
    # 输出到控制台
    print(log_msg)
    
    # 写入到文件
    write_to_log(f"MESSAGE | {username} | {text}")

def log_event(event_type, details):
    """记录事件到日志"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_msg = f"[{timestamp}] [{event_type}] {details}"
    
    # 输出到控制台
    print(log_msg)
    
    # 写入到文件
    write_to_log(f"{event_type} | {details}")

async def notify_online_players():
    """通知所有在线玩家当前在线列表"""
    online_list_msg = json.dumps({
        "type": "online_players",
        "players": online_players
    })
    
    # 发送给所有在线玩家
    for client_id, client in clients.items():
        try:
            await client.send(online_list_msg)
        except Exception as e:
            print(f"Error sending online list to {client_id}: {e}")

def add_message(username, text):
    """添加消息到历史记录"""
    log_message(username, text)
    
    message = {
        "type": "message",
        "username": username,
        "text": text,
        "timestamp": datetime.now().isoformat()
    }
    chat_history.append(message)
    # 保持历史记录不超过MAX_HISTORY条
    if len(chat_history) > MAX_HISTORY:
        chat_history.pop(0)
    return message

async def handle_client(websocket):
    """处理单个客户端连接"""
    client_id = str(uuid.uuid4())
    clients[client_id] = websocket
    username = f"Player_{client_id[:8]}"
    
    # 添加到在线列表
    online_players.append({"id": client_id, "username": username})
    
    # 记录玩家连接事件
    log_event("CONNECT", f"Player connected | ID: {client_id} | Username: {username} | Total online: {len(clients)}")
    
    try:
        # 发送历史记录给新连接的玩家（已移除欢迎消息）
        if chat_history:
            history_msg = json.dumps({
                "type": "history",
                "messages": chat_history
            })
            await websocket.send(history_msg)
        
        # 发送当前在线玩家列表给所有人（包括新玩家）
        await notify_online_players()
        
        # 通知其他用户新玩家加入
        join_msg = json.dumps({
            "type": "system",
            "text": f"{username} has joined the chat"
        })
        await broadcast(join_msg, client_id)
        
        # 接收消息循环
        async for message in websocket:
            try:
                data = json.loads(message)
                
                if data.get("type") == "login":
                    # 用户登录，设置自定义用户名
                    new_username = data.get("username", username)
                    if new_username and new_username != username:
                        old_username = username
                        username = new_username
                        
                        # 更新在线列表中的用户名
                        for player in online_players:
                            if player["id"] == client_id:
                                player["username"] = username
                        
                        # 用户名变更（已移除广播通知）
                        # 重新同步在线列表
                        await notify_online_players()
                
                elif data.get("type") == "message":
                    # 普通消息
                    # 检查是否被禁言
                    if client_id in muted_players:
                        mute_end = muted_players[client_id]
                        if datetime.now() < mute_end:
                            remaining_seconds = int((mute_end - datetime.now()).total_seconds())
                            error_msg = json.dumps({
                                "type": "error",
                                "text": f"You are muted. Remaining time: {remaining_seconds} seconds"
                            })
                            await websocket.send(error_msg)
                            continue
                        else:
                            # 禁言时间已过，自动解禁
                            del muted_players[client_id]
                    
                    text = data.get("text", "").strip()
                    if text:
                        # 过滤不文明词汇
                        filtered_text, has_prohibited, detected_words = filter_prohibited_words(text)
                        
                        # 如果检测到不文明词汇，记录日志
                        if has_prohibited:
                            log_event("PROHIBITED_WORD", f"User: {username} | Words detected: {detected_words} | Original: {text} | Filtered: {filtered_text}")
                        
                        msg = add_message(username, filtered_text)
                        
                        # 广播给所有其他用户
                        await broadcast(json.dumps(msg), client_id)
                        # 同时发送给发送者确认
                        await websocket.send(json.dumps(msg))
                
                elif data.get("type") == "mute_player":
                    # 管理员禁言玩家
                    target_id = data.get("target_id")
                    duration = min(data.get("duration", 60), MAX_MUTE_TIME)  # 限制最大5分钟
                    
                    if target_id and duration > 0:
                        mute_end_time = datetime.now() + timedelta(seconds=duration)
                        muted_players[target_id] = mute_end_time
                        
                        # 获取被禁言玩家的昵称
                        muted_username = 'Player'
                        for player in online_players:
                            if player["id"] == target_id:
                                muted_username = player.get("username", "Player")
                                break
                        
                        # 记录禁言事件
                        log_event("MUTE", f"Admin muted player | Target: {muted_username} ({target_id}) | Duration: {duration}s | Until: {mute_end_time.strftime('%Y-%m-%d %H:%M:%S')}")
                        
                        # 通知被禁言的玩家
                        if target_id in clients:
                            mute_notification = json.dumps({
                                "type": "muted",
                                "duration": duration,
                                "end_time": mute_end_time.isoformat()
                            })
                            await clients[target_id].send(mute_notification)
                        
                        # 广播系统消息（通知所有人，包含玩家昵称）
                        system_msg = {
                            "type": "system",
                            "text": f"{muted_username} has been muted for {duration} seconds",
                            "timestamp": datetime.now().isoformat()
                        }
                        await broadcast(json.dumps(system_msg))
                
                elif data.get("type") == "unmute_player":
                    # 管理员解除禁言
                    target_id = data.get("target_id")
                    
                    if target_id and target_id in muted_players:
                        del muted_players[target_id]
                        
                        # 获取被解禁玩家的昵称
                        unmuted_username = 'Player'
                        for player in online_players:
                            if player["id"] == target_id:
                                unmuted_username = player.get("username", "Player")
                                break
                        
                        # 记录解禁事件
                        log_event("UNMUTE", f"Admin unmuted player | Target: {unmuted_username} ({target_id})")
                        
                        # 通知被解禁的玩家
                        if target_id in clients:
                            unmute_notification = json.dumps({
                                "type": "unmuted"
                            })
                            await clients[target_id].send(unmute_notification)
                
                elif data.get("type") == "get_history":
                    # 请求所有历史记录
                    history_msg = json.dumps({
                        "type": "history",
                        "messages": chat_history
                    })
                    await websocket.send(history_msg)
                
                elif data.get("type") == "get_recent":
                    # 请求最近N条历史记录（默认5条）
                    count = data.get("count", 5)
                    recent_messages = chat_history[-count:] if len(chat_history) > count else chat_history
                    recent_msg = json.dumps({
                        "type": "recent",
                        "messages": recent_messages
                    })
                    await websocket.send(recent_msg)
                
                elif data.get("type") == "system_broadcast":
                    # 管理员发送系统广播消息
                    text = data.get("text", "").strip()
                    if text:
                        system_msg = {
                            "type": "system",
                            "text": text,
                            "timestamp": datetime.now().isoformat()
                        }
                        # 广播给所有在线用户
                        await broadcast(json.dumps(system_msg))
                        # 添加到历史记录
                        chat_history.append(system_msg)
                        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Admin broadcast: {text}")
            
            except json.JSONDecodeError:
                print(f"Invalid JSON from {client_id}")
    
    except websockets.exceptions.ConnectionClosed:
        pass
    
    finally:
        # 客户端断开连接
        del clients[client_id]
        
        # 从在线列表移除
        online_players[:] = [p for p in online_players if p["id"] != client_id]
        
        # 记录玩家断开事件
        log_event("DISCONNECT", f"Player disconnected | ID: {client_id} | Username: {username} | Total online: {len(clients)}")
        
        # 通知其他用户离开
        leave_msg = json.dumps({
            "type": "system",
            "text": f"{username} has left the chat"
        })
        await broadcast(leave_msg)
        
        # 更新在线玩家列表
        await notify_online_players()

async def main():
    """启动WebSocket服务器"""
    # 初始化日志文件
    init_log_file()
    
    # 配置SSL上下文
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    cert_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cert.pem")
    key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "key.pem")
    ssl_context.load_cert_chain(certfile=cert_path, keyfile=key_path)
    
    async with websockets.serve(handle_client, "0.0.0.0", 8765, ssl=ssl_context):
        print("=" * 50)
        print("Chat Server Started")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("Listening on wss://0.0.0.0:8765")
        print(f"Log file: {LOG_FILE}")
        print("=" * 50)
        
        # 记录服务器启动事件
        log_event("SERVER", "Server started on wss://0.0.0.0:8765")
        
        await asyncio.Future()  # 无限运行

if __name__ == "__main__":
    asyncio.run(main())
