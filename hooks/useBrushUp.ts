"use client";

import { useState, useCallback } from "react";
import { BrushUpAnalysis } from "@/types/brushup";

const SYSTEM_PROMPT = `あなたは長年の経験を持つベテランエンジニアです。
チームメンバーがチャットに投稿しようとしている「障害報告や質問の下書き」を読み、より早く的確な問題解決に繋がるように、不足している情報を引き出してください。
ユーザーが下書きに追記すべき情報を、具体的な質問（サジェスト）として最大3点提案してください。`;

const buildPrompt = (draftText: string) =>
  `${SYSTEM_PROMPT}

## 下書き
"""
${draftText}
"""

## 出力形式
以下のJSON形式のみを出力してください。マークダウンのコードブロックや説明文は一切付けず、JSONだけを返してください。
{"suggestions":[{"category":"質問の短いカテゴリラベル","question":"ユーザーに問いかける具体的で簡潔な質問文"}]}

## ルール
- suggestionsは最大3つまで。
- categoryは短いカテゴリラベル（例：「なぜ（目的）」「対象（どこで）」「いつ（発生条件）」など）。
- questionはユーザーが答えることで質問が改善されるような、具体的で簡潔な問いかけにしてください。`;

export function useBrushUp() {
  const [analysis, setAnalysis] = useState<BrushUpAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDraft = useCallback(async (draftText: string) => {
    if (!draftText.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/gemini-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(draftText) }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API error response:", response.status, errorBody);
        throw new Error(`API request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      let jsonStr = fullText.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr
          .replace(/^```(?:json)?\n?/, "")
          .replace(/\n?```$/, "");
      }

      const parsed: BrushUpAnalysis = JSON.parse(jsonStr);
      setAnalysis(parsed);
    } catch (err) {
      console.error("BrushUp analysis failed:", err);
      setError("分析に失敗しました。もう一度お試しください。");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return { analysis, isAnalyzing, error, analyzeDraft, reset };
}
