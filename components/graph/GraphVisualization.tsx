"use client";

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GraphNode, GraphEdge, RenderHints, RelationType } from '@/types/graph';

interface GraphVisualizationProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  renderHints?: RenderHints;
  onNodeClick?: (nodeId: string) => void;
}

// Custom node component
function CustomGraphNode({ data }: NodeProps) {
  const { nodeType, label, confidence, renderHint } = data;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-lg ${getNodeStyles(nodeType, renderHint)}`}
      style={{ minWidth: '150px', maxWidth: '220px' }}
    >
      <div className="text-xs font-bold text-white mb-1 uppercase">{nodeType}</div>
      <div className="text-sm text-gray-200 leading-tight">{label}</div>
      <div className="text-[10px] text-gray-400 mt-2">
        信頼度: {(confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}

function getNodeStyles(type: string, hint?: any): string {
  const baseStyles: Record<string, string> = {
    symptom: 'bg-red-900/30 border-red-500',
    cause: 'bg-orange-900/30 border-orange-500',
    hypothesis: 'bg-purple-900/30 border-purple-500',
    action: 'bg-blue-900/30 border-blue-500',
    state: 'bg-green-900/30 border-green-500',
    info: 'bg-gray-900/30 border-gray-500'
  };

  return baseStyles[type] || baseStyles.info;
}

function getEdgeColor(relation: RelationType): string {
  const colors: Record<RelationType, string> = {
    cause: '#e74c3c',
    correlate: '#95a5a6',
    leads_to: '#3498db',
    duplicate: '#9b59b6'
  };

  return colors[relation] || '#95a5a6';
}

export default function GraphVisualization({
  nodes,
  edges,
  renderHints,
  onNodeClick
}: GraphVisualizationProps) {
  // Convert GraphNode to ReactFlow Node format
  const flowNodes: Node[] = nodes.map(node => {
    const position = renderHints?.reactFlowNodes?.find(n => n.id === node.id)?.position || { x: 0, y: 0 };

    return {
      id: node.id,
      type: 'custom',
      position,
      data: {
        label: node.label,
        nodeType: node.type,
        confidence: node.confidence,
        tags: node.tags,
        user: node.user,
        timestamp: node.timestamp,
        renderHint: node.renderHint
      }
    };
  });

  // Convert GraphEdge to ReactFlow Edge format
  const flowEdges: Edge[] = edges.map(edge => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    label: edge.explain,
    type: 'smoothstep',
    animated: edge.confidence > 0.7,
    style: {
      stroke: getEdgeColor(edge.relation),
      strokeWidth: 2
    },
    labelStyle: {
      fill: '#fff',
      fontSize: 10
    },
    labelBgStyle: {
      fill: '#1e2f4d',
      fillOpacity: 0.8
    }
  }));

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  const nodeTypes = {
    custom: CustomGraphNode
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#0b1426]"
        minZoom={0.1}
        maxZoom={2}
      >
        <Controls className="bg-[#1e2f4d] border border-gray-700 text-white [&_button]:bg-[#1e2f4d] [&_button]:border-gray-700 [&_button:hover]:bg-[#2a3f5f]" />
        <Background color="#1e2f4d" gap={16} className="bg-[#0b1426]" />
        <MiniMap
          nodeColor={(node) => {
            const nodeType = node.data?.nodeType || 'info';
            const colors: Record<string, string> = {
              symptom: '#e74c3c',
              cause: '#f39c12',
              hypothesis: '#9b59b6',
              action: '#3498db',
              state: '#2ecc71',
              info: '#95a5a6'
            };
            return colors[nodeType] || colors.info;
          }}
          className="bg-[#1e2f4d] border border-gray-700"
          maskColor="rgba(11, 20, 38, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}
