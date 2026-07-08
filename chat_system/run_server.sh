#!/bin/bash

while true; do
    python3 server.py
    echo "server.py 已退出，3秒后自动重启..."
    sleep 3
done