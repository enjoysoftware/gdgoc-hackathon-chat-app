export interface BrushUpSuggestion {
  category: string;
  question: string;
}

export interface BrushUpAnalysis {
  suggestions: BrushUpSuggestion[];
}
