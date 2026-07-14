import { generateMetadata } from '../lib/ai-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { title, summary, link, existingTags, outputLanguage } = req.body || {};

  // Require at least one of the inputs to generate metadata
  if (!title && !summary && !link) {
    return res.status(400).json({ error: 'Bad Request. Provide at least title, summary, or link.' });
  }

  try {
    const metadata = await generateMetadata({ title, summary, link, existingTags, outputLanguage });
    return res.status(200).json(metadata);
  } catch (error) {
    console.error('generate-metadata error:', error);
    return res.status(502).json({ 
      error: 'Failed to generate metadata from AI provider.',
      details: error.message 
    });
  }
}
