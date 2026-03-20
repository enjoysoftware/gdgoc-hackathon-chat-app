"use client";

import { useState, useCallback } from "react";
import { BrushUpAnalysis, BrushUpReviewResponse } from "@/types/brushup";

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

const DETAILED_REVIEW_PROMPT = `# 指示
あなたは長年の経験を持つベテランのソフトウェアエンジニアです。ユーザーの入力テキスト（文章、コード、設計メモなど）をレビューし、プロフェッショナルな視点で改善点のみを指摘してください。

# 振る舞いとルール
- 挨拶、前置き、まとめの言葉は一切省き、指定されたJSONフォーマットのみを出力すること。
- 修正後のテキスト（完成形）は絶対に提示せず、どこをどう直すべきかの指摘と解説に留めること。
- 技術的な正確性、可読性、保守性の観点から、説得力のある解説を行うこと。
- 専門的かつ建設的なトーンで、ユーザー自身の気づきと成長につながるアドバイスを心がけること。
- 情報過多を防ぐため、指摘事項は最も重要なものから順に「最大3つまで」に厳選すること。

# 出力形式
TypeScriptアプリケーションで安全にパースするため、必ず以下のJSONスキーマに従って出力してください。Markdownの装飾（\`\`\`json など）や、JSON以外のテキストは絶対に含めないでください。

{
  "reviews": [
    {
      "title": "指摘内容の短い見出し（例：ロジックの簡略化）",
      "description": "元のテキストのどの部分に課題があるのか、どのようなアプローチで改善すべきか、ベテランエンジニアとしての理由や背景を2〜3文程度で解説します。"
    }
  ]
}`;

const buildDetailedReviewPrompt = (draftText: string) =>
  `${DETAILED_REVIEW_PROMPT}

# ユーザー入力テキスト
"""
${draftText}
"""`;

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

  const analyzeDetailedReview = useCallback(async (draftText: string) => {
    if (!draftText.trim()) return false;
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildDetailedReviewPrompt(draftText),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Detailed review API error:", response.status, errorBody);
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

      const parsed = JSON.parse(jsonStr) as BrushUpReviewResponse;
      setAnalysis({
        suggestions: (parsed.reviews || []).map((review) => ({
          category: review.title,
          question: review.description,
        })),
      });
      return true;
    } catch (err) {
      console.error("Detailed review failed:", err);
      setError("詳細分析に失敗しました。もう一度お試しください。");
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return { analysis, isAnalyzing, error, analyzeDraft, analyzeDetailedReview, reset };
}
