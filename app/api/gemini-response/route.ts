import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  console.log('Request received at /api/gemini-response');
  const { prompt, mode } = await request.json();
  const isDetailReview = mode === 'detail_review';
  const apiKey = isDetailReview
    ? process.env.GEMINI_REVIEW_API_KEY
    : process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const missingKeyName = isDetailReview ? 'GEMINI_REVIEW_API_KEY' : 'GEMINI_API_KEY';
    console.error(`${missingKeyName} is not set`);
    return new Response(`${missingKeyName} is not set`, { status: 500 });
  }

  console.log('Prompt:', prompt);
  if (!prompt || typeof prompt !== 'string') {
    return new Response('Invalid request: prompt is required', { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview'} );

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(prompt);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
      } catch (error) {
        console.error('Stream Error:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
