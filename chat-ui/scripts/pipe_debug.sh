#!/bin/bash

# 用法：./pipe_debug.sh <命令...>
# 示例：./pipe_debug.sh ./ask_llm_stream.sh 你好
# 该脚本会将命令的 stdout/stderr 实时推送到前端调试页面

API_URL="${DEBUG_API_URL:-http://localhost:5173/api/debug/log}"

if [ $# -eq 0 ]; then
  echo "用法: $0 <命令...>" >&2
  exit 1
fi

send_log() {
  local type="$1"
  local content="$2"
  local payload
  payload=$(jq -n --arg type "$type" --arg content "$content" '{type: $type, content: $content}')
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$payload" >/dev/null 2>&1
}

# 发送开始标记
send_log "info" "开始执行: $*"

# 同时捕获 stdout 和 stderr，逐行推送
"$@" > >(while IFS= read -r line; do
  echo "$line"
  send_log "stdout" "$line"
done) 2> >(while IFS= read -r line; do
  echo "$line" >&2
  send_log "stderr" "$line"
done)

exit_code=$?

# 发送结束标记
send_log "info" "命令结束，退出码: $exit_code"

exit $exit_code
