import { NextResponse } from 'next/server';
import {
  AnalyzeProblemRequest,
  GraphAnalysisResponse
} from '@/types/graph';
import {
  classifyNodeType,
  calculateConfidence,
  inferEdges,
  extractTags,
  extractMessageTags,
  buildTimeline,
  generateSummary,
  generateRenderHint
} from '@/lib/graph/analyzer';
import { calculateLayout } from '@/lib/graph/layout';

export async function POST(request: Request) {
  try {
    const body: AnalyzeProblemRequest = await request.json();

    // Validate input
    if (!body.problem_id || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request schema' },
        { status: 400 }
      );
    }

    if (body.messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Build nodes
    const nodes = body.messages.map(msg => {
      const type = classifyNodeType(msg);
      return {
        id: `node-${msg.id}`,
        source_message_id: msg.id,
        type,
        label: msg.text.length > 100 ? msg.text.slice(0, 97) + '...' : msg.text,
        timestamp: msg.timestamp,
        user: msg.user,
        tags: extractMessageTags(msg),
        confidence: calculateConfidence(msg, type),
        renderHint: generateRenderHint(type)
      };
    });

    // Build edges, tags, timeline
    const edges = inferEdges(nodes, body.messages);
    const tags = extractTags(body.messages);
    const timeline = buildTimeline(body.messages);
    const summary = generateSummary(nodes, tags);

    // Calculate layout
    const reactFlowNodes = calculateLayout(nodes, 'time-left-to-right');

    const response: GraphAnalysisResponse = {
      problem_id: body.problem_id,
      method: 'heuristic',
      summary,
      tags,
      nodes,
      edges,
      timeline,
      renderHints: {
        layout: 'time-left-to-right',
        initialVisibleTags: tags.slice(0, 3).map(t => t.tag),
        reactFlowNodes
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
