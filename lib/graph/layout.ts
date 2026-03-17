import { GraphNode, ReactFlowNodePosition } from '@/types/graph';

// Calculate layout positions for graph nodes
export function calculateLayout(
  nodes: GraphNode[],
  layoutType: 'time-left-to-right' | 'force'
): ReactFlowNodePosition[] {
  if (layoutType === 'time-left-to-right') {
    return calculateTimeBasedLayout(nodes);
  }
  // Force layout not implemented in MVP
  return calculateTimeBasedLayout(nodes);
}

// Time-based horizontal layout
function calculateTimeBasedLayout(nodes: GraphNode[]): ReactFlowNodePosition[] {
  // Sort nodes by timestamp
  const sortedNodes = [...nodes].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeA - timeB;
  });

  // Group nodes by type for vertical staggering
  const typeYOffsets: Record<string, number> = {
    symptom: 0,
    cause: 120,
    hypothesis: 240,
    action: 360,
    state: 480,
    info: 600
  };

  // Calculate positions
  const positions: ReactFlowNodePosition[] = [];
  const xSpacing = 250; // horizontal spacing between nodes
  const yVariation = 40; // random variation to avoid overlap

  sortedNodes.forEach((node, index) => {
    const baseY = typeYOffsets[node.type] || 0;

    // Add some variation to avoid perfect alignment
    const yOffset = (index % 3) * yVariation - yVariation;

    positions.push({
      id: node.id,
      position: {
        x: index * xSpacing + 50, // 50px left margin
        y: baseY + yOffset
      },
      data: {
        label: node.label
      }
    });
  });

  return positions;
}
