"use client";

import { X, Sparkles, Loader2 } from "lucide-react";
import { BrushUpAnalysis, BrushUpSuggestion } from "@/types/brushup";
import SuggestionCard from "./SuggestionCard";

interface BrushUpPanelProps {
  analysis: BrushUpAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  onClose: () => void;
  onSuggestionClick: (suggestion: BrushUpSuggestion) => void;
  onDetailClick: () => void;
}

export default function BrushUpPanel({
  analysis,
  isAnalyzing,
  error,
  onClose,
  onSuggestionClick,
  onDetailClick,
}: BrushUpPanelProps) {
  return (
    <div className="mb-3 bg-[#152038] border border-amber-500/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Sparkles size={13} className="text-amber-400" />
          </div>
          <span className="text-sm font-bold text-white">
            AIブラッシュアップ・アシスタント
          </span>
          <span className="text-xs text-gray-400">（下書きの分析）</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {/* Analyzing state */}
        {isAnalyzing && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 size={18} className="text-amber-400 animate-spin" />
            <div>
              <p className="text-xs font-bold text-green-400 tracking-wider">
                ANALYZING DRAFT...（下書きを分析中）
              </p>
              <p className="text-xs text-gray-500 mt-1">
                質問の構造を5W1Hの観点で分析しています
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Analysis result */}
        {analysis && !isAnalyzing && (
          <>
            <p className="text-sm text-gray-300 mb-3">
              {analysis.summary ||
                "現在の下書きに基づき、より的確な回答を得るために詳細を補足しませんか？"}
            </p>

            {analysis.suggestions.length > 0 ? (
              <div className="flex gap-2 mb-3 flex-wrap">
                {analysis.suggestions.map((suggestion, idx) => (
                  <SuggestionCard
                    key={`${suggestion.category}-${idx}`}
                    suggestion={suggestion}
                    onClick={onSuggestionClick}
                  />
                ))}
              </div>
            ) : (
              <div className="py-2 mb-3">
                <p className="text-sm text-green-400">
                  この質問は十分に構造化されています！
                </p>
              </div>
            )}

            {/* Detail button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onDetailClick}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles size={13} />
                詳細に分析する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
