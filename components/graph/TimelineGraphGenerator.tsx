"use client";

import { useState } from 'react';
import { TimelineEntry } from '@/types/graph';
import { BarChart2, RefreshCw } from 'lucide-react';

interface TimelineGraphGeneratorProps {
  timeline: TimelineEntry[];
  problemId: string;
}

function buildSvgPrompt(timeline: TimelineEntry[], problemId: string): string {
  const entries = timeline
    .map((e, i) => `[${i + 1}] ${e.timestamp} | ${e.user}: ${e.short}`)
    .join('\n');

  return `あなたはSVGグラフ生成の専門家です。
以下の時系列データを元に、時系列グラフをSVG形式で生成してください。

問題ID: ${problemId}

時系列データ:
${entries}

要件:
- SVGのみ出力してください（説明文やコードブロックは不要）
- viewBox="0 0 800 400" を使用
- 背景色: #0b1426（ダークテーマ）
- 横軸: 時間軸（左から右へ時系列順）
- 縦軸: イベント番号またはユーザー
- 各イベントを円（cx/cy/r）で表し、時間軸上に配置
- イベント同士を折れ線（polyline）で繋ぐ
- 各イベントの短いラベルを表示（15文字以内に切り詰め）
- 色: イベント円は #3b82f6、線は #4b5563、テキストは #e5e7eb
- タイトルとして問題ID "${problemId} の時系列グラフ" を上部に表示
- フォント: font-family="sans-serif"
- SVGタグから始め、</svg>で終わること`;
}

export default function TimelineGraphGenerator({
  timeline,
  problemId,
}: TimelineGraphGeneratorProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGraph = async () => {
    if (timeline.length === 0) {
      setError('タイムラインデータがありません');
      return;
    }

    setLoading(true);
    setError(null);
    setSvgContent('');

    const prompt = buildSvgPrompt(timeline, problemId);

    try {
      const response = await fetch('/api/gemini-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('レスポンスの読み取りに失敗しました');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setSvgContent(accumulated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // SVGタグだけを抽出する
  const extractSvg = (raw: string): string => {
    const match = raw.match(/<svg[\s\S]*<\/svg>/i);
    return match ? match[0] : raw;
  };

  const cleanSvg = svgContent ? extractSvg(svgContent) : '';

  return (
    <div className="h-full flex flex-col p-4 bg-[#0b1426]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-300">
          <BarChart2 size={18} className="text-blue-400" />
          <span className="text-sm font-medium">AI時系列グラフ</span>
        </div>
        <button
          onClick={generateGraph}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                     disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? '生成中...' : 'グラフを生成'}
        </button>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto rounded-lg border border-gray-800 bg-[#0d1b2e] flex items-center justify-center">
        {!svgContent && !loading && (
          <div className="text-center text-gray-500">
            <BarChart2 size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">「グラフを生成」をクリックしてください</p>
          </div>
        )}

        {loading && !cleanSvg && (
          <div className="text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-2" />
            <p className="text-sm">Geminiがグラフを生成中...</p>
          </div>
        )}

        {cleanSvg && (
          <div
            className="w-full h-full p-2"
            dangerouslySetInnerHTML={{ __html: cleanSvg }}
          />
        )}
      </div>
    </div>
  );
}
