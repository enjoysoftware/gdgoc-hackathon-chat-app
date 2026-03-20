export interface BrushUpSuggestion {
  category: string;
  question: string;
}

export interface BrushUpAnalysis {
  suggestions: BrushUpSuggestion[];
}

export interface BrushUpReview {
  title: string;
  description: string;
}

export interface BrushUpReviewResponse {
  reviews: BrushUpReview[];
}
