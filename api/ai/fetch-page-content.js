import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { link } = req.body || {};

  if (!link || typeof link !== 'string') {
    return res.status(400).json({ error: 'Bad Request. Provide a valid link.' });
  }

  // Prepend https:// if missing to ensure fetch works
  let targetUrl = link.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch page: ${response.status} ${response.statusText}`,
        blocked: response.status === 403 || response.status === 401 || response.status === 429
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic metadata
    const title = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

    // Remove unwanted elements
    $('script, style, noscript, iframe, img, svg, nav, footer, header, aside, .ad, .advertisement').remove();

    // Try to find the main content, fallback to body
    let mainContent = $('article').text() || $('main').text();
    if (!mainContent.trim()) {
      mainContent = $('body').text();
    }

    // Clean up whitespace
    let extractedText = mainContent.replace(/\s+/g, ' ').trim();
    
    // Prepend description for better context if available
    if (description) {
      extractedText = `Description: ${description}\n\n${extractedText}`;
    }

    // Truncate to 3000 chars to save tokens and speed up Gemini response
    if (extractedText.length > 3000) {
      extractedText = extractedText.substring(0, 3000);
    }

    return res.status(200).json({ title, extractedText });
  } catch (error) {
    console.error('fetch-page-content error:', error);
    return res.status(502).json({ 
      error: 'Failed to crawl the provided link.',
      details: error.message 
    });
  }
}
