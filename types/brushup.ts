export type SuggestionCategory = 'why' | 'what' | 'who' | 'when' | 'where' | 'how';

export interface BrushUpSuggestion {
  category: SuggestionCategory;
  label: string;
  question: string;
  isPresent: boolean;
}

export interface BrushUpAnalysis {
  summary: string;
  suggestions: BrushUpSuggestion[];
}
