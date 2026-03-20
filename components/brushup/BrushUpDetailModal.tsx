"use client";

import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Target,
  AlertCircle,
  User,
  Clock,
  MapPin,
  Wrench,
} from "lucide-react";
import {
  BrushUpAnalysis,
  BrushUpSuggestion,
  SuggestionCategory,
} from "@/types/brushup";

const CATEGORY_CONFIG: Record<
  SuggestionCategory,
  { icon: React.ElementType; color: string; label: string }
> = {
  why: { icon: Target, color: "text-amber-400", label: "なぜ（目的）" },
  what: { icon: AlertCircle, color: "text-red-400", label: "何が（事象）" },
  who: { icon: User, color: "text-blue-400", label: "誰が（対象）" },
  when: { icon: Clock, color: "text-green-400", label: "いつ（時期）" },
  where: { icon: MapPin, color: "text-purple-400", label: "どこで（場所）" },
  how: { icon: Wrench, color: "text-teal-400", label: "どのように（方法）" },
};

const ALL_CATEGORIES: SuggestionCategory[] = [
  "why",
  "what",
  "who",
  "when",
  "where",
  "how",
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
  const missingMap = new Map(
    analysis.suggestions.map((s) => [s.category, s])
  );

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
                5W1H構造化チェック・ソクラテス問答法
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

          {/* Summary */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              総合評価
            </h3>
            <p className="text-sm text-gray-200">{analysis.summary}</p>
          </div>

          {/* 5W1H Checklist */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              5W1H チェックリスト
            </h3>
            <div className="space-y-2">
              {ALL_CATEGORIES.map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const Icon = config.icon;
                const missing = missingMap.get(cat);
                const isPresent = !missing;

                return (
                  <div
                    key={cat}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isPresent
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-[#1a2a47] border-gray-700/50 hover:border-amber-500/30 cursor-pointer"
                    }`}
                    onClick={() => {
                      if (missing) {
                        onSuggestionClick(missing);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-[140px]">
                      {isPresent ? (
                        <CheckCircle2 size={16} className="text-green-400" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-400" />
                      )}
                      <Icon size={14} className={config.color} />
                      <span className={`text-xs font-bold ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex-1">
                      {isPresent
                        ? "確認済み"
                        : missing.question}
                    </p>
                  </div>
                );
              })}
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
