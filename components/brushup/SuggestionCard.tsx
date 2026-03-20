"use client";

import {
  Target,
  AlertCircle,
  User,
  Clock,
  MapPin,
  Wrench,
} from "lucide-react";
import { BrushUpSuggestion, SuggestionCategory } from "@/types/brushup";

const CATEGORY_CONFIG: Record<
  SuggestionCategory,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  why: { icon: Target, color: "text-amber-400", bgColor: "bg-amber-400/10" },
  what: {
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
  },
  who: { icon: User, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  when: { icon: Clock, color: "text-green-400", bgColor: "bg-green-400/10" },
  where: {
    icon: MapPin,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  how: { icon: Wrench, color: "text-teal-400", bgColor: "bg-teal-400/10" },
};

interface SuggestionCardProps {
  suggestion: BrushUpSuggestion;
  onClick: (suggestion: BrushUpSuggestion) => void;
}

export default function SuggestionCard({
  suggestion,
  onClick,
}: SuggestionCardProps) {
  const config = CATEGORY_CONFIG[suggestion.category];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(suggestion)}
      className="flex-1 min-w-[200px] bg-[#0d1b33] hover:bg-[#122244] border border-gray-700/50 rounded-lg p-3 text-left transition-colors group"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`w-6 h-6 rounded-full ${config.bgColor} flex items-center justify-center`}
        >
          <Icon size={13} className={config.color} />
        </div>
        <span className={`text-xs font-bold ${config.color}`}>
          {suggestion.label}
        </span>
      </div>
      <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
        {suggestion.question}
      </p>
    </button>
  );
}
