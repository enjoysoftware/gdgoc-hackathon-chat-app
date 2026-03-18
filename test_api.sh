#!/bin/bash

# APIのエンドポイントURL
URL="http://localhost:3000/api/gemini-response"

# 送信するプロンプト
PROMPT="2024年のシステム開発タイムラインを作成してください。1月に要件定義、2月に設計、3月に開発を開始する流れで。JSON形式のデータ構造を提案してください。"

echo "Testing API endpoint: $URL"
echo "Prompt: $PROMPT"
echo "----------------------------------------"

# curlコマンドを実行（-Nでストリーミングをリアルタイム表示、-X POSTでPOSTリクエスト）
curl -N -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"$PROMPT\"}"

echo -e "\n----------------------------------------"
echo "Test completed."
