const YOUTUBE_HOSTS = new Set(['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be']);

// Parses a YouTube URL (watch, youtu.be short link, shorts, embed, live) and
// returns its video ID, or null if the link isn't a recognizable YouTube URL.
export function extractYoutubeVideoId(link) {
  if (!link || typeof link !== 'string') return null;

  let url;
  try {
    url = new URL(link.trim());
  } catch {
    try {
      url = new URL(`https://${link.trim()}`);
    } catch {
      return null;
    }
  }

  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id || null;
  }

  const vParam = url.searchParams.get('v');
  if (vParam) return vParam;

  const pathMatch = url.pathname.match(/\/(shorts|embed|live)\/([^/?]+)/);
  if (pathMatch) return pathMatch[2];

  return null;
}

export function isYoutubeUrl(link) {
  return extractYoutubeVideoId(link) !== null;
}

// Fetches a video's title/description via the YouTube Data API (videos.list,
// part=snippet). YOUTUBE_API_KEY is read from process.env here only — never
// pass it to, or read it from, client-side code.
export async function fetchYoutubeVideoInfo(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY environment variable is not set.');
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(videoId)}&key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`YouTube API request failed: ${response.status} ${response.statusText}${errBody ? ` - ${errBody}` : ''}`);
  }

  const data = await response.json();
  const item = data.items && data.items[0];
  if (!item) {
    throw new Error('YouTube video not found. It may be private, deleted, or the link is invalid.');
  }

  const { title, description } = item.snippet || {};
  return { title: title || '', description: description || '' };
}
