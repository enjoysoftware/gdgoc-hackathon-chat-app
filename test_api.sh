#!/bin/bash

# APIのエンドポイントURL
URL="http://localhost:3000/api/gemini-response"

# 送信するプロンプト
PROMPT="Hello, how are you?"

echo "Testing API endpoint: $URL"
echo "Prompt: $PROMPT"
echo "----------------------------------------"

# curlコマンドを実行（-Nでストリーミングをリアルタイム表示、-X POSTでPOSTリクエスト）
curl -N -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"$PROMPT\"}"

echo -e "\n----------------------------------------"
echo "Test completed."
