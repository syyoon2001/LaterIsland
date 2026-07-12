import { generateEmbedding } from '../lib/ai-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { text } = req.body || {};

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Bad Request. Provide a valid text string.' });
  }

  try {
    const embeddingData = await generateEmbedding(text);
    return res.status(200).json(embeddingData);
  } catch (error) {
    console.error('generate-embedding error:', error);
    return res.status(502).json({ 
      error: 'Failed to generate embedding from AI provider.',
      details: error.message 
    });
  }
}
