"use client";

import { useState, useEffect } from 'react';
import { X, BarChart2, RefreshCw } from 'lucide-react';
import { Message } from '@/types/message';

interface QuestionAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  mention: string;
  draftMessage: string;
}

function buildSvgPrompt(messages: Message[], mention: string, draftMessage: string): string {
  const entries = messages.map((m, i) => {
    const time = m.timestamp?.toDate
      ? m.timestamp.toDate().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '時刻不明';
    return `[${i + 1}] ${time} | ${m.senderName}: ${m.text}`;
  });

  if (draftMessage.trim()) {
    entries.push(`[${entries.length + 1}] 今 (下書き) | 自分: ${draftMessage} [下書き・未送信]`);
  }

  return `あなたはSVGグラフ生成の専門家です。
以下の時系列データを元に、時系列グラフをSVG形式で生成してください。

質問ID: @${mention}

時系列データ:
${entries.join('\n')}

要件:
- SVGのみ出力してください（説明文やコードブロックは不要）
- viewBox="0 0 800 500" を使用
- 背景色: #0b1426（ダークテーマ）
- 横軸: 時間軸（左から右へ時系列順）
- 縦軸: イベント番号またはユーザー
- 各イベントを円（cx/cy/r）で表し、時間軸上に配置
- イベント同士を折れ線（polyline）で繋ぐ
- 各イベントの短いラベルを表示（15文字以内に切り詰め）
- 通常イベントの色: イベント円は #3b82f6、線は #4b5563、テキストは #e5e7eb
- 「下書き」の最後のイベントは #f59e0b（オレンジ）で強調表示
- タイトルとして "@${mention} の時系列グラフ" を上部に表示
- フォント: font-family="sans-serif"
- SVGタグから始め、</svg>で終わること`;
}

function extractSvg(raw: string): string {
  const match = raw.match(/<svg[\s\S]*<\/svg>/i);
  return match ? match[0] : raw;
}

export default function QuestionAnalysisPanel({
  isOpen,
  onClose,
  messages,
  mention,
  draftMessage,
}: QuestionAnalysisPanelProps) {
  const [svgContent, setSvgContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setSvgContent('');

    const prompt = buildSvgPrompt(messages, mention, draftMessage);

    try {
      const response = await fetch('/api/gemini-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

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

  // 開いたときに自動生成
  useEffect(() => {
    if (isOpen && mention) {
      generate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mention]);

  const cleanSvg = svgContent ? extractSvg(svgContent) : '';

  return (
    <div
      className={`fixed right-0 top-0 h-screen w-[600px] bg-[#0b1426] border-l border-gray-800
                   transform transition-transform duration-300 z-50 flex flex-col
                   ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-blue-400" />
          <h2 className="text-white font-bold">質問分析: @{mention}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white
                       hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            再生成
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="px-4 py-2 bg-[#1e2f4d] border-b border-gray-800 flex-shrink-0 text-xs text-gray-400">
        <span>{messages.length} 件のメッセージ</span>
        {draftMessage.trim() && (
          <span className="ml-3 text-yellow-400">＋下書き（未送信）を含む</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-[#0b1426]">
        {error && (
          <div className="mb-3 px-3 py-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="h-full rounded-lg border border-gray-800 bg-[#0d1b2e] flex items-center justify-center min-h-[400px]">
          {loading && !cleanSvg && (
            <div className="text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-3" />
              <p className="text-sm">Geminiがグラフを生成中...</p>
            </div>
          )}

          {!loading && !cleanSvg && !error && (
            <div className="text-center text-gray-500">
              <BarChart2 size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">グラフが表示されます</p>
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
    </div>
  );
}
