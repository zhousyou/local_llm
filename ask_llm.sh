PROMPT="$*"

curl http://localhost:11434/api/chat -d '{
  "model": "qwen3.5-4b",
  "messages": [{"role": "user","content": "'"$PROMPT"'"}],
  "stream": false,
  "think": false
}' | jq -r '"思考内容：\n" + .message.thinking, "回复:\n" + .message.content'