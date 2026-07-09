/**
 * Extract YouTube video ID from common URL formats.
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function getYouTubeEmbedUrl(urlOrId) {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}

export function getYouTubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function isValidYouTubeUrl(url) {
  return Boolean(extractYouTubeId(url));
}

