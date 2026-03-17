"use client";

import { TimelineEntry } from '@/types/graph';
import { Clock, User } from 'lucide-react';

interface GraphTimelineProps {
  timeline: TimelineEntry[];
}

export default function GraphTimeline({ timeline }: GraphTimelineProps) {
  return (
    <div className="h-full overflow-y-auto p-6 bg-[#0b1426]">
      <div className="space-y-4">
        {timeline.map((entry, index) => (
          <div key={entry.message_id} className="relative pl-8">
            {/* Timeline line */}
            {index < timeline.length - 1 && (
              <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gray-700" />
            )}

            {/* Timeline dot */}
            <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-blue-500 border-2 border-[#0b1426]" />

            {/* Content */}
            <div className="bg-[#1e2f4d] rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-4 mb-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatTimestamp(entry.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span>{entry.user}</span>
                </div>
              </div>
              <p className="text-sm text-gray-200">{entry.short}</p>
            </div>
          </div>
        ))}
      </div>

      {timeline.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Clock size={48} className="mb-4" />
          <p>タイムラインデータがありません</p>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
