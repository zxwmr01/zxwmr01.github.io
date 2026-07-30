import telebot
import requests
import json
from datetime import datetime
import os

# ========== 配置 ==========
TOKEN = "8853011458:AAGeVUWfxRrpo-qczx4mZUeBnCxJPLyFfPM"   # 已替换为新 Token
LOG_FILE = "/storage/emulated/0/机器人/usage.log"

bot = telebot.TeleBot(TOKEN)

# ========== 日志记录 ==========
def log_usage(user_id, command, args=""):
    log_dir = os.path.dirname(LOG_FILE)
    if not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{timestamp},{user_id},{command},{args}\n")

# ========== API 调用 ==========
def call_api(url):
    try:
        resp = requests.get(url, timeout=10)
        return resp.json()
    except:
        return {"code": -1, "msg": "请求失败"}

def clean_response(data):
    """递归删除所有 api_info 字段"""
    if isinstance(data, dict):
        data.pop("api_info", None)
        for key, value in list(data.items()):
            if isinstance(value, dict):
                clean_response(value)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        clean_response(item)
    elif isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                clean_response(item)
    return data

# ========== 命令 ==========
@bot.message_handler(commands=['start', 'help'])
def help_cmd(message):
    text = """
📌 可用命令：

/wy 手机号 - 网易云查注册
/tyc 统一代码 - 天眼查法人
/yysys 姓名 手机号 身份证 - 运营商三要素
/ptsys 姓名 手机号 身份证 - 普通三要素
/sfzey 姓名 身份证 - 二要素
/kasi 姓名 身份证 手机号 银行卡 - 卡四
/kasan 姓名 身份证 银行卡 - 卡三
/qq QQ号 - QQ综合查询
/hjd 身份证号 - 户籍地
/hp 游戏昵称 - 和平精英
/wzry 王者昵称 - 王者荣耀

示例：
/wy 13812345678
/qq 123456789
/hjd 11010119900307663X
"""
    bot.reply_to(message, text)

@bot.message_handler(commands=['wy'])
def wy_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 2:
        bot.reply_to(message, "用法: /wy 手机号")
        return
    phone = args[1]
    log_usage(user_id, "/wy", phone)
    data = call_api(f"http://ay.linyukjwxym.cn/API/WWYAPI/WYY.php?phone={phone}")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

@bot.message_handler(commands=['tyc'])
def tyc_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 2:
        bot.reply_to(message, "用法: /tyc 社会统一信用代码")
        return
    xy = args[1]
    log_usage(user_id, "/tyc", xy)
    data = call_api(f"http://ay.linyukjwxym.cn/API/TYCFAAPI/TYCFR.php?xy={xy}")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

@bot.message_handler(commands=['yysys'])
def yysys_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 4:
        bot.reply_to(message, "用法: /yysys 姓名 手机号 身份证")
        return
    name, phone, idcard = args[1], args[2], args[3]
    log_usage(user_id, "/yysys", f"{name} {phone} {idcard}")
    data = call_api(f"http://ay.linyukjwxym.cn/API/YYSSAYAPI/SYA.php?name={name}&phone={phone}&idcard={idcard}")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

@bot.message_handler(commands=['ptsys'])
def ptsys_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 4:
        bot.reply_to(message, "用法: /ptsys 姓名 手机号 身份证")
        return
    name, sjh, sfz = args[1], args[2], args[3]
    log_usage(user_id, "/ptsys", f"{name} {sjh} {sfz}")
    data = call_api(f"http://ay.linyukjwxym.cn/API/PTSYSAPI/SYS.php?name={name}&sfz={sfz}&sjh={sjh}")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

@bot.message_handler(commands=['sfzey'])
def sfzey_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 3:
        bot.reply_to(message, "用法: /sfzey 姓名 身份证")
        return
    name, sfz = args[1], args[2]
    log_usage(user_id, "/sfzey", f"{name} {sfz}")
    data = call_api(f"http://ay.linyukjwxym.cn/API/RYSAPI/RYS.php?name={name}&sfz={sfz}")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

@bot.message_handler(commands=['kasi'])
def kasi_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 5:
        bot.reply_to(message, "用法: /kasi 姓名 身份证 手机号 银行卡")
        return
    name, sfz, sjh, yhk = args[1], args[2], args[3], args[4]
    log_usage(user_id, "/kasi", f"{name} {sfz} {sjh} {yhk}")
    data = call_api(f"http://ay.linyukjwxym.cn/API/KASIAPI/KASI.php?name={name}&sfz={sfz}&sjh={sjh}&yhk={yhk}")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

@bot.message_handler(commands=['kasan'])
def kasan_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 4:
        bot.reply_to(message, "用法: /kasan 姓名 身份证 银行卡")
        return
    name, sfz, yhk = args[1], args[2], args[3]
    log_usage(user_id, "/kasan", f"{name} {sfz} {yhk}")
    data = call_api(f"http://ay.linyukjwxym.cn/API/KASANAPI/KASAN.php?name={name}&sfz={sfz}&yhk={yhk}")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

@bot.message_handler(commands=['qq'])
def qq_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 2:
        bot.reply_to(message, "用法: /qq QQ号")
        return
    qq = args[1]
    log_usage(user_id, "/qq", qq)
    data = call_api(f"https://ay.linyukjwxym.cn/API/QQCXAPI/QQ.php?qq={qq}")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

@bot.message_handler(commands=['hjd'])
def hjd_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 2:
        bot.reply_to(message, "用法: /hjd 身份证号")
        return
    sfz = args[1]
    log_usage(user_id, "/hjd", sfz)
    data = call_api(f"https://ay.linyukjwxym.cn/API/QGHJDAPIKB/HJD.php?sfz={sfz}")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

@bot.message_handler(commands=['hp'])
def hp_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 2:
        bot.reply_to(message, "用法: /hp 游戏昵称")
        return
    nc = args[1]
    log_usage(user_id, "/hp", nc)
    data = call_api(f"https://ay.linyukjwxym.cn/API/HPJYAPI/HPAPI.php?nc={nc}&select=1")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

@bot.message_handler(commands=['wzry'])
def wzry_cmd(message):
    user_id = message.from_user.id
    args = message.text.split()
    if len(args) < 2:
        bot.reply_to(message, "用法: /wzry 王者昵称")
        return
    name = args[1]
    log_usage(user_id, "/wzry", name)
    data = call_api(f"https://ay.linyukjwxym.cn/API/WZRYAPI/WZRY.php?name={name}")
    data = clean_response(data)
    bot.reply_to(message, json.dumps(data, ensure_ascii=False, indent=2)[:4000])

# ========== 启动 ==========
if __name__ == "__main__":
    print("🤖 API查询机器人已启动")
    print("命令列表：/wy /tyc /yysys /ptsys /sfzey /kasi /kasan /qq /hjd /hp /wzry")
    print(f"📝 使用记录将保存到 {LOG_FILE}")
    bot.infinity_polling()