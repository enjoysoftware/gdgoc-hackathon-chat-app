"use client";

import { MessageCircleQuestion } from "lucide-react";
import { BrushUpSuggestion } from "@/types/brushup";

const COLORS = [
  { text: "text-amber-400", bg: "bg-amber-400/10" },
  { text: "text-blue-400", bg: "bg-blue-400/10" },
  { text: "text-purple-400", bg: "bg-purple-400/10" },
];

interface SuggestionCardProps {
  suggestion: BrushUpSuggestion;
  index: number;
  onClick: (suggestion: BrushUpSuggestion) => void;
}

export default function SuggestionCard({
  suggestion,
  index,
  onClick,
}: SuggestionCardProps) {
  const color = COLORS[index % COLORS.length];

  return (
    <button
      type="button"
      onClick={() => onClick(suggestion)}
      className="flex-1 min-w-[200px] bg-[#0d1b33] hover:bg-[#122244] border border-gray-700/50 rounded-lg p-3 text-left transition-colors group"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`w-6 h-6 rounded-full ${color.bg} flex items-center justify-center`}
        >
          <MessageCircleQuestion size={13} className={color.text} />
        </div>
        <span className={`text-xs font-bold ${color.text}`}>
          {suggestion.category}
        </span>
      </div>
      <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
        {suggestion.question}
      </p>
    </button>
  );
}
