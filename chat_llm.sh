#!/bin/bash

MODEL="qwen3.5-4b"

# 对话历史，纯内存保存
MESSAGES='[]'

# Ctrl+C 优雅退出
trap 'echo ""; exit 0' INT

echo "开始对话（输入 exit / quit / q 退出，输入 clear 清空历史）"
echo ""

while true; do
  if ! read -r -p "User: " user_input; then
    echo ""
    break
  fi

  # 空输入跳过
  [ -z "$user_input" ] && continue

  # 退出命令
  case "$user_input" in
    exit|quit|q)
      echo "再见！"
      break
      ;;
    clear)
      MESSAGES='[]'
      echo "（对话历史已清空）"
      echo ""
      continue
      ;;
  esac

  # 追加用户消息到历史
  MESSAGES=$(jq --arg content "$user_input" '. + [{role: "user", content: $content}]' <<< "$MESSAGES")

  # 构造请求 JSON
  JSON=$(jq -n --argjson messages "$MESSAGES" --arg model "$MODEL" '{
    model: $model,
    messages: $messages,
    stream: true
  }')

  # 流式调用并累积 assistant 回复
  assistant_content=""
  assistant_thinking=""
  thinking_started=false
  content_started=false
  anything_printed=false

  while IFS= read -r line; do
    thinking=$(jq -j -r '.message.thinking // ""' <<< "$line")
    content=$(jq -j -r '.message.content // ""' <<< "$line")

    if [ -n "$thinking" ]; then
      if [ "$thinking_started" = false ]; then
        [ "$anything_printed" = true ] && printf '\n'
        printf '思考内容：'
        thinking_started=true
      fi
      printf '%s' "$thinking"
      assistant_thinking+="$thinking"
      anything_printed=true
    fi

    if [ -n "$content" ]; then
      if [ "$content_started" = false ]; then
        [ "$anything_printed" = true ] && printf '\n'
        printf '回复：'
        content_started=true
      fi
      printf '%s' "$content"
      assistant_content+="$content"
      anything_printed=true
    fi
  done < <(curl -s -N http://localhost:11434/api/chat \
    -H "Content-Type: application/json" \
    -d "$JSON")

  echo ""

  if [ -z "$assistant_content" ]; then
    echo "（模型未返回内容，请确认 ollama serve 是否正常运行）"
    echo ""
    continue
  fi

  # 把 assistant 的正式回复追加到历史（thinking 不写入历史，避免干扰后续对话）
  MESSAGES=$(jq --arg content "$assistant_content" '. + [{role: "assistant", content: $content}]' <<< "$MESSAGES")

  echo ""
done
