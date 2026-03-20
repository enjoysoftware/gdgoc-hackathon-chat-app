// Extract #problemX mentions from text
export function extractMentions(text: string): string[] {
  const matches = text.match(/#(problem\w+)/gi) || [];
  return [...new Set(matches.map(m => m.slice(1).toLowerCase()))]; // dedupe and normalize
}

// Parse message text and return array of text parts and mention objects
export interface MentionPart {
  type: 'mention';
  problemId: string;
}

export type MessagePart = string | MentionPart;

export function parseMessageWithMentions(text: string): MessagePart[] {
  const parts: MessagePart[] = [];
  const regex = /#(problem\w+)/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add clickable mention tag
    parts.push({
      type: 'mention',
      problemId: match[1].toLowerCase()
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
