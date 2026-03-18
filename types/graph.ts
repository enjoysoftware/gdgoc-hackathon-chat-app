// Input schema for graph analysis API
export interface AnalyzeProblemRequest {
  problem_id: string;
  messages: ProblemMessage[];
}

export interface ProblemMessage {
  id: string;
  text: string;
  timestamp: string; // ISO8601
  user: string;
  mentions: string[];
  channel: string;
}

// Output schema for graph analysis API
export interface GraphAnalysisResponse {
  problem_id: string;
  method: 'heuristic' | 'ml';
  summary: string;
  tags: GraphTag[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  timeline: TimelineEntry[];
  renderHints: RenderHints;
}

export interface GraphTag {
  tag: string;
  label: string;
  count: number;
  touchLabel: string;
  color: string; // 6-digit hex
}

export type NodeType = 'symptom' | 'cause' | 'hypothesis' | 'action' | 'state' | 'info';

export interface GraphNode {
  id: string;
  source_message_id: string | null;
  type: NodeType;
  label: string;
  timestamp: string | null;
  user: string | null;
  tags: string[];
  confidence: number; // 0.0-1.0
  renderHint: RenderHint;
}

export interface RenderHint {
  shape: 'rect' | 'ellipse';
  color: string; // hex
  size: 'small' | 'medium' | 'large';
}

export type RelationType = 'cause' | 'correlate' | 'leads_to' | 'duplicate';

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  relation: RelationType;
  confidence: number;
  explain: string;
}

export interface TimelineEntry {
  timestamp: string;
  message_id: string;
  short: string;
  user: string;
}

export interface RenderHints {
  layout: 'time-left-to-right' | 'force';
  initialVisibleTags: string[];
  reactFlowNodes?: ReactFlowNodePosition[];
}

export interface ReactFlowNodePosition {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
}
