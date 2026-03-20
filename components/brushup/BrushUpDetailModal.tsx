"use client";

import { X, Sparkles, AlertTriangle, MessageCircleQuestion } from "lucide-react";
import { BrushUpAnalysis, BrushUpSuggestion } from "@/types/brushup";

const COLORS = [
  { text: "text-amber-400", bg: "bg-amber-400/10" },
  { text: "text-blue-400", bg: "bg-blue-400/10" },
  { text: "text-purple-400", bg: "bg-purple-400/10" },
];

interface BrushUpDetailModalProps {
  analysis: BrushUpAnalysis;
  draftText: string;
  onClose: () => void;
  onSuggestionClick: (suggestion: BrushUpSuggestion) => void;
}

export default function BrushUpDetailModal({
  analysis,
  draftText,
  onClose,
  onSuggestionClick,
}: BrushUpDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1d35] border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">詳細分析</h2>
              <p className="text-xs text-gray-400">
                不足情報のチェック
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Draft preview */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              下書き内容
            </h3>
            <div className="bg-[#1a2a47] rounded-lg p-3 text-sm text-gray-300 border border-gray-700/50 whitespace-pre-wrap">
              {draftText}
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              追記すべき情報（{analysis.suggestions.length}件）
            </h3>
            <div className="space-y-2">
              {analysis.suggestions.map((suggestion, idx) => {
                const color = COLORS[idx % COLORS.length];

                return (
                  <div
                    key={`${suggestion.category}-${idx}`}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-[#1a2a47] border-gray-700/50 hover:border-amber-500/30 cursor-pointer transition-colors"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <AlertTriangle size={16} className="text-amber-400" />
                      <MessageCircleQuestion size={14} className={color.text} />
                      <span className={`text-xs font-bold ${color.text}`}>
                        {suggestion.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex-1">
                      {suggestion.question}
                    </p>
                  </div>
                );
              })}

              {analysis.suggestions.length === 0 && (
                <div className="p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                  <p className="text-sm text-green-400">
                    この質問は十分に構造化されています！
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
