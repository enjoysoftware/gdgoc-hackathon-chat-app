import {
  ProblemMessage,
  GraphNode,
  GraphEdge,
  GraphTag,
  TimelineEntry,
  NodeType,
  RenderHint,
  RelationType
} from '@/types/graph';
import { NODE_TYPE_KEYWORDS, CAUSALITY_KEYWORDS, TECH_KEYWORDS } from './keywords';

// Classify message into node type based on keyword matching
export function classifyNodeType(message: ProblemMessage): NodeType {
  const text = message.text.toLowerCase();
  const scores: Record<NodeType, number> = {
    symptom: 0,
    cause: 0,
    hypothesis: 0,
    action: 0,
    state: 0,
    info: 0
  };

  // Count keyword matches for each type
  for (const [type, keywords] of Object.entries(NODE_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        scores[type as NodeType]++;
      }
    }
  }

  // Find type with highest score
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'info'; // default

  const topType = Object.entries(scores).find(([, score]) => score === maxScore)?.[0];
  return (topType as NodeType) || 'info';
}

// Calculate confidence score for a node
export function calculateConfidence(message: ProblemMessage, type: NodeType): number {
  let score = 0.5; // baseline
  const text = message.text.toLowerCase();

  // Count matching keywords
  const keywords = NODE_TYPE_KEYWORDS[type];
  const matchedKeywords = keywords.filter(kw =>
    text.includes(kw.toLowerCase())
  );

  // +0.1 per matched keyword (max 0.3)
  score += Math.min(matchedKeywords.length * 0.1, 0.3);

  // Boost if multiple @problem mentions
  const mentionCount = (message.text.match(/@problem\w+/gi) || []).length;
  if (mentionCount > 1) score += 0.1;

  // Boost if contains code block
  if (message.text.includes('```')) score += 0.1;

  // Boost if question mark present (for hypothesis)
  if (type === 'hypothesis' && message.text.includes('?')) score += 0.1;

  // Boost if exclamation mark (for symptom/action)
  if ((type === 'symptom' || type === 'action') && message.text.includes('!')) score += 0.05;

  return Math.min(score, 1.0);
}

// Generate render hint based on node type
export function generateRenderHint(nodeType: NodeType): RenderHint {
  const hints: Record<NodeType, RenderHint> = {
    symptom: { shape: 'rect', color: '#e74c3c', size: 'medium' },
    cause: { shape: 'rect', color: '#f39c12', size: 'medium' },
    hypothesis: { shape: 'ellipse', color: '#9b59b6', size: 'small' },
    action: { shape: 'rect', color: '#3498db', size: 'medium' },
    state: { shape: 'rect', color: '#2ecc71', size: 'medium' },
    info: { shape: 'rect', color: '#95a5a6', size: 'small' }
  };

  return hints[nodeType];
}

// Extract tags from a single message
export function extractMessageTags(message: ProblemMessage): string[] {
  const tags: string[] = [];
  const text = message.text;

  // Extract hashtags
  const hashtags = text.match(/#(\w+)/g) || [];
  tags.push(...hashtags.map(tag => tag.slice(1)));

  // Extract technical terms
  for (const term of TECH_KEYWORDS) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(text)) {
      tags.push(term);
    }
  }

  return [...new Set(tags)]; // dedupe
}

// Extract tags from all messages with counts
export function extractTags(messages: ProblemMessage[]): GraphTag[] {
  const tagCounts = new Map<string, number>();

  messages.forEach(msg => {
    // Extract hashtags
    const hashtags = msg.text.match(/#(\w+)/g) || [];
    hashtags.forEach(tag => {
      const cleaned = tag.slice(1);
      tagCounts.set(cleaned, (tagCounts.get(cleaned) || 0) + 1);
    });

    // Extract technical terms
    for (const term of TECH_KEYWORDS) {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(msg.text)) {
        tagCounts.set(term, (tagCounts.get(term) || 0) + 1);
      }
    }
  });

  // Sort by count and take top 10
  const sortedTags = Array.from(tagCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return sortedTags.map(([tag, count]) => ({
    tag,
    label: tag,
    count,
    touchLabel: `${tag} (${count})`,
    color: generateTagColor(tag)
  }));
}

// Generate color for tag based on hash
function generateTagColor(tag: string): string {
  const colors = [
    '#f39c12', '#e74c3c', '#9b59b6', '#3498db',
    '#1abc9c', '#2ecc71', '#f1c40f', '#e67e22'
  ];
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Build timeline from messages
export function buildTimeline(messages: ProblemMessage[]): TimelineEntry[] {
  const sorted = [...messages].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return sorted.map(msg => ({
    timestamp: msg.timestamp,
    message_id: msg.id,
    short: msg.text.length > 100 ? msg.text.slice(0, 97) + '...' : msg.text,
    user: msg.user
  }));
}

// Detect relation type between two nodes
function detectRelation(
  nodeA: GraphNode,
  nodeB: GraphNode,
  messagesMap: Map<string, ProblemMessage>
): { type: RelationType; confidence: number; explain: string } | null {
  const msgB = messagesMap.get(nodeB.source_message_id || '');
  if (!msgB) return null;

  const bText = msgB.text.toLowerCase();

  // Check for causality keywords
  for (const [relType, keywords] of Object.entries(CAUSALITY_KEYWORDS)) {
    const match = keywords.find(kw => bText.includes(kw.toLowerCase()));
    if (match) {
      return {
        type: relType as RelationType,
        confidence: 0.7,
        explain: `"${match}"キーワードによる関連`
      };
    }
  }

  // Time-based correlation (within 5 minutes, same user)
  if (nodeA.timestamp && nodeB.timestamp) {
    const timeDiff = Math.abs(
      new Date(nodeB.timestamp).getTime() - new Date(nodeA.timestamp).getTime()
    );
    if (timeDiff < 5 * 60 * 1000 && nodeA.user === nodeB.user) {
      return {
        type: 'correlate',
        confidence: 0.5,
        explain: '短時間内の連続投稿'
      };
    }
  }

  // Type-based causality (symptom -> cause, cause -> action, etc.)
  if (nodeA.type === 'symptom' && nodeB.type === 'cause') {
    return {
      type: 'cause',
      confidence: 0.6,
      explain: '症状と原因の関係'
    };
  }
  if (nodeA.type === 'cause' && nodeB.type === 'action') {
    return {
      type: 'leads_to',
      confidence: 0.6,
      explain: '原因から対応への流れ'
    };
  }
  if (nodeA.type === 'action' && nodeB.type === 'state') {
    return {
      type: 'leads_to',
      confidence: 0.6,
      explain: '対応から完了への流れ'
    };
  }

  return null;
}

// Infer edges between nodes
export function inferEdges(
  nodes: GraphNode[],
  messages: ProblemMessage[]
): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const messagesMap = new Map(messages.map(m => [m.id, m]));

  // Sort nodes by timestamp
  const sortedNodes = [...nodes]
    .filter(n => n.timestamp)
    .sort((a, b) =>
      new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
    );

  // Check consecutive nodes
  for (let i = 0; i < sortedNodes.length - 1; i++) {
    const current = sortedNodes[i];
    const next = sortedNodes[i + 1];

    const relation = detectRelation(current, next, messagesMap);

    if (relation) {
      edges.push({
        id: `edge-${current.id}-${next.id}`,
        from: current.id,
        to: next.id,
        relation: relation.type,
        confidence: relation.confidence,
        explain: relation.explain
      });
    }
  }

  // Also check non-consecutive nodes with high keyword overlap
  for (let i = 0; i < sortedNodes.length; i++) {
    for (let j = i + 2; j < sortedNodes.length && j < i + 5; j++) {
      const nodeA = sortedNodes[i];
      const nodeB = sortedNodes[j];

      // Check for shared tags
      const sharedTags = nodeA.tags.filter(tag => nodeB.tags.includes(tag));
      if (sharedTags.length >= 2) {
        edges.push({
          id: `edge-${nodeA.id}-${nodeB.id}`,
          from: nodeA.id,
          to: nodeB.id,
          relation: 'correlate',
          confidence: 0.4 + sharedTags.length * 0.1,
          explain: `共通タグ: ${sharedTags.join(', ')}`
        });
      }
    }
  }

  return edges;
}

// Generate summary
export function generateSummary(nodes: GraphNode[], tags: GraphTag[]): string {
  const typeCounts = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<NodeType, number>);

  const topTags = tags.slice(0, 3).map(t => t.tag).join('、');
  const symptomCount = typeCounts.symptom || 0;
  const causeCount = typeCounts.cause || 0;
  const actionCount = typeCounts.action || 0;

  let summary = '';

  if (symptomCount > 0) {
    summary += `${symptomCount}件の症状`;
  }
  if (causeCount > 0) {
    summary += summary ? `、${causeCount}件の原因` : `${causeCount}件の原因`;
  }
  if (actionCount > 0) {
    summary += summary ? `、${actionCount}件の対応` : `${actionCount}件の対応`;
  }
  if (topTags) {
    summary += summary ? `。主要タグ: ${topTags}` : `主要タグ: ${topTags}`;
  }

  // Truncate to 120 chars if needed
  if (summary.length > 120) {
    summary = summary.slice(0, 117) + '...';
  }

  return summary || '問題の分析結果';
}
