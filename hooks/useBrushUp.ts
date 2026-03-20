"use client";

import { useState, useCallback } from "react";
import { BrushUpAnalysis } from "@/types/brushup";

const buildPrompt = (draftText: string) =>
  `あなたは新人ITエンジニアの質問を改善する支援AIアシスタントです。
以下の質問の下書きを5W1Hの観点とソクラテス問答法で分析し、不足している情報や改善点を提案してください。

## 下書き
"""
${draftText}
"""

## 出力形式
以下のJSON形式のみを出力してください。マークダウンのコードブロックや説明文は一切付けず、JSONだけを返してください。
{"summary":"下書きの評価を1文で","suggestions":[{"category":"why","label":"なぜ（目的）","question":"具体的な質問文","isPresent":false}]}

## categoryの種類と分析基準
- why: 質問の目的・背景が明確か（ラベル：なぜ（目的））
- what: 何が問題なのかが具体的か（ラベル：何が（事象））
- who: 誰の視点・誰に聞いているかが明確か（ラベル：誰が（対象））
- when: いつ発生したか、時間的な情報があるか（ラベル：いつ（時期））
- where: どこで発生しているか（環境、コード箇所等）（ラベル：どこで（場所））
- how: どのように発生するか、再現手順があるか（ラベル：どのように（方法））

## ルール
- suggestionsには、下書きに不足している要素（isPresent: false）のみを含めてください（最大4つまで）。
- 各questionは、ユーザーが答えることで質問が改善されるような、具体的な問いかけにしてください。
- ソクラテス問答法の精神に基づき、ユーザー自身が気づきを得られるような問いにしてください。`;

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

      if (!response.ok) throw new Error("API request failed");

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
