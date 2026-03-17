"use client";

import { useState } from 'react';
import { X, Hash } from 'lucide-react';
import { GraphAnalysisResponse } from '@/types/graph';
import GraphVisualization from './GraphVisualization';
import GraphTimeline from './GraphTimeline';

interface GraphPanelProps {
  isOpen: boolean;
  onClose: () => void;
  graphData: GraphAnalysisResponse;
  channelId: string;
}

export default function GraphPanel({
  isOpen,
  onClose,
  graphData,
  channelId
}: GraphPanelProps) {
  const [activeTab, setActiveTab] = useState<'graph' | 'timeline'>('graph');

  return (
    <div
      className={`fixed right-0 top-0 h-screen w-[600px] bg-[#0b1426] border-l border-gray-800
                   transform transition-transform duration-300 z-50 flex flex-col
                   ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Hash size={18} className="text-blue-400" />
          <h2 className="text-white font-bold">問題分析: {graphData.problem_id}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 py-3 bg-[#1e2f4d] border-b border-gray-800 flex-shrink-0">
        <p className="text-sm text-gray-300 mb-2">{graphData.summary}</p>
        <div className="flex flex-wrap gap-2">
          {graphData.tags.map(tag => (
            <span
              key={tag.tag}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: `${tag.color}20`,
                borderColor: tag.color,
                borderWidth: '1px',
                color: tag.color
              }}
            >
              {tag.touchLabel}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 flex-shrink-0">
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'graph'
              ? 'border-b-2 border-blue-500 text-white bg-[#1e2f4d]/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
          }`}
        >
          グラフ
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'timeline'
              ? 'border-b-2 border-blue-500 text-white bg-[#1e2f4d]/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
          }`}
        >
          タイムライン
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'graph' ? (
          <GraphVisualization
            nodes={graphData.nodes}
            edges={graphData.edges}
            renderHints={graphData.renderHints}
          />
        ) : (
          <GraphTimeline timeline={graphData.timeline} />
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-500 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span>分析方法: {graphData.method === 'heuristic' ? 'ヒューリスティック' : 'ML'}</span>
          <span>
            {graphData.nodes.length}個のノード・{graphData.edges.length}個のエッジ
          </span>
        </div>
      </div>
    </div>
  );
}
