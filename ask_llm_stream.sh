#!/bin/bash

PROMPT="$*"

# 安全构造 JSON，避免 prompt 里的引号破坏 JSON
JSON=$(jq -n --arg prompt "$PROMPT" '{
  model: "qwen3.5-4b",
  messages: [{role: "user", content: $prompt}],
  stream: true
}')

# 状态标记（在管道子 shell 的 while 循环内跨迭代有效）
thinking_started=false
content_started=false
anything_printed=false

curl -s -N http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d "$JSON" | while IFS= read -r line; do
  thinking=$(jq -j -r '.message.thinking // ""' <<< "$line")
  content=$(jq -j -r '.message.content // ""' <<< "$line")

  if [ -n "$thinking" ]; then
    if [ "$thinking_started" = false ]; then
      [ "$anything_printed" = true ] && printf '\n'
      printf '思考内容：'
      thinking_started=true
    fi
    printf '%s' "$thinking"
    anything_printed=true
  fi

  if [ -n "$content" ]; then
    if [ "$content_started" = false ]; then
      [ "$anything_printed" = true ] && printf '\n'
      printf '回复：'
      content_started=true
    fi
    printf '%s' "$content"
    anything_printed=true
  fi
done

echo ""
