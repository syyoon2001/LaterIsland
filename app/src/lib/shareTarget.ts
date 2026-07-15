// Handles the Web Share Target entry point ("/share-target?title=&text=&url=",
// declared in vite.config.ts's manifest.share_target). Android routes a share
// here as a normal GET navigation, which the SPA fallback (vercel.json +
// the service worker's navigateFallback) serves like any other route.
//
// Parsed once at module load (before React/auth/cover-screen logic runs) so
// the value survives however long the user takes to get past the cover/auth
// screens, and the URL bar is cleaned up immediately so a later reload never
// reprocesses the same share.
export interface ShareTargetData {
  title: string;
  text: string;
  url: string;
}

function extractUrlFromText(text: string): string {
  const match = text.match(/https?:\/\/\S+/);
  return match ? match[0] : '';
}

function readShareTarget(): ShareTargetData | null {
  if (window.location.pathname !== '/share-target') return null;
  const params = new URLSearchParams(window.location.search);
  const title = params.get('title') || '';
  const text = params.get('text') || '';
  const url = params.get('url') || extractUrlFromText(text);
  if (!title && !text && !url) return null;
  return { title, text, url };
}

let pendingShareTarget: ShareTargetData | null = readShareTarget();

if (pendingShareTarget) {
  window.history.replaceState(null, '', '/');
}

// Returns the pending share (if any) and clears it, so it's only ever
// applied once, on whichever screen first mounts after the share arrives.
export function consumeShareTarget(): ShareTargetData | null {
  const data = pendingShareTarget;
  pendingShareTarget = null;
  return data;
}
