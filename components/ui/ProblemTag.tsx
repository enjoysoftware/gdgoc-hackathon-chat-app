import { Hash } from 'lucide-react';

interface ProblemTagProps {
  problemId: string;
  onClick: (problemId: string) => void;
}

export default function ProblemTag({ problemId, onClick }: ProblemTagProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling
        onClick(problemId);
      }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600/20
                 border border-blue-500/50 text-blue-400 hover:bg-blue-600/30
                 transition-colors text-sm font-medium cursor-pointer"
    >
      <Hash size={12} />
      {problemId}
    </button>
  );
}
